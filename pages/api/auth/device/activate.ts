import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { device_code } = req.body;

  if (!device_code) {
    return res.status(400).json({ error: 'device_code is required' });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    device_code,
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
  });

  try {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[device-activate] error:', error);
    return res.status(500).json({ error: 'Failed to check device activation' });
  }
}
