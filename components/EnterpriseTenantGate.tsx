'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';

const SUPER_ADMIN_EMAIL = 'brewmaster.rb@brewassist.app';

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  plan?: string;
};

type MembershipRow = {
  org_id: string;
  role_name: string;
  organizations: OrganizationRow | OrganizationRow[] | null;
};

type WorkspaceRow = {
  id: string;
  org_id: string;
  name: string;
};

function unwrapOrganization(
  value: MembershipRow['organizations']
): OrganizationRow | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function EnterpriseTenantGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, user } = useSupabaseAuth();
  const {
    orgId,
    workspaceId,
    organizations,
    workspaces,
    setOrgId,
    setWorkspaceId,
    setOrganizations,
    setWorkspaces,
  } = useEnterpriseSelection();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const client = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (client) return;
    setError('Supabase client unavailable');
    setLoading(false);
  }, [client]);

  useEffect(() => {
    if (!client || !user) return;

    let active = true;
    setLoading(true);

    async function loadTenantData() {
      const activeClient = client;
      const activeUser = user;
      if (!activeClient || !activeUser) {
        setLoading(false);
        return;
      }

      const { data: memberships, error: membershipsError } = await activeClient
        .from('memberships')
        .select('org_id, role_name, organizations(id, name, slug)')
        .eq('user_id', activeUser.id)
        .eq('status', 'active');

      if (!active) return;
      if (membershipsError) {
        setError(membershipsError.message);
        setLoading(false);
        return;
      }

      const uniqueOrgs = new Map<string, OrganizationRow>();
      (memberships ?? []).forEach((membership: MembershipRow) => {
        const org = unwrapOrganization(membership.organizations);
        if (org) uniqueOrgs.set(org.id, org);
      });

      const orgList = [...uniqueOrgs.values()];
      setOrganizations(orgList);

      const activeOrgId =
        orgList.find((item) => item.id === orgId)?.id ?? orgList[0]?.id ?? null;
      if (activeOrgId && activeOrgId !== orgId) {
        setOrgId(activeOrgId);
      }

      if (activeOrgId) {
        const { data: workspaceRows, error: workspaceError } =
          await activeClient
            .from('workspaces')
            .select('id, org_id, name')
            .eq('org_id', activeOrgId)
            .order('created_at', { ascending: true });

        if (!active) return;
        if (workspaceError) {
          setError(workspaceError.message);
        } else {
          const rows = (workspaceRows ?? []) as WorkspaceRow[];
          setWorkspaces(rows);
          const activeWorkspaceId =
            rows.find((item) => item.id === workspaceId)?.id ??
            rows[0]?.id ??
            null;
          if (activeWorkspaceId && activeWorkspaceId !== workspaceId) {
            setWorkspaceId(activeWorkspaceId);
          }
        }
      }

      setLoading(false);
    }

    void loadTenantData();

    return () => {
      active = false;
    };
  }, [
    client,
    user,
    orgId,
    setOrgId,
    setOrganizations,
    setWorkspaceId,
    setWorkspaces,
  ]);

  useEffect(() => {
    if (!client || !user) return;
    if (loading || organizations.length > 0 || provisioning) return;
    if (user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) return;

    let active = true;
    setProvisioning(true);

    const bootstrapSuperAdmin = async () => {
      try {
        const response = await fetch('/api/enterprise/bootstrap-org', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            orgName: 'BrewMaster Control',
            slug: 'brewmaster-rb-control',
            workspaceName: 'Command Center',
          }),
        });

        if (!active) return;

        if (!response.ok) {
          const detail = await response.text();
          setError(
            `Auto-provision failed: ${response.status}${detail ? ` - ${detail}` : ''}`
          );
          return;
        }

        const result = await response.json();
        if (result?.org?.id) {
          setOrganizations([
            {
              id: result.org.id,
              name: result.org.name,
              slug: result.org.slug,
              plan: result.org.plan ?? 'free',
            },
          ]);
          setOrgId(result.org.id);
        }
        if (result?.workspace?.id) {
          setWorkspaces([
            {
              id: result.workspace.id,
              org_id: result.org.id,
              name: result.workspace.name,
            },
          ]);
          setWorkspaceId(result.workspace.id);
        }
      } finally {
        if (!active) return;
        setProvisioning(false);
        setLoading(false);
      }
    };

    void bootstrapSuperAdmin();

    return () => {
      active = false;
    };
  }, [
    client,
    loading,
    provisioning,
    setOrgId,
    setOrganizations,
    setWorkspaceId,
    setWorkspaces,
    user,
    session,
    organizations.length,
  ]);

  const selectedOrg = useMemo(
    () => organizations.find((item) => item.id === orgId) ?? null,
    [orgId, organizations]
  );

  const selectedWorkspace = useMemo(
    () => workspaces.find((item) => item.id === workspaceId) ?? null,
    [workspaceId, workspaces]
  );

  if (loading || provisioning) {
    return (
      <div className="public-landing-status">
        {provisioning
          ? 'Provisioning super admin access…'
          : 'Loading your workspace…'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-landing-status">Tenant setup error: {error}</div>
    );
  }

  if (!organizations.length) {
    const submitBootstrap = async (event: React.FormEvent) => {
      event.preventDefault();
      if (!user) return;

      const response = await fetch('/api/enterprise/bootstrap-org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({
          orgName,
          slug,
          workspaceName: workspaceName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      if (result?.org?.id) setOrgId(result.org.id);
      if (result?.workspace?.id) setWorkspaceId(result.workspace.id);
      setOrganizations([
        {
          id: result.org.id,
          name: result.org.name,
          slug: result.org.slug,
          plan: result.org.plan ?? 'free',
        },
      ]);
      if (result?.workspace?.id) {
        setWorkspaces([
          {
            id: result.workspace.id,
            org_id: result.org.id,
            name: result.workspace.name,
          },
        ]);
      }
    };

    return (
      <div className="public-landing-shell">
        <section className="public-landing-hero">
          <div className="public-landing-kicker">Enterprise setup</div>
          <h1>Create your first org.</h1>
          <p>
            You’re signed in, but no organization membership was found yet.
            Create an org and workspace to continue.
          </p>
          <form className="public-landing-form" onSubmit={submitBootstrap}>
            <input
              className="public-landing-input"
              id="org-name"
              name="orgName"
              placeholder="Organization Name (e.g., Brewington Exec Group)"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                className="public-landing-input"
                id="org-slug"
                name="slug"
                placeholder="Organization URL Slug (e.g., brewington-exec)"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                style={{ marginBottom: '4px' }}
              />
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', marginBottom: '16px', marginLeft: '4px' }}>
                This is the unique URL-friendly ID for your organization (lowercase, no spaces).
              </span>
            </div>
            <input
              className="public-landing-input"
              id="workspace-name"
              name="workspaceName"
              placeholder="Workspace Name (optional)"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
            <button className="public-landing-button" type="submit">
              Create org
            </button>
          </form>
        </section>
      </div>
    );
  }

  if (selectedOrg && selectedWorkspace) {
    return <>{children}</>;
  }

  return (
    <div className="enterprise-gate-shell public-landing-shell">
      <section className="enterprise-gate-card public-site-panel">
        <div>
          <div className="public-landing-kicker">Select Workspace</div>
          <h2>{selectedOrg?.name ?? 'Your Organization'}</h2>
          <p>
            Choose your workspace before entering the cockpit.
          </p>
        </div>
        <div className="enterprise-gate-grid public-landing-card-grid" style={{ marginTop: '1rem' }}>
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              className={`public-landing-card ${workspace.id === workspaceId ? 'is-active' : ''}`}
              onClick={() => setWorkspaceId(workspace.id)}
              style={{ textAlign: 'left', cursor: 'pointer', border: workspace.id === workspaceId ? '1px solid #00c7b7' : undefined }}
            >
              <strong>{workspace.name}</strong>
              <p>Workspace</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
