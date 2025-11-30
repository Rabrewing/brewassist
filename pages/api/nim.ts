import type { NextApiRequest, NextApiResponse } from 'next';
import { callNIM } from '@/lib/nimEngine';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body || {};

    const result = await callNIM(prompt ?? '');

    return res.status(200).json({
      output: result.output,
      engine: result.engine,
      emoji: result.emoji,
      raw: result.raw,
      mode: 'research',
    });
  } catch (err: any) {
    console.error('NIM error:', err);
    return res.status(500).json({
      error: `NIM engine failed: ${String(err?.message || err)}`,
      engine: 'nim',
      emoji: '🧪',
    });
  }
}
