// pages/api/fs-tree.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { BREWASSIST_REPO_ROOT, isPathAllowed } from '../../lib/brewConfig';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { assertRepoScope } from '@/lib/permissions';
import { getMirrorRoot } from '@/lib/brewSandbox';
import {
  getAuthenticatedUser,
  getSupabaseEnterpriseRole,
} from '@/lib/supabase/server';

type FileNode = {
  name: string;
  path: string; // always repo-relative, e.g. "lib/brewassistChain.ts"
  type: 'file' | 'directory';
};

function normalizeRequestedPath(raw: string | string[] | undefined, rootPath: string): string {
  if (!raw) return '.'; // root

  const s = Array.isArray(raw) ? raw[0] : raw;

  // Strip leading slashes
  let clean = s.replace(/^\/+/, '');

  // If someone sent an absolute path under the repo, strip the repo root
  const root = path.resolve(rootPath);
  const candidate = path.resolve(s);
  if (candidate.startsWith(root)) {
    clean = path.relative(root, candidate);
  }

  if (!clean || clean === '.') return '.';
  return clean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const enterpriseContext = parseEnterpriseContext(req);
    const authUser = await getAuthenticatedUser(req, res);

    if (!authUser) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const role = await getSupabaseEnterpriseRole(
      req,
      res,
      enterpriseContext.orgId
    );
    const scopedContext = { ...enterpriseContext, userId: authUser.id, role };
    const repoScope = assertRepoScope(scopedContext, scopedContext.repoRoot);
    if (!repoScope.ok) {
      return res
        .status(repoScope.statusCode ?? 403)
        .json({ error: repoScope.reason ?? 'Repo scope denied' });
    }

    // Determine the base path (sandbox mirror or local fallback)
    let basePath = BREWASSIST_REPO_ROOT;
    if (enterpriseContext.repoProvider && enterpriseContext.repoProvider !== 'local' && enterpriseContext.repoRoot) {
      const mirrorTargetRoot = getMirrorRoot();
      basePath = path.join(mirrorTargetRoot, enterpriseContext.repoProvider, enterpriseContext.repoRoot);
      
      // Fallback to BREWASSIST_REPO_ROOT if mirror doesn't exist yet, to prevent crashes
      try {
        await fs.access(basePath);
      } catch {
        console.warn(`[fs-tree] Sandbox mirror not found for ${enterpriseContext.repoProvider}/${enterpriseContext.repoRoot}. Falling back to local repo root.`);
        basePath = BREWASSIST_REPO_ROOT;
      }
    }

    const relative = normalizeRequestedPath(req.query.path, basePath);
    const fullPath = path.join(basePath, relative);

    // If using BREWASSIST_REPO_ROOT, check if allowed
    if (basePath === BREWASSIST_REPO_ROOT && !isPathAllowed(fullPath)) {
      console.warn('[fs-tree] blocked path', { relative, fullPath });
      return res.status(400).json({ error: 'Path not allowed' });
    }

    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const nodes: FileNode[] = entries.map((entry) => {
      const entryPath = path.join(relative, entry.name);
      return {
        name: entry.name,
        path: entryPath,
        type: entry.isDirectory() ? 'directory' : 'file',
      };
    });

    res.status(200).json({
      path: relative,
      nodes,
    });
  } catch (err: any) {
    console.error('[fs-tree] error', err);
    res.status(500).json({
      error: 'Failed to read directory',
      message: err?.message,
    });
  }
}
