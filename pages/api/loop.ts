import type { NextApiRequest, NextApiResponse } from 'next';

type LoopResponse = {
  engine: 'loop';
  mode: 'commentary';
  output: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoopResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body ?? {};

  const message =
    typeof prompt === 'string' && prompt.trim().length > 0
      ? prompt.trim()
      : 'Loop started. Add more prompts to build the commentary stream.';

  return res.status(200).json({
    engine: 'loop',
    mode: 'commentary',
    output: `🔁 BrewLoop (stub) says:\n${message}`,
  });
}
