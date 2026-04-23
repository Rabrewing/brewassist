'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RepoProvider } from '@/lib/enterpriseContext';
import { advanceInitWizardAfterProviderAuth } from '@/lib/init/initWizardStorage';

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  isPrivate: boolean;
  url: string;
  description: string | null;
  defaultBranch: string;
}

export interface RepoConnectionState {
  repoProvider: RepoProvider;
  repoRoot: string;
  githubToken?: string;
  gitlabToken?: string;
  bitbucketToken?: string;
  showDeviceFlow: boolean;
  githubRepos: GitHubRepo[];
  gitlabRepos: GitHubRepo[];
  bitbucketRepos: GitHubRepo[];
  isBindingSandbox: boolean;
  activeSandboxPath?: string;
}

interface RepoConnectionContextValue extends RepoConnectionState {
  setRepoProvider: (provider: RepoProvider) => void;
  setRepoRoot: (repoRoot: string) => void;
  setGithubToken: (token: string) => void;
  setGitlabToken: (token: string) => void;
  setBitbucketToken: (token: string) => void;
  closeDeviceFlow: () => void;
  triggerDeviceFlow: () => void;
  fetchGithubRepos: () => Promise<void>;
  fetchGitlabRepos: () => Promise<void>;
  fetchBitbucketRepos: () => Promise<void>;
  bindSandbox: (provider: string, repoFullName: string, token: string) => Promise<void>;
}

const RepoConnectionContext = createContext<
  RepoConnectionContextValue | undefined
>(undefined);

const DEFAULT_REPO_PROVIDER: RepoProvider = 'github';
const DEFAULT_REPO_ROOT = '';

