import Link from 'next/link';

import { ConsoleShell } from '@/components/console/ConsoleShell';

const EXECUTION_LINES = [
  'Analyzing request and repo context',
  'Planning staged workflow and guardrails',
  'Previewing sandbox edits and runtime checks',
  'Preparing confirm/report handoff',
];

export default function ConsoleCommandCenterPage() {
  return (
    <ConsoleShell
      activePath="/console/command-center"
      title="Command Center"
      subtitle="Hosted execution surface for orchestration, planning, and workflow visibility."
      searchPlaceholder="Search commands, tools, and context…"
    >
      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Execution Target</strong>
            <span>Hosted cloud route or Brew Agentic local runtime</span>
          </div>
          <div className="console-action-grid">
            <div className="console-action-card console-action-card--active">
              Brew Agentic · Local Runtime
            </div>
            <div className="console-action-card">Brew Cloud · Hosted Execution</div>
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Modes</strong>
            <span>AI, system, and workflow orchestration controls</span>
          </div>
          <div className="console-pill-row">
            <span className="console-pill is-active">AI Mode</span>
            <span className="console-pill">System Mode</span>
            <span className="console-pill">Workflow Mode</span>
          </div>
        </article>
      </section>

      <section className="console-card">
        <div className="console-card-heading">
          <strong>Current Direction</strong>
          <span>
            This scaffold points into the existing cockpit while the shared
            console shell is being split out cleanly.
          </span>
        </div>
        <div className="console-command-bar">
          Ask BrewAssist to build, diagnose, or automate in a staged workflow.
        </div>
        <div className="console-list">
          {EXECUTION_LINES.map((item) => (
            <div key={item} className="console-list-item">
              {item}
            </div>
          ))}
        </div>
        <div className="public-site-cta-row">
          <Link
            href="/"
            className="public-landing-button public-landing-button--primary"
          >
            Open Current Cockpit
          </Link>
        </div>
      </section>

      <section className="console-content-grid">
        <article className="console-card console-visual-card">
          <img
            src="/mockups/command-center.png"
            alt="Command center mockup"
            className="console-preview-image"
          />
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Context</strong>
            <span>Workspace, environment, repo, file, and variable scope</span>
          </div>
          <div className="console-list">
            <div className="console-list-item">Workspace · acme-web-app</div>
            <div className="console-list-item">Environment · production</div>
            <div className="console-list-item">Repository · github.com/acme/web-app</div>
            <div className="console-list-item">Active file · src/api/deploy.ts</div>
            <div className="console-list-item">Provider · Anthropic</div>
          </div>
        </article>
      </section>
    </ConsoleShell>
  );
}
