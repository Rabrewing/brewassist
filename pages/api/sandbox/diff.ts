import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { getMirrorRoot } from '@/lib/brewSandbox';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { assertRepoScope } from '@/lib/permissions';

const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const enterpriseContext = parseEnterpriseContext(req);
    const authUser = await getAuthenticatedUser(req, res);

    if (!authUser) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const scopedContext = { ...enterpriseContext, userId: authUser.id, role: 'admin' as const };
    const repoScope = assertRepoScope(scopedContext, scopedContext.repoRoot);
    if (!repoScope.ok) {
      return res
        .status(repoScope.statusCode ?? 403)
        .json({ error: repoScope.reason ?? 'Repo scope denied' });
    }

    if (!enterpriseContext.repoProvider || enterpriseContext.repoProvider === 'local' || !enterpriseContext.repoRoot) {
      return res.status(400).json({ error: 'Sandbox diff is only available for remote repositories.' });
    }

    const mirrorTargetRoot = getMirrorRoot();
    const sandboxPath = path.join(
      mirrorTargetRoot,
      enterpriseContext.repoProvider,
      enterpriseContext.repoRoot
    );

    // Get the diff of all unstaged and staged changes in the sandbox
    try {
      // First, let's make sure we track new files too
      await execAsync('git add -N .', { cwd: sandboxPath });
      
      const { stdout } = await execAsync('git diff', { cwd: sandboxPath });
      
      if (!stdout.trim()) {
        return res.status(200).json({ hasChanges: false, diff: '' });
      }

      return res.status(200).json({ hasChanges: true, diff: stdout });
    } catch (e: any) {
      console.error('[sandbox-diff] git execution error:', e);
      return res.status(500).json({ error: 'Failed to generate diff in sandbox' });
    }
  } catch (error: any) {
    console.error('[sandbox-diff] error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
