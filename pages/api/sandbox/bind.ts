import type { NextApiRequest, NextApiResponse } from 'next';
import { bindRemoteSandbox } from '@/lib/brewSandboxMirror';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, repoFullName } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!provider || !repoFullName || !token) {
    return res.status(400).json({ error: 'Missing provider, repoFullName, or auth token' });
  }

  try {
    const summary = await bindRemoteSandbox(provider, repoFullName, token);
    return res.status(200).json({ success: true, summary });
  } catch (error: any) {
    console.error('[sandbox-bind] error:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to bind remote sandbox' });
  }
}
