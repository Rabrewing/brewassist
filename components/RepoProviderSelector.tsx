'use client';

import React, { useEffect, useState } from 'react';
import {
  useRepoConnection,
  GitHubRepo,
} from '@/contexts/RepoConnectionContext';

export function RepoProviderSelector() {
  const {
    repoProvider,
    repoRoot,
    githubToken,
    gitlabToken,
    bitbucketToken,
    githubRepos,
    gitlabRepos,
    bitbucketRepos,
    isBindingSandbox,
    setRepoProvider,
    setRepoRoot,
    triggerDeviceFlow,
    fetchGithubRepos,
    fetchGitlabRepos,
    fetchBitbucketRepos,
  } = useRepoConnection();

  const [showLocalToast, setShowLocalToast] = useState(false);

  useEffect(() => {
    if (githubToken && githubRepos.length === 0) {
      fetchGithubRepos();
    }
    if (gitlabToken && gitlabRepos.length === 0) {
      fetchGitlabRepos();
    }
    if (bitbucketToken && bitbucketRepos.length === 0) {
      fetchBitbucketRepos();
    }
  }, [githubToken, gitlabToken, bitbucketToken]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as typeof repoProvider;
    setRepoProvider(newProvider);
    setRepoRoot(''); // Clear selected repo when switching providers
    
    if (newProvider === 'local') {
      setShowLocalToast(true);
      setTimeout(() => setShowLocalToast(false), 5000);
    } else {
      setShowLocalToast(false);
    }
  };

  const getRepoList = () => {
    switch (repoProvider) {
      case 'gitlab': return gitlabRepos;
      case 'bitbucket': return bitbucketRepos;
      default: return githubRepos;
    }
  };

  const getToken = () => {
    switch (repoProvider) {
      case 'gitlab': return gitlabToken;
      case 'bitbucket': return bitbucketToken;
      default: return githubToken;
    }
  };

  const currentRepos = getRepoList();
  const currentToken = getToken();
  
  const selectedRepoObj = currentRepos.find(r => r.fullName === repoRoot);
  const isPrivateSelected = selectedRepoObj?.isPrivate;

  const handleConnectClick = () => {
    if (repoProvider === 'github') {
      triggerDeviceFlow();
    } else if (repoProvider === 'gitlab') {
      window.location.href = '/api/auth/gitlab/start';
    } else if (repoProvider === 'bitbucket') {
      window.location.href = '/api/auth/bitbucket/start';
    }
  };

  return (
    <div className="repo-provider-selector" style={{ position: 'relative' }}>
      <label>
        <span className="repo-provider-label">Repo Provider</span>
        <select
          className="repo-provider-select"
          value={repoProvider}
          onChange={handleProviderChange}
        >
          <option value="github">GitHub</option>
          <option value="gitlab">GitLab</option>
          <option value="bitbucket">Bitbucket</option>
          <option value="local">Local</option>
        </select>
      </label>

      {/* Local Toast Notification */}
      {showLocalToast && (
        <div style={{
          position: 'absolute',
          top: '120%',
          left: '0',
          background: 'rgba(2, 6, 23, 0.95)',
          border: '1px solid rgba(0, 199, 183, 0.3)',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 50,
          minWidth: '280px',
          color: '#e2e8f0',
          fontSize: '0.75rem',
          lineHeight: '1.4'
        }}>
          <strong style={{ color: '#00c7b7', display: 'block', marginBottom: '0.25rem' }}>Local Environment Detected</strong>
          To edit local files securely from the web, please install the <strong style={{ color: '#f8e7a3' }}>BrewAgentic</strong> CLI from GitHub. 
          <br /><br />
          <em>BrewAssist Online acts as the control plane for your local BrewAgentic terminal.</em>
        </div>
      )}

      {(repoProvider === 'github' || repoProvider === 'gitlab' || repoProvider === 'bitbucket') && currentToken && currentRepos.length > 0 ? (
        <label style={{ position: 'relative' }} title={isPrivateSelected ? "Make Public to use this repo" : ""}>
          <span className="repo-provider-label">Repository</span>
          <select
            className="repo-provider-select"
            value={repoRoot}
            onChange={(e) => setRepoRoot(e.target.value)}
            disabled={isBindingSandbox}
            style={isPrivateSelected ? { borderColor: 'rgba(248, 113, 113, 0.5)' } : {}}
          >
            <option value="">Select a repo...</option>
            {currentRepos.map((repo: GitHubRepo) => (
              <option key={repo.id} value={repo.fullName}>
                {repo.fullName} {repo.isPrivate ? '🔒' : ''}
              </option>
            ))}
          </select>
          {isPrivateSelected && (
            <div style={{
              position: 'absolute',
              top: '120%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(220, 38, 38, 0.9)',
              color: 'white',
              fontSize: '0.6rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              Make Public to use this repo
            </div>
          )}
        </label>
      ) : (
        <label>
          <span className="repo-provider-label">Repo Root</span>
          <input
            className="repo-provider-select"
            value={repoRoot}
            onChange={(e) => setRepoRoot(e.target.value)}
            placeholder="/path/to/repo"
          />
        </label>
      )}

      {isBindingSandbox && (
        <div 
          className="repo-provider-connected"
          style={{
            marginLeft: '0.5rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            color: '#f8e7a3',
            fontSize: '0.65rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <span>⏳ Binding Sandbox...</span>
        </div>
      )}

      {(repoProvider === 'github' || repoProvider === 'gitlab' || repoProvider === 'bitbucket') && !currentToken && (
        <button
          type="button"
          className="cockpit-signin-btn"
          style={{ marginLeft: '0.5rem', minHeight: '30px', padding: '0.2rem 0.8rem', fontSize: '0.7rem' }}
          onClick={handleConnectClick}
        >
          Connect
        </button>
      )}

      {(repoProvider === 'github' || repoProvider === 'gitlab' || repoProvider === 'bitbucket') && currentToken && !isBindingSandbox && (
        <div 
          className="repo-provider-connected"
          style={{
            marginLeft: '0.5rem',
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            background: 'rgba(0, 199, 183, 0.1)',
            border: '1px solid rgba(0, 199, 183, 0.3)',
            color: '#9cefe5',
            fontSize: '0.65rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <span>✓ Connected</span>
        </div>
      )}
    </div>
  );
}
