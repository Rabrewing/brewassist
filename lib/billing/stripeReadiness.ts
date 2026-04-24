export type StripeEnvKey =
  | 'STRIPE_SECRET_KEY'
  | 'STRIPE_WEBHOOK_SECRET'
  | 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  | 'STRIPE_PRICE_STARTER_MONTHLY'
  | 'STRIPE_PRICE_STARTER_YEARLY'
  | 'STRIPE_PRICE_PRO_MONTHLY'
  | 'STRIPE_PRICE_PRO_YEARLY'
  | 'STRIPE_PRICE_TEAM_MONTHLY'
  | 'STRIPE_PRICE_TEAM_YEARLY';

export type StripeReadinessSummary = {
  ready: boolean;
  mode: 'unconfigured' | 'partial' | 'configured';
  missing: StripeEnvKey[];
  configured: StripeEnvKey[];
  portalReady: boolean;
  checkoutReady: boolean;
  webhookReady: boolean;
  pricesReady: boolean;
  reason: string;
};

const REQUIRED_KEYS: StripeEnvKey[] = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_PRICE_STARTER_MONTHLY',
  'STRIPE_PRICE_STARTER_YEARLY',
  'STRIPE_PRICE_PRO_MONTHLY',
  'STRIPE_PRICE_PRO_YEARLY',
  'STRIPE_PRICE_TEAM_MONTHLY',
  'STRIPE_PRICE_TEAM_YEARLY',
];

function hasEnvValue(key: string) {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

export function getStripeReadinessSummary(): StripeReadinessSummary {
  const configured = REQUIRED_KEYS.filter((key) => hasEnvValue(key));
  const missing = REQUIRED_KEYS.filter((key) => !configured.includes(key));
  const pricesReady =
    hasEnvValue('STRIPE_PRICE_STARTER_MONTHLY') &&
    hasEnvValue('STRIPE_PRICE_STARTER_YEARLY') &&
    hasEnvValue('STRIPE_PRICE_PRO_MONTHLY') &&
    hasEnvValue('STRIPE_PRICE_PRO_YEARLY') &&
    hasEnvValue('STRIPE_PRICE_TEAM_MONTHLY') &&
    hasEnvValue('STRIPE_PRICE_TEAM_YEARLY');
  const checkoutReady =
    hasEnvValue('STRIPE_SECRET_KEY') &&
    hasEnvValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') &&
    pricesReady;
  const portalReady = hasEnvValue('STRIPE_SECRET_KEY');
  const webhookReady =
    hasEnvValue('STRIPE_SECRET_KEY') && hasEnvValue('STRIPE_WEBHOOK_SECRET');

  let mode: StripeReadinessSummary['mode'] = 'configured';
  if (configured.length === 0) {
    mode = 'unconfigured';
  } else if (missing.length > 0) {
    mode = 'partial';
  }

  let reason = 'Stripe checkout, portal, pricing, and webhooks are configured.';

  if (mode === 'unconfigured') {
    reason =
      'Stripe is not configured yet. Live subscriptions, credits, invoices, and billing portal access should remain disabled.';
  } else if (mode === 'partial') {
    reason =
      'Stripe is partially configured. Keep billing read-only until checkout, portal, webhook verification, and price mapping are complete.';
  }

  return {
    ready: missing.length === 0,
    mode,
    missing,
    configured,
    portalReady,
    checkoutReady,
    webhookReady,
    pricesReady,
    reason,
  };
}
