import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  // Silent fallback runner (same command as /loop here, but you can point to a different overlay)
  const cmd = `brewrouter /loop_s "${String(prompt).replace(/"/g, '\\"')}"`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.status(200).json({ output: stdout.trim() });
  });
}
