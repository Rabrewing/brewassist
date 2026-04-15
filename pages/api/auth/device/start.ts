import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo read:user',
  });

  try {
    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[device-start] error:', error);
    return res.status(500).json({ error: 'Failed to start device flow' });
  }
}
