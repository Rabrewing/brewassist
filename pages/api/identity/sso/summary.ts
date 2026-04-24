import type { NextApiRequest, NextApiResponse } from 'next';

import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { getEnterpriseIdentitySummary } from '@/lib/enterprise/identityReadiness';
import { getAuthenticatedUser, getSupabaseEnterpriseRole } from '@/lib/supabase/server';

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

    const enterpriseContext = parseEnterpriseContext(req);
    const role = await getSupabaseEnterpriseRole(req, res, enterpriseContext.orgId);

    return res.status(200).json({
      identity: getEnterpriseIdentitySummary(role),
    });
  } catch (error: any) {
    console.error('[api/identity/sso/summary]', error?.message ?? error);
    return res
      .status(500)
      .json({ error: error?.message ?? 'Failed to load identity summary' });
  }
}
