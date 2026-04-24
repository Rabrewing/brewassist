import type { NextApiRequest, NextApiResponse } from 'next';

import { getStripeReadinessSummary } from '@/lib/billing/stripeReadiness';
import { getAuthenticatedUser } from '@/lib/supabase/server';

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

    return res.status(200).json({
      stripe: getStripeReadinessSummary(),
    });
  } catch (error: any) {
    console.error('[api/billing/config]', error?.message ?? error);
    return res
      .status(500)
      .json({ error: error?.message ?? 'Failed to load billing config' });
  }
}
