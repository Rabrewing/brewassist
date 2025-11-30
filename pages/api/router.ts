// pages/api/router.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistChain } from '@/lib/brewassistChain';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt } = (req.body || {}) as { prompt?: string };

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: "Missing or invalid 'prompt' field" });
    return;
  }

  try {
    const result = await runBrewAssistChain({ prompt });
    res.status(200).json(result);
  } catch (err: any) {
    console.error('Router BrewAssist chain error:', err);
    res.status(500).json({ error: 'Router BrewAssist internal error' });
  }
}
