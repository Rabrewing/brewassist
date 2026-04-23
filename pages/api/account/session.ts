import type { NextApiRequest, NextApiResponse } from 'next';

import { buildAccountSessionSummary, resolveConsoleContext } from '@/lib/console/controlPlane';
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
    const session = await buildAccountSessionSummary(
      client,
      user,
      enterpriseContext.orgId,
      enterpriseContext.workspaceId
    );
    const resolved = await resolveConsoleContext(
      client,
      user,
      enterpriseContext.orgId,
      enterpriseContext.workspaceId
    );

    return res.status(200).json({
      account: session,
      organization: resolved.org,
      workspace: resolved.workspace,
    });
  } catch (error: any) {
    console.error('[api/account/session]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to load session' });
  }
}
