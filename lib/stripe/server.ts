import 'server-only';

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  return key;
}

export function getStripeClient() {
  if (stripeClient) {
    return stripeClient;
  }

  stripeClient = new Stripe(getSecretKey());
  return stripeClient;
}

export function getStripeWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }
  return secret;
}

export function getDefaultStripePriceId() {
  return (
    process.env.STRIPE_PRICE_PRO_MONTHLY ||
    process.env.STRIPE_PRICE_ID ||
    ''
  );
}

export function getOptionalTrialDays() {
  const raw = process.env.STRIPE_TRIAL_DAYS;
  if (!raw) {
    return null;
  }

  const days = Number(raw);
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }

  return Math.floor(days);
}

export function toIsoFromUnixTimestamp(timestamp?: number | null) {
  if (!timestamp) {
    return null;
  }
  return new Date(timestamp * 1000).toISOString();
}
