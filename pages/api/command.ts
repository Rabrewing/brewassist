// pages/api/command.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { findCommand } from '@/lib/commands/registry';
import { BrewContext, BrewResult } from '@/lib/commands/types';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import {
  getAuthenticatedUser,
  getSupabaseEnterpriseRole,
} from '@/lib/supabase/server';

type CommandRequestBody = {
  command: string;
  input?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BrewResult | { error: string }>
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { command, input = '' } = req.body as CommandRequestBody;
  const cmd = findCommand(command);
  const enterpriseContext = parseEnterpriseContext(req);
  const authUser = await getAuthenticatedUser(req, res);
  const resolvedRole = await getSupabaseEnterpriseRole(
    req,
    res,
    enterpriseContext.orgId
  );

  if (!cmd) {
    res.status(400).json({ error: `Unknown command: ${command}` });
    return;
  }

  if (!authUser) {
    res.status(401).json({ error: 'Sign in required' });
    return;
  }

  // TODO: derive from session / headers / cookies
  const ctx: BrewContext = {
    tenantId: enterpriseContext.tenantId,
    userId: authUser.id,
    projectId: enterpriseContext.projectId,
    orgId: enterpriseContext.orgId,
    repoId: enterpriseContext.repoId,
    role: resolvedRole,
    activeEnv: enterpriseContext.cockpitMode === 'admin' ? 'dev' : 'prod',
    rbMode: resolvedRole === 'admin',
    models: {
      primary: 'openai:gpt-4.1-mini',
      local: 'tinyllama',
    },
  };

  try {
    const result = await cmd.handler(input, ctx);
    res.status(200).json(result);
  } catch (err) {
    console.error('[/api/command] error', err);
    res.status(500).json({ error: 'Command execution failed' });
  }
}
