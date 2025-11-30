// pages/api/brewtruth.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewTruth, type BrewTruthRequest } from '@/lib/brewtruth';
import { readBrewLast } from '@/lib/brewLastServer';
// ^ Gemini: reuse whatever S3 created that reads .brewlast.json

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body as Partial<BrewTruthRequest>;

    if (!body.statement) {
      return res.status(400).json({
        ok: false,
        error: 'statement is required',
      });
    }

    const result = await runBrewTruth({
      statement: body.statement,
      contextHint: body.contextHint,
      mode: body.mode,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error('brewtruth error:', err);
    return res.status(500).json({
      ok: false,
      error: 'Internal BrewTruth error',
      details: err?.message ?? String(err),
    });
  }
}
