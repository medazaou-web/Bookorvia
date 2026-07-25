# Stripe Subscriptions Setup

This project now includes a first Stripe subscriptions integration with:
- Checkout session API: POST /api/stripe/checkout
- Billing portal API: POST /api/stripe/portal
- Subscription state API: GET /api/stripe/subscription
- Webhook sync API: POST /api/stripe/webhook
- Billing UI page: /dashboard/billing

## 1) Required environment variables

Add these to .env.local and your deployment environment:

```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_GROWTH_YEARLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxx

NEXT_PUBLIC_STRIPE_PRODUCT_STARTER=prod_xxx
NEXT_PUBLIC_STRIPE_PRODUCT_GROWTH=prod_xxx
NEXT_PUBLIC_STRIPE_PRODUCT_PRO=prod_xxx
```

Optional:

```
STRIPE_PRICE_ID=price_xxx
STRIPE_TRIAL_DAYS=14
NEXT_PUBLIC_BILLING_ENFORCED=false
```

Notes:
- Starter monthly is used as the default checkout price when no plan is selected.
- If NEXT_PUBLIC_BILLING_ENFORCED=true, non-paying dashboard users are redirected to /dashboard/billing (except support/settings/onboarding/billing).

## 2) Run the Supabase migration

Apply:
- supabase/migrations/006_add_billing_subscription_fields.sql

It adds billing fields to profiles and creates stripe_webhook_events for idempotency.

## 3) Configure Stripe webhook endpoint

Endpoint URL:
- https://YOUR_DOMAIN/api/stripe/webhook

Recommended events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed
- invoice.paid

## 4) Local webhook testing

Use Stripe CLI:

```
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the generated whsec_... value into STRIPE_WEBHOOK_SECRET.

## 5) Test flow

1. Open /dashboard/billing
2. Click Start Subscription
3. Complete checkout in Stripe
4. Confirm subscription status updates on billing page
5. Open Manage Subscription and verify portal works

## 6) Security and ownership model

- Authenticated user is required for checkout/portal/subscription routes.
- Webhook route uses Stripe signature verification.
- Webhook events are stored in stripe_webhook_events to avoid duplicate processing.
- Subscription state is stored on profiles for fast app access checks.
