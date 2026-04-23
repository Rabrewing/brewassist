import type { NextApiRequest, NextApiResponse } from 'next';

import { buildWorkspaceSummaries } from '@/lib/console/controlPlane';
import { createSupabaseAdminClient, getAuthenticatedUser } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orgId = typeof req.body?.orgId === 'string' ? req.body.orgId : undefined;
  const workspaceId =
    typeof req.body?.workspaceId === 'string' ? req.body.workspaceId : undefined;

  if (!workspaceId) {
    return res.status(400).json({ error: 'workspaceId is required' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const client = createSupabaseAdminClient();
    const workspaces = await buildWorkspaceSummaries(
      client,
      user,
      orgId,
      workspaceId
    );

    const activeWorkspace = workspaces.find((item) => item.active) ?? null;

    if (!activeWorkspace) {
      return res.status(404).json({ error: 'Workspace not found in current org scope' });
    }

    return res.status(200).json({
      workspace: activeWorkspace,
      workspaces,
    });
  } catch (error: any) {
    console.error('[api/workspaces/select]', error?.message ?? error);
    return res.status(500).json({ error: error?.message ?? 'Failed to select workspace' });
  }
}
