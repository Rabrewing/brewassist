import crypto from 'node:crypto';

import { verifyStripeWebhookSignature } from '../../lib/billing/stripe';

describe('stripe webhook signature verification', () => {
  it('accepts a valid Stripe-style signature header', () => {
    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
    const secret = 'whsec_test';
    const timestamp = 1_700_000_000;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`, 'utf8')
      .digest('hex');

    expect(() =>
      verifyStripeWebhookSignature({
        payload,
        signatureHeader: `t=${timestamp},v1=${signature}`,
        secret,
        nowSeconds: timestamp + 10,
      })
    ).not.toThrow();
  });

  it('rejects an invalid Stripe-style signature header', () => {
    expect(() =>
      verifyStripeWebhookSignature({
        payload: '{}',
        signatureHeader: 't=1700000000,v1=deadbeef',
        secret: 'whsec_test',
        nowSeconds: 1_700_000_010,
      })
    ).toThrow('Invalid Stripe webhook signature');
  });
});
