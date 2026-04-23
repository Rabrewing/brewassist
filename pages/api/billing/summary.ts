import type { NextApiRequest, NextApiResponse } from 'next';

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

    return res.status(200).json({
      billing,
      stripeStatus: {
        ready: false,
        reason:
          'Stripe checkout, portal, invoices, and webhook sync still need production wiring before managed billing can go live.',
      },
    });
  } catch (error: any) {
    console.error('[api/billing/summary]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to load billing summary' });
  }
}
