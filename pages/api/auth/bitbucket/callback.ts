import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).send('No authorization code provided.');
  }

  const clientId = process.env.BITBUCKET_CLIENT_ID;
  const clientSecret = process.env.BITBUCKET_CLIENT_SECRET;
  
  const host = req.headers.host;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/bitbucket/callback`;

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenRes = await fetch('https://bitbucket.org/site/oauth2/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }).toString(),
    });

    const data = await tokenRes.json();
    
    if (data.access_token) {
      // Redirect back to the app with the token in the URL hash fragment
      res.redirect(302, `/#bitbucket_token=${data.access_token}`);
    } else {
      console.error('[bitbucket-callback] Error from Bitbucket:', data);
      res.status(400).json(data);
    }
  } catch (e: any) {
    console.error('[bitbucket-callback] Server error:', e.message);
    res.status(500).send('Internal Server Error');
  }
}
