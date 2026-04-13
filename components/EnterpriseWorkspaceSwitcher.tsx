'use client';

import React, { useMemo } from 'react';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';

export function EnterpriseWorkspaceSwitcher() {
  const {
    orgId,
    workspaceId,
    organizations,
    workspaces,
    setOrgId,
    setWorkspaceId,
  } = useEnterpriseSelection();

  const selectedOrg = useMemo(
    () => organizations.find((item) => item.id === orgId) ?? null,
    [organizations, orgId]
  );
  const selectedWorkspace = useMemo(
    () => workspaces.find((item) => item.id === workspaceId) ?? null,
    [workspaces, workspaceId]
  );

  const workspaceOptions = useMemo(
    () => workspaces.filter((item) => item.org_id === orgId),
    [orgId, workspaces]
  );

  return (
    <div className="repo-provider-selector">
      <label>
        <span className="repo-provider-label">Org</span>
        <select
          className="repo-provider-select"
          value={orgId ?? ''}
          onChange={(event) => {
            const nextOrgId = event.target.value || null;
            setOrgId(nextOrgId);
            const nextWorkspace =
              workspaces.find((item) => item.org_id === nextOrgId) ?? null;
            setWorkspaceId(nextWorkspace?.id ?? null);
          }}
        >
          {organizations.length === 0 ? (
            <option value="">No orgs</option>
          ) : null}
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="repo-provider-label">Workspace</span>
        <select
          className="repo-provider-select"
          value={workspaceId ?? ''}
          onChange={(event) => setWorkspaceId(event.target.value || null)}
          disabled={workspaceOptions.length === 0}
        >
          {workspaceOptions.length === 0 ? (
            <option value="">No workspace</option>
          ) : null}
          {workspaceOptions.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </label>

      {selectedOrg && selectedWorkspace ? (
        <span className="cockpit-mode-pill">
          {selectedOrg.name} · {selectedWorkspace.name}
        </span>
      ) : null}
    </div>
  );
}
