import { useState } from 'react';
import Head from 'next/head';
import { WorkspaceSidebarLeft } from '../components/WorkspaceSidebarLeft';
import { WorkspaceSidebarRight } from '../components/WorkspaceSidebarRight'; // Import WorkspaceSidebarRight
import { BrewCockpitCenter } from '../components/BrewCockpitCenter';
import { ToolbeltProvider } from '@/contexts/ToolbeltContext'; // Import ToolbeltProvider
import { RepoProviderSelector } from '@/components/RepoProviderSelector';

export default function Home() {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false); // Add state for right sidebar

  return (
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
            <RepoProviderSelector />
            <span className="cockpit-mode-pill">
              Primary: Gemini • Fallback: Local
            </span>
            <button className="cockpit-signin-btn">Sign in</button>
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
            <a href="/terms" className="cockpit-footer-link">
              Terms
            </a>
            <span className="cockpit-footer-sep">·</span>
            <a href="/privacy" className="cockpit-footer-link">
              Privacy
            </a>
          </div>
        </footer>
      </div>
    </ToolbeltProvider>
  );
}
