import type { NextApiRequest, NextApiResponse } from 'next';

import { getStripeReadinessSummary } from '@/lib/billing/stripeReadiness';
import { buildBillingSummary } from '@/lib/console/controlPlane';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { createSupabaseAdminClient, getAuthenticatedUser } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const client = createSupabaseAdminClient();
    const enterpriseContext = parseEnterpriseContext(req);
    const billing = await buildBillingSummary(client, user, enterpriseContext.orgId);
    const stripe = getStripeReadinessSummary();

    return res.status(200).json({
      billing: {
        ...billing,
        stripeReady: stripe.ready,
      },
      stripeStatus: {
        ready: stripe.ready,
        reason: stripe.reason,
        mode: stripe.mode,
        missing: stripe.missing,
        checkoutReady: stripe.checkoutReady,
        portalReady: stripe.portalReady,
        webhookReady: stripe.webhookReady,
        pricesReady: stripe.pricesReady,
      },
    });
  } catch (error: any) {
    console.error('[api/billing/summary]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to load billing summary' });
  }
}
