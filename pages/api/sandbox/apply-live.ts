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

  const { commitMessage, executionChoice } = req.body;
  const normalizedCommitMessage =
    typeof commitMessage === 'string' ? commitMessage.trim() : '';
  const allowedChoices = new Set([
    'apply',
    'always_apply',
    'reject_comment',
  ] as const);

  if (!normalizedCommitMessage) {
    return res.status(400).json({ error: 'commitMessage is required' });
  }

  if (
    typeof executionChoice !== 'string' ||
    !allowedChoices.has(executionChoice as any)
  ) {
    return res.status(400).json({
      error: 'executionChoice must be apply, always_apply, or reject_comment',
    });
  }

  if (executionChoice === 'reject_comment') {
    return res.status(409).json({
      error: 'Rejected execution cannot be applied.',
      executionChoice,
    });
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
      const { stdout: branchStdout } = await execAsync(
        'git rev-parse --abbrev-ref HEAD',
        { cwd: sandboxPath }
      );
      const branch = branchStdout.trim() || 'HEAD';

      // 1. Add all changes
      await execAsync('git add .', { cwd: sandboxPath });
      
      // 2. Setup user config temporarily to commit
      await execAsync(`git config user.email "brewassist@brewington.co"`, { cwd: sandboxPath });
      await execAsync(`git config user.name "BrewAssist AI"`, { cwd: sandboxPath });

      // 3. Commit
      await execAsync(
        `git commit -m "${normalizedCommitMessage.replace(/"/g, '\\"')}"`,
        {
        cwd: sandboxPath,
        }
      );

      const { stdout: commitStdout } = await execAsync(
        'git rev-parse --short HEAD',
        { cwd: sandboxPath }
      );
      const commitHash = commitStdout.trim();

      const { stdout, stderr } = await execAsync(`git push origin ${branch}`, {
        cwd: sandboxPath,
      });

      const { stdout: changedStdout } = await execAsync(
        'git diff-tree --no-commit-id --name-only -r HEAD',
        { cwd: sandboxPath }
      );
      const changedFiles = changedStdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      return res.status(200).json({ 
        success: true, 
        message: 'Successfully pushed to remote repository.',
        output: stdout || stderr,
        commitHash,
        branch,
        changedFiles,
        executionChoice,
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
