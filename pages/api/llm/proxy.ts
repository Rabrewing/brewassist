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
      error: 'Managed provider proxy not implemented yet',
      nextStep:
        'Keep Brew-managed provider keys server-side and execute provider calls only from the hosted proxy.',
      contract: getManagedProviderProxyContract(),
    });
  } catch (error: any) {
    console.error('[api/llm/proxy]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to evaluate proxy request' });
  }
}
