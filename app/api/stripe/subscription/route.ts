import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrThrow, unauthorizedResponse } from '@/lib/security/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { STRIPE_PLANS, YEARLY_DISCOUNT_PERCENT, getAllPlanPriceIds } from '@/lib/stripe/planCatalog';

export async function GET(request: NextRequest) {
  try {
    let user;
    try {
      user = await getAuthenticatedUserOrThrow(request);
    } catch {
      return unauthorizedResponse('User not authenticated');
    }

    const adminSupabase = createAdminClient();
    const { data: profile, error } = await adminSupabase
      .from('profiles')
      .select(
        'stripe_customer_id, stripe_subscription_id, stripe_price_id, billing_status, billing_current_period_end, billing_cancel_at_period_end, trial_ends_at'
      )
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      subscription: {
        stripeCustomerId: (profile as any)?.stripe_customer_id || null,
        stripeSubscriptionId: (profile as any)?.stripe_subscription_id || null,
        stripePriceId: (profile as any)?.stripe_price_id || null,
        status: (profile as any)?.billing_status || 'free',
        currentPeriodEnd: (profile as any)?.billing_current_period_end || null,
        cancelAtPeriodEnd: Boolean((profile as any)?.billing_cancel_at_period_end),
        trialEndsAt: (profile as any)?.trial_ends_at || null,
      },
      env: {
        hasConfiguredPrice: getAllPlanPriceIds().length > 0,
      },
      plans: STRIPE_PLANS,
      yearlyDiscountPercent: YEARLY_DISCOUNT_PERCENT,
    });
  } catch (error: any) {
    console.error('[stripe/subscription] Unexpected error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
