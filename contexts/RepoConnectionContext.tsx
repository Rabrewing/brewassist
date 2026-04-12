'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RepoProvider } from '@/lib/enterpriseContext';

export interface RepoConnectionState {
  repoProvider: RepoProvider;
  repoRoot: string;
}

interface RepoConnectionContextValue extends RepoConnectionState {
  setRepoProvider: (provider: RepoProvider) => void;
  setRepoRoot: (repoRoot: string) => void;
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

  useEffect(() => {
    const storedProvider = window.localStorage.getItem(
      'repoProvider'
    ) as RepoProvider | null;
    const storedRepoRoot = window.localStorage.getItem('repoRoot');

    if (storedProvider) setRepoProviderState(storedProvider);
    if (storedRepoRoot) setRepoRootState(storedRepoRoot);
  }, []);

  const value: RepoConnectionContextValue = {
    repoProvider,
    repoRoot,
    setRepoProvider: (nextProvider) => {
      setRepoProviderState(nextProvider);
      window.localStorage.setItem('repoProvider', nextProvider);
    },
    setRepoRoot: (nextRepoRoot) => {
      setRepoRootState(nextRepoRoot);
      window.localStorage.setItem('repoRoot', nextRepoRoot);
    },
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
