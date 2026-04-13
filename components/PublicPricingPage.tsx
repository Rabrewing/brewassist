'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import { PublicAuthPanel } from './PublicAuthPanel';
import { CookieConsentBar } from './CookieConsentBar';
import { PublicLegalLinks } from './PublicLegalLinks';

type BillingInterval = 'monthly' | 'yearly';

type PricingPlan = {
  name: string;
  price: string;
  subtitle: string;
  cta: string;
  featured?: boolean;
  highlights: string[];
};

const PRICING_PLANS: Record<BillingInterval, PricingPlan[]> = {
  monthly: [
    {
      name: 'Starter',
      price: '$24',
      subtitle: 'For individual builders evaluating the control plane.',
      cta: 'Start Free',
      highlights: [
        'Shared BrewAssist cockpit access',
        'Core workflow stages and replay history',
        'Managed hosted usage envelope',
        'Basic run visibility and support docs',
      ],
    },
    {
      name: 'Pro',
      price: '$79',
      subtitle: 'For serious operators and small teams running real workloads.',
      cta: 'Upgrade To Pro',
      featured: true,
      highlights: [
        'Everything in Starter',
        'Higher run and replay retention',
        'Bring-your-own model key support path',
        'Priority support and deeper telemetry visibility',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      subtitle: 'For org-wide governance, onboarding, and billing controls.',
      cta: 'Book Enterprise Demo',
      highlights: [
        'Org and workspace administration',
        'RBAC, audit-friendly reporting, and team handoff',
        'Billing visibility and procurement support',
        'Enterprise onboarding and SSO roadmap alignment',
      ],
    },
  ],
  yearly: [
    {
      name: 'Starter',
      price: '$19',
      subtitle: 'For individual builders evaluating the control plane.',
      cta: 'Start Free',
      highlights: [
        'Shared BrewAssist cockpit access',
        'Core workflow stages and replay history',
        'Managed hosted usage envelope',
        'Basic run visibility and support docs',
      ],
    },
    {
      name: 'Pro',
      price: '$63',
      subtitle: 'For serious operators and small teams running real workloads.',
      cta: 'Upgrade To Pro',
      featured: true,
      highlights: [
        'Everything in Starter',
        'Higher run and replay retention',
        'Bring-your-own model key support path',
        'Priority support and deeper telemetry visibility',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      subtitle: 'For org-wide governance, onboarding, and billing controls.',
      cta: 'Book Enterprise Demo',
      highlights: [
        'Org and workspace administration',
        'RBAC, audit-friendly reporting, and team handoff',
        'Billing visibility and procurement support',
        'Enterprise onboarding and SSO roadmap alignment',
      ],
    },
  ],
} as const;

const BILLING_LANES = [
  {
    title: 'Managed BrewAssist Usage',
    body: 'Use BrewAssist-managed model access with clear run, usage, and support boundaries managed by the platform.',
    points: [
      'Simple onboarding for new teams',
      'Usage visibility tied to org activity',
      'Lower setup burden for pilots and small teams',
    ],
  },
  {
    title: 'Bring Your Own Provider Keys',
    body: 'Keep your own provider accounts and keys while paying for BrewAssist orchestration, workflow control, and governance.',
    points: [
      'Provider-cost ownership stays with the customer',
      'Useful for enterprise procurement and existing AI budgets',
      'Still requires a paid BrewAssist plan',
    ],
  },
];

const PLAN_MATRIX = [
  [
    'Workflow stages',
    'Intent to Replay',
    'Intent to Replay',
    'Intent to Replay',
  ],
  ['Replay retention', 'Short history', 'Extended history', 'Custom retention'],
  ['Collaboration', 'Single user', 'Small-team handoff', 'Org-wide review'],
  [
    'Governance',
    'Basic policy path',
    'Expanded controls',
    'Admin and audit focus',
  ],
  [
    'Billing visibility',
    'Basic plan state',
    'Usage visibility',
    'Procurement and admin workflow',
  ],
];

export function PublicPricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('yearly');
  const plans = useMemo(() => PRICING_PLANS[interval], [interval]);

  return (
    <div className="public-landing-shell public-site-shell">
      <section className="public-site-nav">
        <Link href="/" className="public-site-wordmark">
          BrewAssist
        </Link>
        <div className="public-site-nav-links">
          <Link href="/">Overview</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </section>

      <section className="public-site-panel public-site-panel--hero">
        <div className="public-site-copy">
          <div className="public-landing-kicker">Pricing And Billing</div>
          <h1 className="public-site-title">
            Flexible pricing for builders, operators, and enterprise teams.
          </h1>
          <p className="public-site-lede">
            Choose a BrewAssist plan for the control plane itself, then decide
            whether you want managed model usage or your own provider keys.
          </p>
        </div>
        <div
          className="public-site-toggle-row"
          role="tablist"
          aria-label="Billing interval"
        >
          <button
            type="button"
            className={`public-site-toggle ${interval === 'monthly' ? 'is-active' : ''}`}
            onClick={() => setInterval('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`public-site-toggle ${interval === 'yearly' ? 'is-active' : ''}`}
            onClick={() => setInterval('yearly')}
          >
            Yearly
          </button>
        </div>
      </section>

      <section className="public-site-pricing-grid">
        {plans.map((plan) => (
          <article
            key={`${interval}-${plan.name}`}
            className={`public-site-pricing-card ${plan.featured ? 'is-featured' : ''}`}
          >
            <div className="public-site-pricing-head">
              <strong>{plan.name}</strong>
              <span>{plan.subtitle}</span>
            </div>
            <div className="public-site-price-row">
              <span>{plan.price}</span>
              <small>
                {plan.price === 'Custom'
                  ? 'contact sales'
                  : `per seat / ${interval === 'monthly' ? 'month' : 'month, billed yearly'}`}
              </small>
            </div>
            <div className="public-site-list">
              {plan.highlights.map((item) => (
                <div key={item} className="public-site-list-item">
                  {item}
                </div>
              ))}
            </div>
            <div className="public-site-cta-row">
              <Link
                href="/"
                className="public-landing-button public-landing-button--primary"
              >
                {plan.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="public-site-split-grid">
        {BILLING_LANES.map((lane) => (
          <article key={lane.title} className="public-site-panel">
            <h2>{lane.title}</h2>
            <p>{lane.body}</p>
            <div className="public-site-list">
              {lane.points.map((point) => (
                <div key={point} className="public-site-list-item">
                  {point}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="public-site-panel">
        <div className="public-site-section-heading">
          <div className="public-landing-kicker">Plan Comparison</div>
          <h2>How the plans separate out</h2>
        </div>
        <div className="public-site-matrix">
          {PLAN_MATRIX.map(([feature, starter, pro, enterprise]) => (
            <div key={feature} className="public-site-matrix-row">
              <strong>{feature}</strong>
              <span>{starter}</span>
              <span>{pro}</span>
              <span>{enterprise}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="public-site-panel public-site-panel--cta">
        <div>
          <div className="public-landing-kicker">Billing Readiness</div>
          <h2>
            Start with the control plane. Expand into governance and billing as
            your org grows.
          </h2>
          <p>
            BrewAssist pricing is designed around workflow control, replay,
            collaboration, and governance, not just model tokens.
          </p>
        </div>
        <div className="public-site-cta-row">
          <Link
            href="/"
            className="public-landing-button public-landing-button--primary"
          >
            Return To Landing
          </Link>
          <a
            href="mailto:info@brewassist.app"
            className="public-landing-button"
          >
            Contact Sales
          </a>
        </div>
      </section>

      <section className="public-site-panel">
        <PublicAuthPanel
          compact
          title="Start with a BrewAssist account"
          subtitle="Use the same email magic-link flow for a new account or a returning sign-in before choosing a plan."
        />
      </section>

      <section className="public-site-footer">
        <div>
          <div className="public-site-wordmark">BrewAssist</div>
          <p className="public-site-support-copy">
            Pricing for the control plane, not just model access.
          </p>
        </div>
        <div className="public-site-inline-links">
          <Link href="/">Overview</Link>
          <Link href="/pricing">Pricing</Link>
          <PublicLegalLinks />
        </div>
      </section>

      <CookieConsentBar />
    </div>
  );
}
