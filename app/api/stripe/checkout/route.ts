import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getOptionalTrialDays, getStripeClient } from '@/lib/stripe/server';
import { getAllPlanPriceIds, getDefaultPlanPriceId } from '@/lib/stripe/planCatalog';

interface CheckoutRequestBody {
  priceId?: string;
  successPath?: string;
  cancelPath?: string;
}

export async function POST(request: NextRequest) {
  try {
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const body = (await request.json()) as CheckoutRequestBody;
    const priceId = body.priceId || getDefaultPlanPriceId();
    const allowedPriceIds = getAllPlanPriceIds();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Missing Stripe price id.' },
        { status: 400 }
      );
    }

    if (!allowedPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid Stripe price id selected.' },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const adminSupabase = createAdminClient();

    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let stripeCustomerId = (profile as any).stripe_customer_id as string | null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      const { error: updateProfileError } = await adminSupabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);

      if (updateProfileError) {
        console.error('[stripe/checkout] Failed to save stripe_customer_id:', updateProfileError.message);
      }
    }

    const origin = request.nextUrl.origin;
    const successPath = body.successPath || '/dashboard/billing?checkout=success';
    const cancelPath = body.cancelPath || '/dashboard/billing?checkout=canceled';

    const trialDays = getOptionalTrialDays();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}${successPath}`,
      cancel_url: `${origin}${cancelPath}`,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: trialDays
        ? {
            trial_period_days: trialDays,
            metadata: {
              supabase_user_id: user.id,
            },
          }
        : {
            metadata: {
              supabase_user_id: user.id,
            },
          },
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('[stripe/checkout] Unexpected error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
