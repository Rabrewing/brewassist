import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const ROOT = process.env.BREW_ROOT || '/home/brewexec';

type Node = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: Node[];
};

// folders we NEVER want in the BrewAssist cockpit tree
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '__pycache__',
  '.venv',
  'venv',
  'brewassist-venv',
  'brewassist_venv',
  'brewgold',
  'brewgold-backup',
  'brewlotto',
  'brewpulse-insight',
]);

const IGNORE_FILE_SUFFIXES = ['.pyc', '.log'];

function listDir(dir: string, depth = 0, maxDepth = 3): Node[] {
  if (depth > maxDepth) return [];

  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }

  return entries
    .filter((name) => !name.startsWith('.'))
    .filter((name) => !IGNORE_DIRS.has(name))
    .map((name) => {
      const full = path.join(dir, name);

      let stat: fs.Stats;
      try {
        stat = fs.statSync(full);
      } catch {
        // bad symlink or Windows path weirdness → skip
        return null;
      }

      const relPath = path.relative(ROOT, full);

      if (stat.isDirectory()) {
        return {
          name,
          path: relPath,
          type: 'dir' as const,
          children: listDir(full, depth + 1, maxDepth),
        };
      }

      // ignore noisy file types
      if (IGNORE_FILE_SUFFIXES.some((suf) => name.endsWith(suf))) return null;

      return {
        name,
        path: relPath,
        type: 'file' as const,
      };
    })
    .filter(Boolean) as Node[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const tree = listDir(ROOT, 0, 3);
  res.status(200).json({ root: ROOT, tree });
}
