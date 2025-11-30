// pages/api/sandbox.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

function runShell(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout || stderr || '');
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, engine } = req.body as { prompt?: string; engine?: string };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const chosen = (engine || 'tiny').toLowerCase();

  // brewsandbox.sh will fan out to the correct engine
  const cmd = `~/brewexec/overlays/brewsandbox.sh ${chosen} "${prompt.replace(/"/g, '\\"')}"`;
}
