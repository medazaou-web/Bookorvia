import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripeClient } from '@/lib/stripe/server';

interface PortalRequestBody {
  returnPath?: string;
}

export async function POST(request: NextRequest) {
  try {
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const body = (await request.json().catch(() => ({}))) as PortalRequestBody;

    const adminSupabase = createAdminClient();
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const stripeCustomerId = (profile as any).stripe_customer_id as string | null;
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Start a subscription first.' },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const returnPath = body.returnPath || '/dashboard/billing';
    const returnUrl = `${request.nextUrl.origin}${returnPath}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('[stripe/portal] Unexpected error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
