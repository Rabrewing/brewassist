import type { NextApiRequest, NextApiResponse } from 'next';

import { buildSessionRestoreSummary } from '@/lib/console/controlPlane';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import {
  createSupabaseAdminClient,
  getAuthenticatedUser,
} from '@/lib/supabase/server';

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
    const sessionId =
      typeof req.query.sessionId === 'string' ? req.query.sessionId : null;

    if (!enterpriseContext.orgId) {
      return res.status(400).json({ error: 'orgId is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const client = createSupabaseAdminClient();
    const restore = await buildSessionRestoreSummary(
      client,
      user,
      enterpriseContext.orgId,
      sessionId,
      enterpriseContext.workspaceId
    );

    if (!restore) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.status(200).json({ restore });
  } catch (error: any) {
    console.error('[api/sessions/restore]', error?.message ?? error);
    return res.status(500).json({
      error: error?.message ?? 'Failed to restore session',
    });
  }
}
