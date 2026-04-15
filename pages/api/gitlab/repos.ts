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
    return res.status(401).json({ error: 'Missing GitLab token' });
  }

  try {
    const response = await fetch(
      'https://gitlab.com/api/v4/projects?membership=true&simple=true&order_by=updated_at&per_page=100',
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
        .json({ error: `GitLab API error: ${error}` });
    }

    const repos = await response.json();

    const formattedRepos = repos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.path_with_namespace,
      isPrivate: repo.visibility === 'private',
      url: repo.web_url,
      description: repo.description,
      defaultBranch: repo.default_branch,
    }));

    return res.status(200).json({ repos: formattedRepos });
  } catch (error) {
    console.error('[gitlab-repos] error:', error);
    return res.status(500).json({ error: 'Failed to fetch repos from GitLab' });
  }
}
