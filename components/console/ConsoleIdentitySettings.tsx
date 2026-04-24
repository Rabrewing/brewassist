'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

type IdentityAdminResponse = {
  config?: {
    migrationReady: boolean;
    providers: Array<{
      id: string;
      provider_name: string;
      protocol: string;
      status: string;
      domain_hint: string | null;
      issuer: string | null;
    }>;
    domains: Array<{
      id: string;
      domain: string;
      verification_method: string;
      verification_token: string;
      status: string;
      verified_at: string | null;
    }>;
    warnings: string[];
  };
  role?: string;
  canManage?: boolean;
  error?: string;
};

type ConsoleIdentitySettingsProps = {
  identity: {
    authFoundation: 'supabase-session';
    role: string;
    modesOffered: string[];
    ssoReady: boolean;
    scimReady: boolean;
    domainVerificationReady: boolean;
    capabilities: Array<{
      key: string;
      label: string;
      status: 'live' | 'planned' | 'missing';
      detail: string;
    }>;
    nextActions: string[];
  } | null;
};

const SETTINGS_TABS = [
  'General',
  'Security',
  'Identity',
  'Domains',
  'API Keys',
  'Integrations',
];

export function ConsoleIdentitySettings({
  identity,
}: ConsoleIdentitySettingsProps) {
  const { session } = useSupabaseAuth();
  const { orgId } = useEnterpriseSelection();
  const [adminState, setAdminState] = useState<IdentityAdminResponse['config'] | null>(
    null
  );
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerName, setProviderName] = useState('Okta');
  const [protocol, setProtocol] = useState<'oidc' | 'saml'>('oidc');
  const [domainHint, setDomainHint] = useState('');
  const [issuer, setIssuer] = useState('');
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = session?.access_token;

    if (!accessToken || !orgId) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadConfig() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/identity/admin/config', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-brewassist-org-id': orgId ?? '',
          },
        });

        const data = (await response.json()) as IdentityAdminResponse;
        if (!response.ok) {
          throw new Error(data.error || 'Failed to load identity configuration');
        }

        if (!active) return;
        setAdminState(data.config ?? null);
        setCanManage(Boolean(data.canManage));
      } catch (nextError: any) {
        if (!active) return;
        setError(nextError?.message ?? 'Failed to load identity configuration');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadConfig();

    return () => {
      active = false;
    };
  }, [orgId, session]);

  async function submit(action: 'upsert-provider' | 'upsert-domain') {
    const accessToken = session?.access_token;
    if (!accessToken || !orgId) return;

    setSaving(action);
    setError(null);

    try {
      const response = await fetch('/api/identity/admin/config', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-brewassist-org-id': orgId ?? '',
        },
        body: JSON.stringify(
          action === 'upsert-provider'
            ? {
                action,
                providerName,
                protocol,
                domainHint,
                issuer,
              }
            : {
                action,
                domain,
              }
        ),
      });

      const data = (await response.json()) as IdentityAdminResponse;
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save identity configuration');
      }

      setAdminState(data.config ?? null);
      if (action === 'upsert-provider') {
        setIssuer('');
      }
      if (action === 'upsert-domain') {
        setDomain('');
      }
    } catch (nextError: any) {
      setError(nextError?.message ?? 'Failed to save identity configuration');
    } finally {
      setSaving(null);
    }
  }

  const statusSummary = useMemo(
    () => [
      `Auth foundation: ${identity?.authFoundation ?? 'supabase-session'}`,
      `SSO ready: ${String(identity?.ssoReady ?? false)}`,
      `SCIM ready: ${String(identity?.scimReady ?? false)}`,
      `Domain verification ready: ${String(
        identity?.domainVerificationReady ?? false
      )}`,
    ],
    [identity]
  );

  return (
    <section className="console-settings-stack">
      <div className="console-pill-row">
        {SETTINGS_TABS.map((tab) => (
          <span
            key={tab}
            className={`console-pill ${tab === 'Identity' ? 'is-active' : ''}`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="console-settings-layout">
        <div className="console-settings-main">
          <article className="console-card">
            <div className="console-card-heading">
              <strong>Enterprise Identity</strong>
              <span>Tenant-scoped SSO and verified-domain setup.</span>
            </div>
            <div className="console-list">
              {statusSummary.map((item) => (
                <div key={item} className="console-list-item">
                  {item}
                </div>
              ))}
              {(identity?.nextActions ?? []).map((item) => (
                <div key={item} className="console-list-item">
                  Next: {item}
                </div>
              ))}
            </div>
          </article>

          <article className="console-card">
            <div className="console-card-heading">
              <strong>Identity Provider Setup</strong>
              <span>Start with `OIDC` or `SAML 2.0` and then layer in SCIM.</span>
            </div>
            <div className="console-form-grid">
              <label className="console-field">
                <span>Provider Name</span>
                <input
                  value={providerName}
                  onChange={(event) => setProviderName(event.target.value)}
                  disabled={!canManage}
                />
              </label>
              <label className="console-field">
                <span>Protocol</span>
                <select
                  value={protocol}
                  onChange={(event) =>
                    setProtocol(event.target.value as 'oidc' | 'saml')
                  }
                  disabled={!canManage}
                >
                  <option value="oidc">OIDC</option>
                  <option value="saml">SAML 2.0</option>
                </select>
              </label>
              <label className="console-field">
                <span>Domain Hint</span>
                <input
                  value={domainHint}
                  onChange={(event) => setDomainHint(event.target.value)}
                  placeholder="acme.com"
                  disabled={!canManage}
                />
              </label>
              <label className="console-field">
                <span>Issuer / Tenant URL</span>
                <input
                  value={issuer}
                  onChange={(event) => setIssuer(event.target.value)}
                  placeholder="https://idp.example.com/"
                  disabled={!canManage}
                />
              </label>
            </div>
            <div className="console-cta-row">
              <button
                type="button"
                className="public-landing-button public-landing-button--primary"
                onClick={() => void submit('upsert-provider')}
                disabled={!canManage || saving === 'upsert-provider'}
              >
                {saving === 'upsert-provider' ? 'Saving…' : 'Save Identity Provider'}
              </button>
            </div>
          </article>

          <article className="console-card">
            <div className="console-card-heading">
              <strong>Verified Domains</strong>
              <span>Reserve the domains that should be allowed for enterprise login.</span>
            </div>
            <div className="console-form-grid console-form-grid--domain">
              <label className="console-field">
                <span>Domain</span>
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="acme.com"
                  disabled={!canManage}
                />
              </label>
              <div className="console-cta-row">
                <button
                  type="button"
                  className="public-landing-button"
                  onClick={() => void submit('upsert-domain')}
                  disabled={!canManage || saving === 'upsert-domain'}
                >
                  {saving === 'upsert-domain' ? 'Saving…' : 'Add Domain'}
                </button>
              </div>
            </div>
            <div className="console-list">
              {(adminState?.domains ?? []).map((item) => (
                <div key={item.id} className="console-list-item">
                  <strong>{item.domain}</strong>
                  <p>
                    {item.status} via {item.verification_method} · token:{' '}
                    {item.verification_token}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="console-settings-side">
          <article className="console-card">
            <div className="console-card-heading">
              <strong>Configured Providers</strong>
              <span>{canManage ? 'Admin access enabled' : 'Read-only view'}</span>
            </div>
            {loading ? (
              <div className="public-landing-status">Loading identity config…</div>
            ) : null}
            {error ? <div className="public-landing-status">{error}</div> : null}
            <div className="console-list">
              {(adminState?.warnings ?? []).map((item) => (
                <div key={item} className="console-list-item">
                  {item}
                </div>
              ))}
              {(adminState?.providers ?? []).map((item) => (
                <div key={item.id} className="console-list-item">
                  <strong>
                    {item.provider_name} · {item.protocol.toUpperCase()}
                  </strong>
                  <p>
                    {item.status}
                    {item.domain_hint ? ` · ${item.domain_hint}` : ''}
                    {item.issuer ? ` · ${item.issuer}` : ''}
                  </p>
                </div>
              ))}
              {!loading &&
              !error &&
              (adminState?.providers?.length ?? 0) === 0 &&
              (adminState?.warnings?.length ?? 0) === 0 ? (
                <div className="console-list-item">
                  No enterprise identity providers configured yet.
                </div>
              ) : null}
            </div>
          </article>

          <article className="console-card">
            <div className="console-card-heading">
              <strong>Capability Readout</strong>
              <span>Current enterprise posture for this org.</span>
            </div>
            <div className="console-list">
              {(identity?.capabilities ?? []).map((item) => (
                <div key={item.key} className="console-list-item">
                  <strong>{item.label}</strong>
                  <p>
                    {item.status} · {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
