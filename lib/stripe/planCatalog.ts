export type PlanTier = 'starter' | 'growth' | 'pro';
export type BillingCycle = 'monthly' | 'yearly';

export interface StripePlan {
  tier: PlanTier;
  name: string;
  description: string;
  productId: string;
  monthly: {
    priceId: string;
    amountEur: number;
  };
  yearly: {
    priceId: string;
    amountEur: number;
  };
}

export const YEARLY_DISCOUNT_PERCENT = 15;

export const STRIPE_PLANS: StripePlan[] = [
  {
    tier: 'starter',
    name: 'Starter',
    description: 'Best for solo professionals getting started.',
    productId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_STARTER ||
      'prod_Ux4k7sMcf40CsK',
    monthly: {
      priceId:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY ||
        'price_1TxAah2MU343GzaATAMAPmQc',
      amountEur: 6.99,
    },
    yearly: {
      priceId:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY ||
        'price_1TxAcw2MU343GzaAsRY7gy5A',
      amountEur: 71.3,
    },
  },
  {
    tier: 'growth',
    name: 'Growth',
    description: 'For growing businesses that need more automation.',
    productId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_GROWTH ||
      'prod_Ux4oflnWnqXzBe',
    monthly: {
      priceId:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTHLY ||
        'price_1TxAfJ2MU343GzaAeu7xBYto',
      amountEur: 13.99,
    },
    yearly: {
      priceId:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_YEARLY ||
        'price_1TxAfe2MU343GzaAE3CXv8L1',
      amountEur: 142.7,
    },
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'For high-volume teams that want full control.',
    productId:
      process.env.NEXT_PUBLIC_STRIPE_PRODUCT_PRO ||
      'prod_Ux4pYeDD4629jj',
    monthly: {
      priceId:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ||
        'price_1TxAg62MU343GzaAp1wkA0Ah',
      amountEur: 24.99,
    },
    yearly: {
      priceId:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY ||
        'price_1TxAgb2MU343GzaAznTKXTKg',
      amountEur: 254.9,
    },
  },
];

export function getAllPlanPriceIds() {
  return STRIPE_PLANS.flatMap((plan) => [plan.monthly.priceId, plan.yearly.priceId]);
}

export function getDefaultPlanPriceId() {
  return STRIPE_PLANS[0]?.monthly.priceId || '';
}

export function getPlanByPriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }
  return STRIPE_PLANS.find(
    (plan) => plan.monthly.priceId === priceId || plan.yearly.priceId === priceId
  ) || null;
}
