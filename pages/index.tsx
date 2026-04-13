import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { WorkspaceSidebarLeft } from '../components/WorkspaceSidebarLeft';
import { WorkspaceSidebarRight } from '../components/WorkspaceSidebarRight'; // Import WorkspaceSidebarRight
import { BrewCockpitCenter } from '../components/BrewCockpitCenter';
import { ToolbeltProvider } from '@/contexts/ToolbeltContext'; // Import ToolbeltProvider
import { RepoProviderSelector } from '@/components/RepoProviderSelector';
import { EnterpriseWorkspaceSwitcher } from '@/components/EnterpriseWorkspaceSwitcher';
import { PublicLandingPage } from '@/components/PublicLandingPage';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { EnterpriseTenantGate } from '@/components/EnterpriseTenantGate';
import { BillingStatusBadge } from '@/components/BillingStatusBadge';

export default function Home() {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false); // Add state for right sidebar
  const { session, loading, signOut } = useSupabaseAuth();

  if (loading) {
    return (
      <div className="public-landing-shell public-landing-shell--loading">
        <div className="public-landing-status">Loading BrewAssist…</div>
      </div>
    );
  }

  if (!session) {
    return <PublicLandingPage />;
  }

  return (
    <EnterpriseTenantGate>
      <ToolbeltProvider>
        {' '}
        {/* Wrap the entire cockpit with ToolbeltProvider */}
        <div className="cockpit-shell">
          <header className="cockpit-header">
            <div className="cockpit-header-left">
              <div className="cockpit-brand-wordmark">BREWASSIST</div>
              <div className="cockpit-brand-sub">
                DEVOPS COCKPIT · BREWASSIST ⚡
              </div>
            </div>
            <nav className="cockpit-header-nav">
              <button className="cockpit-nav-link">Dashboard</button>
              <button className="cockpit-nav-link">Sessions</button>
              <button className="cockpit-nav-link">Docs</button>
              <button className="cockpit-nav-link">Settings</button>
            </nav>
            <div className="cockpit-header-right">
              <EnterpriseWorkspaceSwitcher />
              <BillingStatusBadge />
              <RepoProviderSelector />
              <span className="cockpit-mode-pill">
                Signed in · {session.user.email ?? 'BrewAssist user'}
              </span>
              <button
                className="cockpit-signin-btn"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </div>
          </header>

          <main className="cockpit-body">
            {/* LEFT SIDEBAR */}
            <aside
              className={`workspace-sidebar-left ${
                isLeftCollapsed ? 'is-collapsed' : ''
              }`}
            >
              <button
                className={`sidebar-left-toggle ${isLeftCollapsed ? 'collapsed-shape' : 'expanded-shape'}`}
                type="button"
                onClick={() => setIsLeftCollapsed((v) => !v)}
              >
                {isLeftCollapsed ? '‹' : '›'}
              </button>
              {!isLeftCollapsed && <WorkspaceSidebarLeft />}
            </aside>

            {/* CENTER */}
            <section className="cockpit-center">
              <BrewCockpitCenter />
            </section>

            {/* RIGHT SIDEBAR */}
            <aside
              className={`workspace-sidebar-right ${
                isRightCollapsed ? 'is-collapsed' : ''
              }`}
            >
              <button
                className={`sidebar-right-toggle ${isRightCollapsed ? 'collapsed-shape' : 'expanded-shape'}`}
                type="button"
                onClick={() => setIsRightCollapsed((v) => !v)}
              >
                {isRightCollapsed ? '›' : '‹'}
              </button>
              {!isRightCollapsed && <WorkspaceSidebarRight />}
            </aside>
          </main>

          <footer className="cockpit-footer">
            <div className="cockpit-footer-left">© 2025 BrewSoft</div>
            <div className="cockpit-footer-right">
              <Link href="/terms" className="cockpit-footer-link">
                Terms
              </Link>
              <span className="cockpit-footer-sep">·</span>
              <Link href="/privacy" className="cockpit-footer-link">
                Privacy
              </Link>
            </div>
          </footer>
        </div>
      </ToolbeltProvider>
    </EnterpriseTenantGate>
  );
}
