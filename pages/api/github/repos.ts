import type { NextApiRequest, NextApiResponse } from 'next';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
}

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
    return res.status(401).json({ error: 'Missing GitHub token' });
  }

  try {
    const response = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res
        .status(response.status)
        .json({ error: `GitHub API error: ${error}` });
    }

    const repos: GitHubRepo[] = await response.json();

    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      isPrivate: repo.private,
      url: repo.html_url,
      description: repo.description,
      defaultBranch: repo.default_branch,
    }));

    return res.status(200).json({ repos: formattedRepos });
  } catch (error) {
    console.error('[github-repos] error:', error);
    return res.status(500).json({ error: 'Failed to fetch repos from GitHub' });
  }
}
