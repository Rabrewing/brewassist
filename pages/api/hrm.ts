import type { NextApiRequest, NextApiResponse } from 'next';
import { callHRM, buildHRMTaskPacket } from '@/lib/hrmBridge';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body as { prompt?: string };
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  try {
    const projectRoot = process.env.BREW_PROJECT_ROOT || process.cwd();
    const sandboxRoot = path.join(projectRoot, 'sandbox');

    const hrmTaskPacket = buildHRMTaskPacket(
      prompt,
      [], // No context from this simple endpoint
      projectRoot,
      sandboxRoot,
      'MEDIUM'
    );

    const result = await callHRM(hrmTaskPacket);

    return res.status(200).json({
      output: result.plan.join('\n'),
      emoji: '🧭',
    });
  } catch (err: any) {
    console.error('HRM error:', err);
    return res.status(500).json({
      error: `HRM failed: ${String(err?.message || err)}`,
      emoji: '💥',
    });
  }
}
