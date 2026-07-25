-- Add Stripe billing/subscription fields to profiles and store processed webhook events

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS billing_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
ON public.profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id
ON public.profiles(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_billing_status
ON public.profiles(billing_status);

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer id for the authenticated user';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Latest Stripe subscription id for the authenticated user';
COMMENT ON COLUMN public.profiles.stripe_price_id IS 'Current Stripe price id for the authenticated user subscription';
COMMENT ON COLUMN public.profiles.billing_status IS 'Subscription lifecycle status: free, trialing, active, past_due, canceled, incomplete, unpaid';
COMMENT ON COLUMN public.profiles.billing_current_period_end IS 'End date/time of current billing period';
COMMENT ON COLUMN public.profiles.billing_cancel_at_period_end IS 'True when subscription is scheduled to cancel at period end';
COMMENT ON COLUMN public.profiles.trial_ends_at IS 'End date/time of current Stripe trial';

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Webhook events are internal server data. Keep client roles blocked.
DROP POLICY IF EXISTS stripe_webhook_events_no_select ON public.stripe_webhook_events;
DROP POLICY IF EXISTS stripe_webhook_events_no_insert ON public.stripe_webhook_events;
DROP POLICY IF EXISTS stripe_webhook_events_no_update ON public.stripe_webhook_events;
DROP POLICY IF EXISTS stripe_webhook_events_no_delete ON public.stripe_webhook_events;

CREATE POLICY stripe_webhook_events_no_select
  ON public.stripe_webhook_events
  FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY stripe_webhook_events_no_insert
  ON public.stripe_webhook_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY stripe_webhook_events_no_update
  ON public.stripe_webhook_events
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY stripe_webhook_events_no_delete
  ON public.stripe_webhook_events
  FOR DELETE
  TO anon, authenticated
  USING (false);

COMMENT ON TABLE public.stripe_webhook_events IS 'Processed Stripe webhook events for idempotency protection';
