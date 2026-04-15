// pages/api/fs-read.ts
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

type FsReadResponse = { error: string } | { path: string; content: string };

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
  res: NextApiResponse<FsReadResponse>
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
      
      try {
        await fs.access(basePath);
      } catch {
        console.warn(`[fs-read] Sandbox mirror not found for ${enterpriseContext.repoProvider}/${enterpriseContext.repoRoot}. Falling back to local repo root.`);
        basePath = BREWASSIST_REPO_ROOT;
      }
    }

    const relative = normalizeRequestedPath(req.query.path, basePath);
    const fullPath = path.join(basePath, relative);

    // If using BREWASSIST_REPO_ROOT, check if allowed
    if (basePath === BREWASSIST_REPO_ROOT && !isPathAllowed(fullPath)) {
      console.warn('[fs-read] blocked path', { relative, fullPath });
      return res.status(400).json({ error: 'Path not allowed' });
    }

    const content = await fs.readFile(fullPath, 'utf8');

    return res.status(200).json({
      path: relative,
      content,
    });
  } catch (err: any) {
    console.error('[fs-read] error', err);
    return res.status(500).json({ error: err?.message ?? 'fs-read failure' });
  }
}