export function RepoConnectionProvider({
  children,
  initialRepoProvider,
  initialRepoRoot,
}: {
  children: React.ReactNode;
  initialRepoProvider?: RepoProvider;
  initialRepoRoot?: string;
}) {
  const [repoProvider, setRepoProviderState] = useState<RepoProvider>(
    initialRepoProvider || DEFAULT_REPO_PROVIDER
  );
  const [repoRoot, setRepoRootState] = useState(
    initialRepoRoot || DEFAULT_REPO_ROOT
  );
  const [githubToken, setGithubTokenState] = useState<string | undefined>();
  const [gitlabToken, setGitlabTokenState] = useState<string | undefined>();
  const [bitbucketToken, setBitbucketTokenState] = useState<string | undefined>();
  const [showDeviceFlow, setShowDeviceFlow] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [gitlabRepos, setGitlabRepos] = useState<GitHubRepo[]>([]);
  const [bitbucketRepos, setBitbucketRepos] = useState<GitHubRepo[]>([]);
  const [isBindingSandbox, setIsBindingSandbox] = useState(false);
  const [activeSandboxPath, setActiveSandboxPath] = useState<string | undefined>();

  useEffect(() => {
    // 1. Check for incoming OAuth tokens in URL hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('gitlab_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('gitlab_token');
        if (token) {
          setGitlabTokenState(token);
          window.localStorage.setItem('gitlab_token', token);
          setRepoProviderState('gitlab');
          window.localStorage.setItem('repoProvider', 'gitlab');
          advanceInitWizardAfterProviderAuth();
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else if (hash.includes('bitbucket_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const token = params.get('bitbucket_token');
        if (token) {
          setBitbucketTokenState(token);
          window.localStorage.setItem('bitbucket_token', token);
          setRepoProviderState('bitbucket');
          window.localStorage.setItem('repoProvider', 'bitbucket');
          advanceInitWizardAfterProviderAuth();
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
    }

    // 2. Load stored state
    const storedProvider = window.localStorage.getItem(
      'repoProvider'
    ) as RepoProvider | null;
    const storedRepoRoot = window.localStorage.getItem('repoRoot');
    const storedGhToken = window.localStorage.getItem('github_token');
    const storedGlToken = window.localStorage.getItem('gitlab_token');
    const storedBbToken = window.localStorage.getItem('bitbucket_token');
    const storedSandboxPath = window.localStorage.getItem('activeSandboxPath');

    if (storedProvider) setRepoProviderState(storedProvider);
    if (storedRepoRoot) setRepoRootState(storedRepoRoot);
    if (storedGhToken) setGithubTokenState(storedGhToken);
    if (storedGlToken && !gitlabToken) setGitlabTokenState(storedGlToken);
    if (storedBbToken && !bitbucketToken) setBitbucketTokenState(storedBbToken);
    if (storedSandboxPath) setActiveSandboxPath(storedSandboxPath);
  }, []);

  const bindSandbox = async (provider: string, repoFullName: string, token: string) => {
    setIsBindingSandbox(true);
    try {
      const res = await fetch('/api/sandbox/bind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ provider, repoFullName })
      });
      
      const data = await res.json();
      if (data.success && data.summary?.sandboxPath) {
        setActiveSandboxPath(data.summary.sandboxPath);
        window.localStorage.setItem('activeSandboxPath', data.summary.sandboxPath);
      }
    } catch (err) {
      console.error('Failed to bind sandbox:', err);
    } finally {
      setIsBindingSandbox(false);
    }
  };

  const setRepoRootWithBinding = (nextRepoRoot: string) => {
    setRepoRootState(nextRepoRoot);
    window.localStorage.setItem('repoRoot', nextRepoRoot);
    
    // Automatically trigger sandbox binding if we have a token for the active provider
    if (repoProvider === 'github' && githubToken && nextRepoRoot) {
      bindSandbox('github', nextRepoRoot, githubToken);
    } else if (repoProvider === 'gitlab' && gitlabToken && nextRepoRoot) {
      bindSandbox('gitlab', nextRepoRoot, gitlabToken);
    } else if (repoProvider === 'bitbucket' && bitbucketToken && nextRepoRoot) {
      bindSandbox('bitbucket', nextRepoRoot, bitbucketToken);
    }
  };

  const fetchGithubRepos = async () => {
    const token = window.localStorage.getItem('github_token');
    if (!token) return;

    try {
      const res = await fetch('/api/github/repos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        setGithubTokenState(undefined);
        window.localStorage.removeItem('github_token');
        return;
      }

      const data = await res.json();
      if (data.repos) {
        setGithubRepos(data.repos);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub repos:', err);
    }
  };

  const fetchGitlabRepos = async () => {
    const token = window.localStorage.getItem('gitlab_token') || gitlabToken;
    if (!token) return;

    try {
      const res = await fetch('/api/gitlab/repos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        setGitlabTokenState(undefined);
        window.localStorage.removeItem('gitlab_token');
        return;
      }

      const data = await res.json();
      if (data.repos) {
        setGitlabRepos(data.repos);
      }
    } catch (err) {
      console.error('Failed to fetch GitLab repos:', err);
    }
  };

  const fetchBitbucketRepos = async () => {
    const token = window.localStorage.getItem('bitbucket_token') || bitbucketToken;
    if (!token) return;

    try {
      const res = await fetch('/api/bitbucket/repos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        setBitbucketTokenState(undefined);
        window.localStorage.removeItem('bitbucket_token');
        return;
      }

      const data = await res.json();
      if (data.repos) {
        setBitbucketRepos(data.repos);
      }
    } catch (err) {
      console.error('Failed to fetch Bitbucket repos:', err);
    }
  };

  const value: RepoConnectionContextValue = {
    repoProvider,
    repoRoot,
    githubToken,
    gitlabToken,
    bitbucketToken,
    showDeviceFlow,
    githubRepos,
    gitlabRepos,
    bitbucketRepos,
    isBindingSandbox,
    activeSandboxPath,
    setRepoProvider: (nextProvider) => {
      setRepoProviderState(nextProvider);
      window.localStorage.setItem('repoProvider', nextProvider);
    },
    setRepoRoot: setRepoRootWithBinding,
    setGithubToken: (token) => {
      setGithubTokenState(token);
      window.localStorage.setItem('github_token', token);
      advanceInitWizardAfterProviderAuth();
    },
    setGitlabToken: (token) => {
      setGitlabTokenState(token);
      window.localStorage.setItem('gitlab_token', token);
      advanceInitWizardAfterProviderAuth();
    },
    setBitbucketToken: (token) => {
      setBitbucketTokenState(token);
      window.localStorage.setItem('bitbucket_token', token);
      advanceInitWizardAfterProviderAuth();
    },
    closeDeviceFlow: () => setShowDeviceFlow(false),
    triggerDeviceFlow: () => setShowDeviceFlow(true),
    fetchGithubRepos,
    fetchGitlabRepos,
    fetchBitbucketRepos,
    bindSandbox,
  };

  return (
    <RepoConnectionContext.Provider value={value}>
      {children}
    </RepoConnectionContext.Provider>
  );
}

export function useRepoConnection() {
  const context = useContext(RepoConnectionContext);
  if (!context) {
    throw new Error(
      'useRepoConnection must be used within a RepoConnectionProvider'
    );
  }
  return context;
}
