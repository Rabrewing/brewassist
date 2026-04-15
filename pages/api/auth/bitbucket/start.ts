import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.BITBUCKET_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'Bitbucket Client ID is not configured' });
  }
  
  const host = req.headers.host;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/bitbucket/callback`;
  
  // Bitbucket uses space-separated scopes
  const scope = 'account repository';
  
  const bitbucketAuthUrl = `https://bitbucket.org/site/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(302, bitbucketAuthUrl);
}
