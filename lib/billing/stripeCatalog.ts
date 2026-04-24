export type StripePlanId = 'starter' | 'pro' | 'team';
export type StripeBillingInterval = 'monthly' | 'yearly';

type StripePlanConfig = {
  id: StripePlanId;
  label: string;
  stripePriceMonthlyEnv: string;
  stripePriceYearlyEnv: string;
  selfServe: boolean;
};

const STRIPE_PLANS: Record<StripePlanId, StripePlanConfig> = {
  starter: {
    id: 'starter',
    label: 'Starter',
    stripePriceMonthlyEnv: 'STRIPE_PRICE_STARTER_MONTHLY',
    stripePriceYearlyEnv: 'STRIPE_PRICE_STARTER_YEARLY',
    selfServe: true,
  },
  pro: {
    id: 'pro',
    label: 'Pro',
    stripePriceMonthlyEnv: 'STRIPE_PRICE_PRO_MONTHLY',
    stripePriceYearlyEnv: 'STRIPE_PRICE_PRO_YEARLY',
    selfServe: true,
  },
  team: {
    id: 'team',
    label: 'Team',
    stripePriceMonthlyEnv: 'STRIPE_PRICE_TEAM_MONTHLY',
    stripePriceYearlyEnv: 'STRIPE_PRICE_TEAM_YEARLY',
    selfServe: true,
  },
};

export function isStripePlanId(value: string): value is StripePlanId {
  return value === 'starter' || value === 'pro' || value === 'team';
}

export function resolveStripePlanPrice(
  planId: StripePlanId,
  interval: StripeBillingInterval
) {
  const plan = STRIPE_PLANS[planId];
  const envKey =
    interval === 'monthly'
      ? plan.stripePriceMonthlyEnv
      : plan.stripePriceYearlyEnv;
  const priceId = process.env[envKey]?.trim();

  if (!priceId) {
    throw new Error(`Missing Stripe price env: ${envKey}`);
  }

  return {
    plan,
    priceId,
    envKey,
  };
}

export function getStripePlanCatalog() {
  return Object.values(STRIPE_PLANS).map((plan) => ({
    id: plan.id,
    label: plan.label,
    selfServe: plan.selfServe,
    monthlyConfigured: Boolean(process.env[plan.stripePriceMonthlyEnv]?.trim()),
    yearlyConfigured: Boolean(process.env[plan.stripePriceYearlyEnv]?.trim()),
  }));
}
