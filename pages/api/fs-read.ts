import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const ROOT_READ = process.env.BREW_ROOT || '/home/brewexec';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rel = req.query.path;
  if (!rel || typeof rel !== 'string') {
    return res.status(400).json({ error: 'Missing path param' });
  }

  const full = path.join(ROOT_READ, rel);
  if (!full.startsWith(ROOT_READ)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  try {
    const stat = fs.statSync(full);
    if (!stat.isFile()) {
      return res.status(400).json({ error: 'Not a file' });
    }

    const raw = fs.readFileSync(full, 'utf8');
    const maxChars = 4000;
    const content =
      raw.length > maxChars
        ? raw.slice(0, maxChars) + '\n\n… (truncated)'
        : raw;

    res.status(200).json({ path: rel, content });
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
}
