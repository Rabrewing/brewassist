// pages/api/brewlast-apply.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { logToolRun } from '@/lib/brewLastServer';
import type { BrewLastToolRun } from '@/lib/brewLast';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body as { toolRun?: BrewLastToolRun };
    if (!body?.toolRun) {
      return res.status(400).json({ ok: false, error: 'Missing toolRun' });
    }

    const saved = await logToolRun(body.toolRun);
    return res.status(200).json({ ok: true, state: saved });
  } catch (err: any) {
    console.error('Error in /api/brewlast-apply:', err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? 'Unknown error' });
  }
}
