// pages/api/fs-tree.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { BREWASSIST_REPO_ROOT, isPathAllowed } from '../../lib/brewConfig';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { assertRepoScope } from '@/lib/permissions';

type FileNode = {
  name: string;
  path: string; // always repo-relative, e.g. "lib/brewassistChain.ts"
  type: 'file' | 'directory';
};

function normalizeRequestedPath(raw: string | string[] | undefined): string {
  if (!raw) return '.'; // root

  const s = Array.isArray(raw) ? raw[0] : raw;

  // Strip leading slashes
  let clean = s.replace(/^\/+/, '');

  // If someone sent an absolute path under the repo, strip the repo root
  const root = path.resolve(BREWASSIST_REPO_ROOT);
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
    const repoScope = assertRepoScope(
      enterpriseContext,
      enterpriseContext.repoRoot
    );
    if (!repoScope.ok) {
      return res
        .status(repoScope.statusCode ?? 403)
        .json({ error: repoScope.reason ?? 'Repo scope denied' });
    }

    const relative = normalizeRequestedPath(req.query.path);
    const fullPath = path.join(BREWASSIST_REPO_ROOT, relative);

    if (!isPathAllowed(fullPath)) {
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
