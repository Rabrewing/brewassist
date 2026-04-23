import type { NextApiRequest, NextApiResponse } from 'next';

import { getManagedProviderProxyContract } from '@/lib/console/managedProviderProxy';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    return res.status(501).json({
      error: 'Runtime token issuance not implemented yet',
      nextStep:
        'Mint short-lived Brew runtime tokens for Brew Agentic instead of exposing raw provider keys.',
      contract: getManagedProviderProxyContract(),
    });
  } catch (error: any) {
    console.error('[api/runtimes/token]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to evaluate runtime token request' });
  }
}
