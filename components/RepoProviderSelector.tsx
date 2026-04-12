'use client';

import React from 'react';
import { useRepoConnection } from '@/contexts/RepoConnectionContext';

export function RepoProviderSelector() {
  const { repoProvider, repoRoot, setRepoProvider, setRepoRoot } =
    useRepoConnection();

  return (
    <div className="repo-provider-selector">
      <label>
        <span className="repo-provider-label">Repo Provider</span>
        <select
          className="repo-provider-select"
          value={repoProvider}
          onChange={(e) =>
            setRepoProvider(e.target.value as typeof repoProvider)
          }
        >
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
          <option value="local">Local</option>
        </select>
      </label>

      <label>
        <span className="repo-provider-label">Repo Root</span>
        <input
          className="repo-provider-select"
          value={repoRoot}
          onChange={(e) => setRepoRoot(e.target.value)}
          placeholder="/path/to/repo"
        />
      </label>
    </div>
  );
}
