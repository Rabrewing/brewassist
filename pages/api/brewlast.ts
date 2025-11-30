// pages/api/brewlast.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { readBrewLast } from '@/lib/brewLastServer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const state = await readBrewLast();
    return res.status(200).json({ ok: true, state });
  } catch (err: any) {
    console.error('Error in /api/brewlast:', err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message ?? 'Unknown error' });
  }
}
