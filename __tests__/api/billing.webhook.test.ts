import crypto from 'node:crypto';
import { Readable } from 'node:stream';
import { createMocks } from 'node-mocks-http';

import handler, { config } from '../../pages/api/billing/webhook';

const handleStripeWebhookEvent = jest.fn();

jest.mock('@/lib/billing/webhook', () => ({
  handleStripeWebhookEvent: (...args: unknown[]) => handleStripeWebhookEvent(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createSupabaseAdminClient: jest.fn(() => ({})),
}));

describe('billing webhook api', () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    handleStripeWebhookEvent.mockResolvedValue({ recorded: true, reason: 'processed' });
  });

  it('keeps body parsing disabled for raw webhook verification', () => {
    expect(config).toMatchObject({
      api: { bodyParser: false },
    });
  });

  it('accepts a signed Stripe webhook payload', async () => {
    const payload = JSON.stringify({
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            orgId: 'org-1',
            actorId: 'user-1',
          },
        },
      },
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET as string)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'stripe-signature': `t=${timestamp},v1=${signature}`,
      },
    });

    const stream = Readable.from([payload]);
    Object.setPrototypeOf(req, Object.getPrototypeOf(stream));
    Object.assign(req, stream);

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(handleStripeWebhookEvent).toHaveBeenCalled();
  });
});
