import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { getMirrorRoot } from '@/lib/brewSandbox';
import { getAuthenticatedUser } from '@/lib/supabase/server';

const execAsync = promisify(exec);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { commitMessage } = req.body;
  if (!commitMessage) {
    return res.status(400).json({ error: 'commitMessage is required' });
  }

  try {
    const enterpriseContext = parseEnterpriseContext(req);
    const authUser = await getAuthenticatedUser(req, res);

    if (!authUser) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    if (!enterpriseContext.repoProvider || enterpriseContext.repoProvider === 'local' || !enterpriseContext.repoRoot) {
      return res.status(400).json({ error: 'Sandbox apply is only available for remote repositories.' });
    }

    const mirrorTargetRoot = getMirrorRoot();
    const sandboxPath = path.join(
      mirrorTargetRoot,
      enterpriseContext.repoProvider,
      enterpriseContext.repoRoot
    );

    // Apply the changes (commit and push)
    try {
      // 1. Add all changes
      await execAsync('git add .', { cwd: sandboxPath });
      
      // 2. Setup user config temporarily to commit
      await execAsync(`git config user.email "brewassist@brewington.co"`, { cwd: sandboxPath });
      await execAsync(`git config user.name "BrewAssist AI"`, { cwd: sandboxPath });

      // 3. Commit
      await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: sandboxPath });

      // 4. Push! Since we cloned with the token injected into the remote URL, this should just work
      const { stdout, stderr } = await execAsync('git push', { cwd: sandboxPath });

      return res.status(200).json({ 
        success: true, 
        message: 'Successfully pushed to remote repository.',
        output: stdout || stderr
      });
    } catch (e: any) {
      console.error('[sandbox-apply] git execution error:', e);
      return res.status(500).json({ error: 'Failed to push changes from sandbox. Error: ' + e.message });
    }
  } catch (error: any) {
    console.error('[sandbox-apply] error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
