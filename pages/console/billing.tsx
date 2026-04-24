import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';
import { useState } from 'react';

type BillingPlanId = 'starter' | 'pro' | 'team';
type BillingInterval = 'monthly' | 'yearly';

const BILLING_ITEMS = [
  'Current subscription and platform fee',
  'Managed usage visibility and spend breakdown',
  'Credits summary and future invoice surfaces',
  'Clear separation between Brew platform fees and provider-side BYOK costs',
];

const PLAN_OPTIONS: Array<{
  id: BillingPlanId;
  label: string;
  summary: string;
}> = [
  {
    id: 'starter',
    label: 'Starter',
    summary: 'Individual builder access with the hosted Brew control plane.',
  },
  {
    id: 'pro',
    label: 'Pro',
    summary: 'Deeper workflow, replay, and billing visibility for operators.',
  },
  {
    id: 'team',
    label: 'Team',
    summary: 'Multi-workspace team administration and shared governance.',
  },
];

export default function ConsoleBillingPage() {
  const controlPlane = useConsoleControlPlane();
  const { session } = useSupabaseAuth();
  const { orgId, workspaceId } = useEnterpriseSelection();
  const [billingAction, setBillingAction] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>('pro');
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>('monthly');

  async function launchBillingAction(
    action: 'checkout' | 'portal',
    body?: Record<string, unknown>
  ) {
    const accessToken = session?.access_token;
    if (!accessToken || !orgId) {
      setBillingError('Sign in and select an organization before launching billing.');
      return;
    }

    setBillingAction(action);
    setBillingError(null);

    try {
      const response = await fetch(
        action === 'checkout' ? '/api/billing/checkout' : '/api/billing/portal',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'x-brewassist-org-id': orgId,
            'x-brewassist-workspace-id': workspaceId ?? '',
          },
          body: JSON.stringify(body ?? {}),
        }
      );

      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Failed to launch billing action');
      }

      window.location.assign(data.url);
    } catch (error: any) {
      setBillingError(error?.message ?? 'Failed to launch billing action');
      setBillingAction(null);
    }
  }

  return (
    <ConsoleShell
      activePath="/console/billing"
      title="Billing"
      subtitle="Plan, credits, managed spend, and billing visibility for the shared platform."
      searchPlaceholder="Search billing, invoices, and credits…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Billing" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-card-grid">
        <article className="console-card console-stat-card">
          <span className="console-card-label">Current Plan</span>
          <strong>{controlPlane.billing?.plan ?? 'Free'}</strong>
          <p>
            ${controlPlane.billing?.platformFeeUsd.toFixed(2) ?? '0.00'} platform fee
          </p>
        </article>
        <article className="console-card console-stat-card">
          <span className="console-card-label">Managed Spend</span>
          <strong>
            ${controlPlane.billing?.managedSpendUsd.toFixed(2) ?? '0.00'}
          </strong>
          <p>Current billing period</p>
        </article>
        <article className="console-card console-stat-card">
          <span className="console-card-label">Credits Balance</span>
          <strong>
            ${controlPlane.credits?.creditsRemainingUsd.toFixed(2) ?? '0.00'}
          </strong>
          <p>
            {controlPlane.credits?.stripeReady
              ? 'Available for managed usage'
              : 'Stripe-backed credits not live yet'}
          </p>
        </article>
        <article className="console-card console-stat-card">
          <span className="console-card-label">Payment Method</span>
          <strong>
            {controlPlane.stripeStatus?.ready ? 'Stripe Connected' : 'Stripe Pending'}
          </strong>
          <p>{controlPlane.stripeStatus?.reason ?? 'Billing rail not configured yet'}</p>
        </article>
      </section>
      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Billing Scope</strong>
            <span>Hosted Stripe subscription and portal actions.</span>
          </div>
          <div className="console-pill-row">
            {(['monthly', 'yearly'] as BillingInterval[]).map((interval) => (
              <button
                key={interval}
                type="button"
                className={
                  interval === selectedInterval
                    ? 'console-pill is-active'
                    : 'console-pill'
                }
                onClick={() => setSelectedInterval(interval)}
              >
                {interval === 'monthly' ? 'Monthly Billing' : 'Yearly Billing'}
              </button>
            ))}
          </div>
          <div className="console-action-grid">
            {PLAN_OPTIONS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={
                  plan.id === selectedPlan
                    ? 'console-action-card console-action-card--active'
                    : 'console-action-card'
                }
                onClick={() => setSelectedPlan(plan.id)}
              >
                <strong>{plan.label}</strong>
                <p>{plan.summary}</p>
              </button>
            ))}
          </div>
          <div className="console-cta-row">
            <button
              type="button"
              className="public-landing-button public-landing-button--primary"
              onClick={() =>
                void launchBillingAction('checkout', {
                  planId: selectedPlan,
                  interval: selectedInterval,
                })
              }
              disabled={billingAction === 'checkout' || !controlPlane.stripeStatus?.checkoutReady}
            >
              {billingAction === 'checkout'
                ? 'Launching Checkout…'
                : `Start ${PLAN_OPTIONS.find((plan) => plan.id === selectedPlan)?.label ?? 'Plan'} ${selectedInterval === 'monthly' ? 'Monthly' : 'Yearly'} Checkout`}
            </button>
            <button
              type="button"
              className="public-landing-button"
              onClick={() => void launchBillingAction('portal')}
              disabled={billingAction === 'portal' || !controlPlane.stripeStatus?.portalReady}
            >
              {billingAction === 'portal' ? 'Opening Portal…' : 'Open Billing Portal'}
            </button>
          </div>
          <div className="console-list">
            <div className="console-list-item">
              Selected checkout: {selectedPlan} / {selectedInterval}
            </div>
          </div>
          {billingError ? <div className="public-landing-status">{billingError}</div> : null}
          <div className="console-list">
            {[
              ...BILLING_ITEMS,
              controlPlane.stripeStatus?.mode
                ? `Stripe mode: ${controlPlane.stripeStatus.mode}`
                : null,
              controlPlane.stripeStatus?.checkoutReady
                ? 'Checkout session config present'
                : 'Checkout session config missing',
              controlPlane.stripeStatus?.portalReady
                ? 'Billing portal config present'
                : 'Billing portal config missing',
              controlPlane.stripeStatus?.webhookReady
                ? 'Webhook verification config present'
                : 'Webhook verification config missing',
              controlPlane.stripeStatus?.pricesReady
                ? 'Price mapping env present'
                : 'Price mapping env missing',
              controlPlane.stripeStatus?.reason,
              ...(controlPlane.stripeStatus?.missing ?? []).map(
                (key) => `Missing env: ${key}`
              ),
            ]
              .filter(Boolean)
              .map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Cost Overview</strong>
            <span>Platform fee, spend, and readiness trend</span>
          </div>
          <div className="console-chart-preview">
            <span style={{ height: '32%' }} />
            <span style={{ height: '49%' }} />
            <span style={{ height: '46%' }} />
            <span style={{ height: '67%' }} />
            <span style={{ height: '61%' }} />
            <span style={{ height: '78%' }} />
            <span style={{ height: '74%' }} />
          </div>
        </article>
      </section>
    </ConsoleShell>
  );
}
