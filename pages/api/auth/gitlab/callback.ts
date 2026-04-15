import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).send('No authorization code provided.');
  }

  const clientId = process.env.GITLAB_CLIENT_ID;
  const clientSecret = process.env.GITLAB_CLIENT_SECRET;
  
  const host = req.headers.host;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/gitlab/callback`;

  try {
    const tokenRes = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenRes.json();
    
    if (data.access_token) {
      // Redirect back to the app with the token in the URL hash fragment
      // This ensures it never hits server logs as a query parameter
      res.redirect(302, `/#gitlab_token=${data.access_token}`);
    } else {
      console.error('[gitlab-callback] Error from GitLab:', data);
      res.status(400).json(data);
    }
  } catch (e: any) {
    console.error('[gitlab-callback] Server error:', e.message);
    res.status(500).send('Internal Server Error');
  }
}
