import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

import { BillingStatusBadge } from '@/components/BillingStatusBadge';
import { EnterpriseTenantGate } from '@/components/EnterpriseTenantGate';
import { EnterpriseWorkspaceSwitcher } from '@/components/EnterpriseWorkspaceSwitcher';
import { RepoProviderSelector } from '@/components/RepoProviderSelector';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { PublicSiteLayout } from '@/components/PublicSiteLayout';
import { PublicAuthPanel } from '@/components/PublicAuthPanel';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

type ConsoleShellProps = {
  title: string;
  subtitle: string;
  activePath: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
};

const CONSOLE_NAV = [
  { href: '/console/overview', label: 'Overview' },
  { href: '/console/command-center', label: 'Command Center' },
  { href: '/console/workspaces', label: 'Workspaces' },
  { href: '/console/brew-agentic', label: 'Brew Agentic' },
  { href: '/console/usage-logs', label: 'Usage & Logs' },
  { href: '/console/billing', label: 'Billing' },
  { href: '/console/providers', label: 'Providers' },
  { href: '/console/support', label: 'Support' },
  { href: '/console/settings', label: 'Settings' },
  { href: '/console/trust-center', label: 'Trust Center' },
];

export function ConsoleShell({
  title,
  subtitle,
  activePath,
  searchPlaceholder = 'Search console…',
  children,
}: ConsoleShellProps) {
  const { session, loading, signOut } = useSupabaseAuth();
  const controlPlane = useConsoleControlPlane();

  if (loading) {
    return (
      <div className="public-landing-shell public-landing-shell--loading">
        <div className="public-landing-status">Loading BrewAssist console…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <PublicSiteLayout>
        <section className="public-site-panel public-site-panel--hero">
          <div className="public-site-hero-grid">
            <div className="public-site-copy">
              <div className="public-landing-kicker">Console Access</div>
              <h1 className="public-site-title">
                Sign in before opening the shared BrewAssist console.
              </h1>
              <p className="public-site-lede">
                `console.brewassist.app` is the hosted control plane for
                workspaces, runtime links, providers, billing, and trust.
              </p>
              <div className="public-site-cta-row">
                <Link
                  href="/"
                  className="public-landing-button public-landing-button--primary"
                >
                  Return To Landing
                </Link>
              </div>
            </div>
            <div className="public-site-hero-art">
              <PublicAuthPanel compact />
            </div>
          </div>
        </section>
      </PublicSiteLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{title} | BrewAssist Console</title>
      </Head>
      <EnterpriseTenantGate>
        <div className="console-shell">
          <div className="console-top-frame">
            <header className="console-header">
              <div className="console-header-left">
                <Link href="/console/overview" className="console-brand">
                  BrewAssist Console
                </Link>
                <EnterpriseWorkspaceSwitcher />
              </div>
              <div className="console-header-search">
                <div className="console-search-input" aria-label="Console search">
                  <span className="console-search-glyph" aria-hidden="true" />
                  <span>{searchPlaceholder}</span>
                  <span className="console-search-shortcut">Soon</span>
                </div>
              </div>
              <div className="console-header-right">
                <span className="console-status-pill">Connected</span>
                <BillingStatusBadge />
                <span className="cockpit-mode-pill">
                  Signed in ·{' '}
                  {controlPlane.account?.email ??
                    session.user.email ??
                    'BrewAssist user'}
                </span>
                <button
                  type="button"
                  className="cockpit-signin-btn"
                  onClick={() => void signOut()}
                >
                  Sign out
                </button>
              </div>
            </header>

            <div className="console-subheader">
              <div className="console-subheader-copy">
                <h1>{title}</h1>
                <p>{subtitle}</p>
              </div>
              <RepoProviderSelector />
            </div>

            <nav className="console-tab-strip" aria-label="Console sections">
              {CONSOLE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.href === activePath
                      ? 'console-tab-link is-active'
                      : 'console-tab-link'
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="console-body">
            <aside className="console-sidebar">
              <div className="console-sidebar-section">
                <span className="console-card-label">Current Section</span>
                <strong>{title}</strong>
                <p>{subtitle}</p>
              </div>

              <div className="console-sidebar-meta">
                <div className="console-sidebar-plan">
                  <span className="console-card-label">Plan</span>
                  <strong>
                    {controlPlane.billing?.plan ?? controlPlane.account?.plan ?? 'Free'}
                  </strong>
                  <p>
                    {controlPlane.workspace?.name
                      ? `Active workspace: ${controlPlane.workspace.name}`
                      : 'Credits balance available in billing.'}
                  </p>
                  <Link href="/console/billing" className="console-meta-button">
                    Open Billing
                  </Link>
                </div>
                <div className="console-sidebar-version">v1.2.0</div>
              </div>
            </aside>

            <main className="console-main">{children}</main>
          </div>
        </div>
      </EnterpriseTenantGate>
    </>
  );
}
