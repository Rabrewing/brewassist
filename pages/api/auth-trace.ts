import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const event = body?.event ?? 'unknown';
  const detail = body?.detail ?? null;

  console.info('[auth-trace]', {
    event,
    detail,
    at: new Date().toISOString(),
  });

  return res.status(200).json({ ok: true });
}
