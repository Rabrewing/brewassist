import { getStripeReadinessSummary } from '../../lib/billing/stripeReadiness';

const ORIGINAL_ENV = { ...process.env };

describe('stripe readiness summary', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    delete process.env.STRIPE_PRICE_STARTER_MONTHLY;
    delete process.env.STRIPE_PRICE_STARTER_YEARLY;
    delete process.env.STRIPE_PRICE_PRO_MONTHLY;
    delete process.env.STRIPE_PRICE_PRO_YEARLY;
    delete process.env.STRIPE_PRICE_TEAM_MONTHLY;
    delete process.env.STRIPE_PRICE_TEAM_YEARLY;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('reports unconfigured when Stripe env vars are absent', () => {
    const result = getStripeReadinessSummary();

    expect(result.ready).toBe(false);
    expect(result.mode).toBe('unconfigured');
    expect(result.checkoutReady).toBe(false);
    expect(result.missing).toContain('STRIPE_SECRET_KEY');
  });

  it('reports configured when all required Stripe env vars are present', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    process.env.STRIPE_PRICE_STARTER_MONTHLY = 'price_1';
    process.env.STRIPE_PRICE_STARTER_YEARLY = 'price_2';
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_3';
    process.env.STRIPE_PRICE_PRO_YEARLY = 'price_4';
    process.env.STRIPE_PRICE_TEAM_MONTHLY = 'price_5';
    process.env.STRIPE_PRICE_TEAM_YEARLY = 'price_6';

    const result = getStripeReadinessSummary();

    expect(result.ready).toBe(true);
    expect(result.mode).toBe('configured');
    expect(result.webhookReady).toBe(true);
    expect(result.pricesReady).toBe(true);
  });
});
