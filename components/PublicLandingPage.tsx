'use client';

import React from 'react';
import Link from 'next/link';

import { PublicAuthPanel } from './PublicAuthPanel';
import { CookieConsentBar } from './CookieConsentBar';
import { PublicLegalLinks } from './PublicLegalLinks';

const WORKFLOW_STAGES = [
  'Intent',
  'Plan',
  'Preview',
  'Confirm',
  'Execute',
  'Report',
  'Replay',
];

const CAPABILITY_GROUPS = [
  {
    title: 'Workflow control plane',
    body: 'The center pane drives a single staged workflow so teams can see what the assistant is planning, what changed, and what is ready for review.',
    points: [
      'Shared stage model from intent through replay',
      'Policy-aware execution path',
      'Replayable run history and audit-friendly output',
    ],
  },
  {
    title: 'Provider and repo context',
    body: 'BrewAssist is built around repo and workspace context, not detached chat sessions.',
    points: [
      'Provider and repo headers already flow through the online stack',
      'Org and workspace scope stays visible in the cockpit',
      'Cross-repo access remains fail-closed until fully implemented',
    ],
  },
  {
    title: 'Sandbox-first execution',
    body: 'The product direction stays mirror-first so changes can be reviewed before they are allowed to land.',
    points: [
      'Preview and confirm remain explicit stages',
      'Sandbox binding is the intended writable path',
      'Live repo writes are not the default model',
    ],
  },
  {
    title: 'Telemetry and collaboration',
    body: 'Replay, collab notes, and runtime telemetry now persist through shared run events so teams can review work together.',
    points: [
      'Persisted replay through sessions, runs, and run events',
      'Collab notes in the right rail and replay trace',
      'DevOps 8 signals for runtime visibility',
    ],
  },
];

const GOVERNANCE_POINTS = [
  'Supabase-backed auth and tenant bootstrap',
  'RBAC and RLS direction for org and workspace scoping',
  'Policy gates before execution-sensitive actions',
  'Replayable reports and event trails for review',
];

const FAQS = [
  {
    question: 'What does BrewAssist actually do today?',
    answer:
      'BrewAssist already provides the staged online workflow shell, Supabase auth and tenant gating, persisted replay history, telemetry, and collab notes. Real provider connect, sandbox binding, and full diff/apply execution are still being completed.',
  },
  {
    question: 'Is BrewAssist just a chatbot?',
    answer:
      'No. The product is being built as a control plane with workflow stages, repo context, policy gates, replay, telemetry, and team coordination.',
  },
  {
    question: 'Can teams use their own model providers?',
    answer:
      'That is part of the pricing and billing direction. BrewAssist itself remains a paid control plane whether customers use managed model usage or their own provider keys.',
  },
  {
    question: 'What makes enterprise different?',
    answer:
      'Enterprise focuses on org and workspace administration, approvals, replay, reporting, collaboration, billing visibility, and identity hardening.',
  },
];

