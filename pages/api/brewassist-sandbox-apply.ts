// pages/api/brewassist-sandbox-apply.ts
// S4.4 — Safe patch writer for sandbox/ only.

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { BREWEXEC_ROOT, sandboxPath } from '../../lib/brewassistMaintenance';

interface SandboxApplyBody {
  relativePath: string; // must be under sandbox/, e.g. "sandbox/s4_fix.ts" or "s4_fix.ts"
  content: string;
}

function isSafeSandboxPath(relativePath: string): boolean {
  if (!relativePath) return false;
  if (relativePath.startsWith('../')) return false;
  if (relativePath.includes('..')) return false;
  return true;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = req.body as SandboxApplyBody;

  if (!body?.relativePath || typeof body.content !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Missing relativePath or content in request body.',
    });
  }

  if (!isSafeSandboxPath(body.relativePath)) {
    return res.status(400).json({
      ok: false,
      error: 'Unsafe sandbox path.',
    });
  }

  try {
    const baseSandboxDir = path.join(BREWEXEC_ROOT, 'sandbox');
    if (!fs.existsSync(baseSandboxDir)) {
      fs.mkdirSync(baseSandboxDir, { recursive: true });
    }

    // Strip possible leading "sandbox/"
    const cleanRel = body.relativePath.replace(/^sandbox\//, '');
    const fullPath = sandboxPath(cleanRel);

    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, body.content, 'utf8');

    return res.status(200).json({
      ok: true,
      path: fullPath,
      message: 'Sandbox file written successfully.',
    });
  } catch (error: any) {
    console.error('[brewassist-sandbox-apply]', error);
    return res.status(500).json({
      ok: false,
      error: error?.message ?? 'Unknown error',
    });
  }
}
