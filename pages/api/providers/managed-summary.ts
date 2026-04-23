import type { NextApiRequest, NextApiResponse } from 'next';

import { buildManagedProviderSummary } from '@/lib/console/controlPlane';
import { getManagedProviderProxyContract } from '@/lib/console/managedProviderProxy';
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
    const managed = await buildManagedProviderSummary(
      client,
      user,
      enterpriseContext.orgId
    );

    return res.status(200).json({
      managed,
      contract: getManagedProviderProxyContract(),
    });
  } catch (error: any) {
    console.error('[api/providers/managed-summary]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to load provider summary' });
  }
}
