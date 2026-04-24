import { createMocks } from 'node-mocks-http';

import handler from '../../pages/api/billing/checkout';

const createStripeCustomer = jest.fn();
const updateStripeCustomer = jest.fn();
const createStripeCheckoutSession = jest.fn();

jest.mock('@/lib/billing/stripe', () => ({
  createStripeCustomer: (...args: unknown[]) => createStripeCustomer(...args),
  updateStripeCustomer: (...args: unknown[]) => updateStripeCustomer(...args),
  createStripeCheckoutSession: (...args: unknown[]) =>
    createStripeCheckoutSession(...args),
  resolveAppUrl: jest.fn(() => 'http://localhost:3000'),
}));

jest.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: jest.fn(async () => ({
    id: 'user-1',
    email: 'owner@example.com',
    user_metadata: { full_name: 'Owner Example' },
  })),
  createSupabaseAdminClient: jest.fn(() => ({})),
}));

jest.mock('@/lib/console/controlPlane', () => ({
  resolveConsoleContext: jest.fn(async () => ({
    org: { id: 'org-1', name: 'Acme', plan: 'pro' },
    workspace: { id: 'ws-1', name: 'Default Workspace' },
  })),
}));

jest.mock('@/lib/billing/controlPlane', () => ({
  getBillingCustomer: jest.fn(async () => null),
  upsertBillingCustomer: jest.fn(async () => undefined),
}));

describe('billing checkout api', () => {
  beforeEach(() => {
    createStripeCustomer.mockResolvedValue({ id: 'cus_123' });
    createStripeCheckoutSession.mockResolvedValue({
      id: 'cs_123',
      url: 'https://checkout.stripe.com/session/test',
    });
    process.env.STRIPE_PRICE_PRO_MONTHLY = 'price_pro_monthly';
  });

  it('creates a checkout session for a supported plan', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        planId: 'pro',
        interval: 'monthly',
      },
      headers: {
        authorization: 'Bearer token',
        host: 'localhost:3000',
        'x-brewassist-org-id': 'org-1',
        'x-brewassist-workspace-id': 'ws-1',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      url: 'https://checkout.stripe.com/session/test',
    });
    expect(createStripeCheckoutSession).toHaveBeenCalled();
  });
});
