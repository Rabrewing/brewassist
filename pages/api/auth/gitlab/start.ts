import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.GITLAB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GitLab Client ID is not configured' });
  }
  
  const host = req.headers.host;
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/gitlab/callback`;
  
  const scope = 'read_user read_api write_repository';
  const state = Math.random().toString(36).substring(7);
  
  const gitlabAuthUrl = `https://gitlab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}&scope=${encodeURIComponent(scope)}`;
  
  res.redirect(302, gitlabAuthUrl);
}
