'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const ORG_KEY = 'brewassist.selected-org-id';
const WORKSPACE_KEY = 'brewassist.selected-workspace-id';

export type EnterpriseOrganizationOption = {
  id: string;
  name: string;
  slug: string;
  plan?: string;
};

export type EnterpriseWorkspaceOption = {
  id: string;
  org_id: string;
  name: string;
};

type EnterpriseSelectionContextValue = {
  orgId: string | null;
  workspaceId: string | null;
  selectedReplayRunId: string | null;
  replayOpenRequestToken: number;
  organizations: EnterpriseOrganizationOption[];
  workspaces: EnterpriseWorkspaceOption[];
  setOrgId: (orgId: string | null) => void;
  setWorkspaceId: (workspaceId: string | null) => void;
  setSelectedReplayRunId: (runId: string | null) => void;
  requestReplayOpen: () => void;
  setOrganizations: (organizations: EnterpriseOrganizationOption[]) => void;
  setWorkspaces: (workspaces: EnterpriseWorkspaceOption[]) => void;
};

const EnterpriseSelectionContext =
  createContext<EnterpriseSelectionContextValue | null>(null);

export function EnterpriseSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [orgId, setOrgIdState] = useState<string | null>(null);
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null);
  const [selectedReplayRunId, setSelectedReplayRunIdState] = useState<
    string | null
  >(null);
  const [replayOpenRequestToken, setReplayOpenRequestToken] = useState(0);
  const [organizations, setOrganizationsState] = useState<
    EnterpriseOrganizationOption[]
  >([]);
  const [workspaces, setWorkspacesState] = useState<
    EnterpriseWorkspaceOption[]
  >([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setOrgIdState(window.localStorage.getItem(ORG_KEY));
    setWorkspaceIdState(window.localStorage.getItem(WORKSPACE_KEY));
  }, []);

  const setOrgId = useCallback((nextOrgId: string | null) => {
    setOrgIdState(nextOrgId);
    if (typeof window !== 'undefined') {
      if (nextOrgId) {
        window.localStorage.setItem(ORG_KEY, nextOrgId);
      } else {
        window.localStorage.removeItem(ORG_KEY);
      }
    }
  }, []);

  const setWorkspaceId = useCallback((nextWorkspaceId: string | null) => {
    setWorkspaceIdState(nextWorkspaceId);
    if (typeof window !== 'undefined') {
      if (nextWorkspaceId) {
        window.localStorage.setItem(WORKSPACE_KEY, nextWorkspaceId);
      } else {
        window.localStorage.removeItem(WORKSPACE_KEY);
      }
    }
  }, []);

  const setSelectedReplayRunId = useCallback((nextRunId: string | null) => {
    setSelectedReplayRunIdState(nextRunId);
  }, []);

  const requestReplayOpen = useCallback(() => {
    setReplayOpenRequestToken(Date.now());
  }, []);

  const setOrganizations = useCallback(
    (nextOrganizations: EnterpriseOrganizationOption[]) => {
      setOrganizationsState(nextOrganizations);
    },
    []
  );

  const setWorkspaces = useCallback(
    (nextWorkspaces: EnterpriseWorkspaceOption[]) => {
      setWorkspacesState(nextWorkspaces);
    },
    []
  );

  const value = useMemo<EnterpriseSelectionContextValue>(
    () => ({
      orgId,
      workspaceId,
      selectedReplayRunId,
      replayOpenRequestToken,
      organizations,
      workspaces,
      setOrgId,
      setWorkspaceId,
      setSelectedReplayRunId,
      requestReplayOpen,
      setOrganizations,
      setWorkspaces,
    }),
    [
      orgId,
      organizations,
      replayOpenRequestToken,
      requestReplayOpen,
      selectedReplayRunId,
      setOrgId,
      setOrganizations,
      setSelectedReplayRunId,
      setWorkspaceId,
      setWorkspaces,
      workspaceId,
      workspaces,
    ]
  );

  return (
    <EnterpriseSelectionContext.Provider value={value}>
      {children}
    </EnterpriseSelectionContext.Provider>
  );
}

export function useEnterpriseSelection() {
  const context = useContext(EnterpriseSelectionContext);
  if (!context) {
    throw new Error(
      'useEnterpriseSelection must be used within EnterpriseSelectionProvider'
    );
  }
  return context;
}
