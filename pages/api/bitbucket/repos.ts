import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing Bitbucket token' });
  }

  try {
    // role=member gets repos where the user is a member
    const response = await fetch(
      'https://api.bitbucket.org/2.0/repositories?role=member&pagelen=100',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res
        .status(response.status)
        .json({ error: `Bitbucket API error: ${error}` });
    }

    const data = await response.json();
    const repos = data.values || [];

    const formattedRepos = repos.map((repo: any) => ({
      id: repo.uuid,
      name: repo.name,
      fullName: repo.full_name,
      isPrivate: repo.is_private,
      url: repo.links.html.href,
      description: repo.description,
      // Bitbucket repos usually have a main branch but we'll try to find it in the API if needed
      // For now we'll default to 'main' or 'master'
      defaultBranch: 'main', 
    }));

    return res.status(200).json({ repos: formattedRepos });
  } catch (error) {
    console.error('[bitbucket-repos] error:', error);
    return res.status(500).json({ error: 'Failed to fetch repos from Bitbucket' });
  }
}
