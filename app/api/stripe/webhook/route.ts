import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getStripeClient,
  getStripeWebhookSecret,
  toIsoFromUnixTimestamp,
} from '@/lib/stripe/server';

export const runtime = 'nodejs';

type BillingStatus =
  | 'free'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

async function markEventAsProcessed(eventId: string, eventType: string) {
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('stripe_webhook_events')
    .insert({ event_id: eventId, event_type: eventType });

  if (!error) {
    return { alreadyProcessed: false };
  }

  if ((error as any).code === '23505') {
    return { alreadyProcessed: true };
  }

  throw error;
}

async function updateProfileFromSubscription(subscription: Stripe.Subscription) {
  const adminSupabase = createAdminClient();

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    throw new Error('Subscription event missing customer id');
  }

  const subscriptionId = subscription.id;
  const priceId = subscription.items.data[0]?.price?.id || null;
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end || null;
  const billingStatus = (subscription.status || 'free') as BillingStatus;

  const updatePayload = {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_price_id: priceId,
    billing_status: billingStatus,
    billing_current_period_end: toIsoFromUnixTimestamp(currentPeriodEnd),
    billing_cancel_at_period_end: subscription.cancel_at_period_end,
    trial_ends_at: toIsoFromUnixTimestamp(subscription.trial_end),
  };

  const { data: byCustomer, error: byCustomerError } = await adminSupabase
    .from('profiles')
    .update(updatePayload)
    .eq('stripe_customer_id', customerId)
    .select('id')
    .limit(1);

  if (byCustomerError) {
    throw byCustomerError;
  }

  if (byCustomer && byCustomer.length > 0) {
    return;
  }

  const metadataUserId = subscription.metadata?.supabase_user_id;
  if (!metadataUserId) {
    console.warn('[stripe/webhook] No matching profile by stripe_customer_id and no metadata user id', {
      customerId,
      subscriptionId,
    });
    return;
  }

  const { error: byUserIdError } = await adminSupabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', metadataUserId);

  if (byUserIdError) {
    throw byUserIdError;
  }
}

async function setBillingStatusFromInvoice(invoice: Stripe.Invoice, status: BillingStatus) {
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

  if (!customerId) {
    return;
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('profiles')
    .update({ billing_status: status })
    .eq('stripe_customer_id', customerId);

  if (error) {
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    const webhookSecret = getStripeWebhookSecret();

    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    console.error('[stripe/webhook] Signature verification failed:', error?.message || error);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    const processed = await markEventAsProcessed(event.id, event.type);
    if (processed.alreadyProcessed) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const stripe = getStripeClient();
          const subId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          await updateProfileFromSubscription(subscription);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateProfileFromSubscription(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await setBillingStatusFromInvoice(invoice, 'past_due');
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await setBillingStatusFromInvoice(invoice, 'active');
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[stripe/webhook] Handler error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
