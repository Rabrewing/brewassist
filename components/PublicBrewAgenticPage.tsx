import React from 'react';
import Link from 'next/link';

import { PublicSiteLayout } from './PublicSiteLayout';

const CAPABILITIES = [
  'Local execution on your machine with repo awareness',
  'Connect back to BrewAssist for hosted coordination and visibility',
  'BYOK-friendly routing without pretending the Brew platform is free',
  'Multi-provider execution path with local control over tools and context',
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Install',
    body: 'Download Brew Agentic and start with a machine-local runtime.',
  },
  {
    step: '2',
    title: 'Connect',
    body: 'Link the runtime to your BrewAssist account when you want shared console state.',
  },
  {
    step: '3',
    title: 'Run',
    body: 'Work locally with repo context, tools, and provider control on your own machine.',
  },
  {
    step: '4',
    title: 'Sync',
    body: 'Surface account, workspace, billing, and entitlement truth through the console.',
  },
];

export function PublicBrewAgenticPage() {
  return (
    <PublicSiteLayout activePath="/brew-agentic">
      <section className="public-site-panel public-site-panel--hero">
        <div className="public-site-hero-grid">
          <div className="public-site-copy">
            <div className="public-landing-kicker">
              Local AI Runtime. Enterprise Power.
            </div>
            <h1 className="public-site-title">
              Brew Agentic is the local runtime. BrewAssist is the shared
              control plane.
            </h1>
            <p className="public-site-lede">
              Run intelligent workflows on your machine, keep repo context close
              to execution, and connect back to BrewAssist when you want
              account, workspace, entitlement, billing, and console visibility.
            </p>
            <div className="public-site-cta-row">
              <Link
                href="/start-free"
                className="public-landing-button public-landing-button--primary"
              >
                Connect To Console
              </Link>
              <Link href="/pricing" className="public-landing-button">
                Learn About Pricing
              </Link>
            </div>
            <div className="public-site-list">
              {CAPABILITIES.map((item) => (
                <div key={item} className="public-site-list-item">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="public-site-hero-art">
            <div className="public-site-preview-card public-site-preview-card--agentic">
              <div className="public-site-preview-header">
                <span>Brew Agentic</span>
                <span>Local Runtime</span>
              </div>
              <div className="public-site-preview-body">
                <div className="public-site-preview-pane">
                  <strong>Terminal</strong>
                  <div className="public-site-preview-lines">
                    <span>connect workspace</span>
                    <span>inspect repo</span>
                    <span>run staged workflow</span>
                    <span>sync to console</span>
                  </div>
                </div>
                <div className="public-site-preview-pane">
                  <strong>State</strong>
                  <div className="public-site-preview-list">
                    <span>providers</span>
                    <span>memory</span>
                    <span>tools</span>
                    <span>link status</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-site-split-grid">
        <article className="public-site-panel">
          <div className="public-site-section-heading">
            <div className="public-landing-kicker">Local + Cloud</div>
            <h2>Local power with shared hosted truth when you need it.</h2>
          </div>
          <p>
            Brew Agentic owns local execution, local tool access, local repo
            context, and local BYOK handling. BrewAssist owns hosted account,
            workspace, billing, entitlement, and runtime registration truth.
          </p>
        </article>
        <article className="public-site-panel">
          <div className="public-site-preview-card public-site-preview-card--connection">
            <div className="public-site-preview-header">
              <span>Local + Hosted</span>
              <span>Linked</span>
            </div>
            <div className="public-site-bridge-flow">
              <div className="public-site-bridge-node">
                <strong>Local Repo</strong>
                <span>tools + execution</span>
              </div>
              <div className="public-site-bridge-line" />
              <div className="public-site-bridge-node">
                <strong>BrewAssist Console</strong>
                <span>account + billing + trust</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="public-site-panel">
        <div className="public-site-section-heading">
          <div className="public-landing-kicker">How It Works</div>
          <h2>One local runtime. One shared console relationship.</h2>
        </div>
        <div className="public-site-step-grid">
          {HOW_IT_WORKS.map((item) => (
            <article key={item.step} className="public-site-step-card">
              <div className="public-site-step-badge">{item.step}</div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-site-split-grid">
        <article className="public-site-panel">
          <div className="public-site-section-heading">
            <div className="public-landing-kicker">BYOK + Managed</div>
            <h2>Bring your own keys without erasing the platform fee.</h2>
          </div>
          <p>
            Brew Agentic supports local provider control and BYOK flows, but
            the shared Brew platform still owns orchestration, entitlements,
            hosted visibility, and account-level administration.
          </p>
          <div className="public-site-list">
            <div className="public-site-list-item">
              BYOK removes vendor charges, not Brew platform charges.
            </div>
            <div className="public-site-list-item">
              Managed usage, credits, and entitlements remain hosted console
              concerns.
            </div>
            <div className="public-site-list-item">
              Local and hosted surfaces stay coordinated instead of pretending
              to be separate products.
            </div>
          </div>
        </article>
        <article className="public-site-panel">
          <div className="public-site-preview-card">
            <div className="public-site-preview-header">
              <span>BYOK + Managed</span>
              <span>Clear Boundary</span>
            </div>
            <div className="public-site-pricing-mini-grid">
              <div className="public-site-pricing-mini-card">
                <strong>Your Keys</strong>
                <span>vendor billed</span>
              </div>
              <div className="public-site-pricing-mini-card public-site-pricing-mini-card--featured">
                <strong>Brew Platform</strong>
                <span>orchestration</span>
              </div>
              <div className="public-site-pricing-mini-card">
                <strong>Managed</strong>
                <span>hosted access</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="public-site-split-grid">
        <article className="public-site-panel">
          <div className="public-site-section-heading">
            <div className="public-landing-kicker">Terminal Surface</div>
            <h2>Terminal-first where local operators actually work.</h2>
          </div>
          <p>
            The Brew Agentic interaction model is local, direct, and
            tool-connected. That is the reference direction for future
            center-pane rendering improvements in BrewAssist as well.
          </p>
        </article>
        <article className="public-site-panel">
          <div className="public-site-preview-card public-site-preview-card--terminal">
            <div className="public-site-preview-header">
              <span>Terminal Surface</span>
              <span>Direct</span>
            </div>
            <div className="public-site-terminal">
              <span>$ brew-agentic /account</span>
              <span>workspace: acme-web-app</span>
              <span>billing: linked</span>
              <span>runtime: healthy</span>
            </div>
          </div>
        </article>
      </section>

      <section className="public-site-panel public-site-panel--cta">
        <div>
          <div className="public-landing-kicker">Brew Agentic Console Path</div>
          <h2>Use Brew Agentic locally. Manage the shared account in console.</h2>
          <p>
            The shared console is where account, billing, provider access,
            trust, and runtime registration belong.
          </p>
        </div>
        <div className="public-site-cta-row">
          <Link
            href="/console/brew-agentic"
            className="public-landing-button public-landing-button--primary"
          >
            Open Brew Agentic Console
          </Link>
          <Link href="/console/providers" className="public-landing-button">
            View Providers
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  );
}
