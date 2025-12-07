// pages/api/fs-read.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';
import { BREWASSIST_REPO_ROOT, isPathAllowed } from '../../lib/brewConfig';

type FsReadResponse =
  | { error: string }
  | { path: string; content: string };

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
  res: NextApiResponse<FsReadResponse>
) {
  try {
    const relative = normalizeRequestedPath(req.query.path);
    const fullPath = path.join(BREWASSIST_REPO_ROOT, relative);

    if (!isPathAllowed(fullPath)) {
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
    return res
      .status(500)
      .json({ error: err?.message ?? 'fs-read failure' });
  }
}
