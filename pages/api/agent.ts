import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistChain } from '@/lib/brewassistChain';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, agent } = req.body as { prompt?: string; agent?: string };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  try {
    const result = await runBrewAssistChain({
      prompt,
      mode: 'agent',
      agent: agent || null,
    });

    return res.status(200).json({
      output: result.output,
      engine: result.engine,
      emoji: '🛰️',
    });
  } catch (err: any) {
    console.error('Agent error:', err);
    return res.status(500).json({
      error: `Agent route failed: ${String(err?.message || err)}`,
      emoji: '💥',
    });
  }
}
