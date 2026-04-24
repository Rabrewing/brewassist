import type { NextApiRequest, NextApiResponse } from 'next';

import { getStripeWebhookSecret, verifyStripeWebhookSignature } from '@/lib/billing/stripe';
import { handleStripeWebhookEvent } from '@/lib/billing/webhook';
import { readRawBody } from '@/lib/http/rawBody';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await readRawBody(req);
    const signatureHeader = req.headers['stripe-signature'];

    verifyStripeWebhookSignature({
      payload: rawBody,
      signatureHeader:
        typeof signatureHeader === 'string' ? signatureHeader : undefined,
      secret: getStripeWebhookSecret(),
    });

    const event = JSON.parse(rawBody) as {
      id: string;
      type: string;
      data?: { object?: Record<string, any> };
    };

    const client = createSupabaseAdminClient();
    const result = await handleStripeWebhookEvent(client, event);

    return res.status(200).json({
      received: true,
      result,
    });
  } catch (error: any) {
    console.error('[api/billing/webhook]', error?.message ?? error);
    return res.status(400).json({
      error: error?.message ?? 'Invalid Stripe webhook payload',
    });
  }
}