export function PublicLandingPage() {
  return (
    <div className="public-landing-shell public-site-shell">
      <section className="public-site-nav">
        <div className="public-site-wordmark">BrewAssist</div>
        <div className="public-site-nav-links">
          <a href="#workflow">Workflow</a>
          <a href="#capabilities">Capabilities</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </section>

      <section className="public-site-panel public-site-panel--hero">
        <div className="public-site-hero-grid">
          <div className="public-site-copy">
            <div className="public-landing-kicker">
              AI-Native DevOps Control Plane
            </div>
            <h1 className="public-site-title">
              Connect repo context, stage the work, review the diff path, and
              keep every run replayable.
            </h1>
            <p className="public-site-lede">
              BrewAssist is built for builders, operators, and enterprise teams
              that want a shared cockpit for{' '}
              <code>
                Intent -&gt; Plan -&gt; Preview -&gt; Confirm -&gt; Execute
                -&gt; Report -&gt; Replay
              </code>
              .
            </p>
            <div className="public-site-bullet-grid">
              <div className="public-site-bullet">
                Sandbox-first execution with policy gates and replay.
              </div>
              <div className="public-site-bullet">
                Org and workspace-aware control plane for teams.
              </div>
              <div className="public-site-bullet">
                Telemetry, reporting, and collab notes built into the run model.
              </div>
            </div>
            <div className="public-site-cta-row">
              <a
                href="#public-auth"
                className="public-landing-button public-landing-button--primary"
              >
                Launch BrewAssist
              </a>
              <Link href="/pricing" className="public-landing-button">
                View Pricing
              </Link>
            </div>
          </div>

          <div className="public-site-hero-art">
            <img
              src="/landing/hero-section.png"
              alt="BrewAssist cockpit logo"
              className="public-site-hero-image"
            />
            <PublicAuthPanel
              title="Sign in or create your BrewAssist account"
              subtitle="Start with email magic link access, then continue into tenant setup and the cockpit."
            />
          </div>
        </div>

        <div className="public-site-inline-links">
          <Link href="/pricing">Pricing</Link>
          <PublicLegalLinks />
          <a href="mailto:info@brewassist.app">Contact</a>
        </div>
      </section>

      <section id="workflow" className="public-site-panel">
        <div className="public-site-section-heading">
          <div className="public-landing-kicker">Canonical Workflow</div>
          <h2>The product stays organized around one safe execution model.</h2>
        </div>
        <div className="public-site-stage-row">
          {WORKFLOW_STAGES.map((stage) => (
            <div key={stage} className="public-site-stage-pill">
              {stage}
            </div>
          ))}
        </div>
        <p className="public-site-support-copy">
          Public messaging, cockpit UX, replay, and local alignment all stay
          anchored to this same workflow contract.
        </p>
      </section>

      <section id="capabilities" className="public-site-card-grid">
        {CAPABILITY_GROUPS.map((group) => (
          <article key={group.title} className="public-site-card">
            <strong>{group.title}</strong>
            <p>{group.body}</p>
            <div className="public-site-list">
              {group.points.map((point) => (
                <div key={point} className="public-site-list-item">
                  {point}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="public-site-split-grid">
        <article className="public-site-panel">
          <div className="public-site-section-heading">
            <div className="public-landing-kicker">Governance</div>
            <h2>Built for review, approvals, and team visibility.</h2>
          </div>
          <div className="public-site-list">
            {GOVERNANCE_POINTS.map((point) => (
              <div key={point} className="public-site-list-item">
                {point}
              </div>
            ))}
          </div>
        </article>

        <article className="public-site-panel">
          <div className="public-site-section-heading">
            <div className="public-landing-kicker">Public Product Truth</div>
            <h2>BrewAssist is not generic AI fluff.</h2>
          </div>
          <p>
            The product is a control plane for governed DevOps work. That means
            provider and repo context, preview and confirm stages, sandbox-first
            execution, replayable runs, telemetry, and collaboration.
          </p>
          <p>
            Some pieces are already live, and some remain in progress. The
            public site should reflect that honestly.
          </p>
        </article>
      </section>

      <section className="public-site-panel public-site-panel--cta">
        <div>
          <div className="public-landing-kicker">Pricing And Billing</div>
          <h2>
            Paid plans for builders and enterprise teams, with managed or BYO
            model paths.
          </h2>
          <p>
            BrewAssist pricing centers on the control plane itself: workflow,
            replay, collaboration, governance, and admin visibility.
          </p>
        </div>
        <div className="public-site-cta-row">
          <Link
            href="/pricing"
            className="public-landing-button public-landing-button--primary"
          >
            Explore Pricing
          </Link>
          <a
            href="mailto:info@brewassist.app"
            className="public-landing-button"
          >
            Talk To Sales
          </a>
        </div>
      </section>

      <section id="public-auth" className="public-site-panel">
        <PublicAuthPanel compact />
      </section>

      <section className="public-site-panel">
        <div className="public-site-section-heading">
          <div className="public-landing-kicker">FAQ</div>
          <h2>What teams ask before they commit</h2>
        </div>
        <div className="public-site-faq-grid">
          {FAQS.map((faq) => (
            <article key={faq.question} className="public-site-card">
              <strong>{faq.question}</strong>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-site-footer">
        <div>
          <div className="public-site-wordmark">BrewAssist</div>
          <p className="public-site-support-copy">
            AI-native DevOps control plane for governed execution, replay, and
            collaboration.
          </p>
        </div>
        <div className="public-site-inline-links">
          <Link href="/pricing">Pricing</Link>
          <PublicLegalLinks />
          <a href="mailto:info@brewassist.app">info@brewassist.app</a>
        </div>
      </section>

      <CookieConsentBar />
    </div>
  );
}
