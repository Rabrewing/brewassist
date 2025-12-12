// pages/api/brewtruth.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewTruth, type BrewTruthInput } from '@/lib/brewtruth';
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
    const body = req.body as Partial<BrewTruthInput>;

    if (!body.prompt || !body.response) {
      return res.status(400).json({
        ok: false,
        error: 'prompt and response are required',
      });
    }

    const result = await runBrewTruth({
      prompt: body.prompt,
      response: body.response,
      mode: body.mode,
      providerTrace: body.providerTrace,
    });

    return res.status(200).json({ truth: result });
  } catch (err: any) {
    console.error('brewtruth error:', err);
    return res.status(500).json({
      ok: false,
      error: 'Internal BrewTruth error',
      details: err?.message ?? String(err),
    });
  }
}
