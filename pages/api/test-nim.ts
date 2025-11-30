import type { NextApiRequest, NextApiResponse } from 'next';
import { callNIM } from '@/lib/nimEngine';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await callNIM('Hello from BrewExec test-nim endpoint.');
    res.status(200).json(result);
  } catch (err: any) {
    console.error('test-nim error:', err);
    res.status(500).json({
      error: `test-nim failed: ${String(err?.message || err)}`,
    });
  }
}
