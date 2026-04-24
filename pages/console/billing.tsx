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

const PLAN_ORDER: Record<BillingPlanId, number> = {
  starter: 1,
  pro: 2,
  team: 3,
};

function formatMoney(value?: number | null) {
  return `$${(value ?? 0).toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return 'Not available yet';
  return new Date(value).toLocaleString();
}

function getSubscriptionStatusTone(status?: string | null) {
  switch (status) {
    case 'active':
      return 'is-good';
    case 'trialing':
      return 'is-info';
    case 'past_due':
    case 'unpaid':
      return 'is-warn';
    case 'canceled':
    case 'incomplete_expired':
      return 'is-danger';
    default:
      return 'is-neutral';
  }
}

function formatStatusLabel(status?: string | null) {
  if (!status) return 'unknown';
  return status.replaceAll('_', ' ');
}

function getManagementSummary(
  status?: string | null,
  cancelAtPeriodEnd?: boolean
) {
  if (cancelAtPeriodEnd) {
    return 'Subscription is active but scheduled to end at the close of the current period.';
  }

  switch (status) {
    case 'active':
      return 'Subscription is healthy and auto-renewing through Stripe.';
    case 'trialing':
      return 'Subscription is in a trial state. Confirm the intended plan before renewal.';
    case 'past_due':
    case 'unpaid':
      return 'Billing health needs attention. Open the portal and resolve payment collection.';
    case 'canceled':
      return 'Subscription is no longer renewing. Use the portal or a new checkout to restore service.';
    default:
      return 'No active managed subscription is currently recorded.';
  }
}

export default function ConsoleBillingPage() {
  const controlPlane = useConsoleControlPlane();
  const { session } = useSupabaseAuth();
  const { orgId, workspaceId } = useEnterpriseSelection();
  const [billingAction, setBillingAction] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>('pro');
  const [selectedInterval, setSelectedInterval] =
    useState<BillingInterval>('monthly');
  const activeSubscription = controlPlane.billing?.subscription ?? null;
  const latestInvoice = controlPlane.billing?.latestInvoice ?? null;
  const linkedCustomer = controlPlane.billing?.customer ?? null;
  const invoiceHistory = controlPlane.billing?.invoiceHistory ?? [];
  const currentPlan = (controlPlane.billing?.plan ?? 'free') as
    | BillingPlanId
    | 'free'
    | 'enterprise';
  const currentInterval = activeSubscription?.billingInterval ?? 'unknown';
  const isCancelingAtPeriodEnd = activeSubscription?.cancelAtPeriodEnd ?? false;
  const isManagedSubscriptionActive =
    activeSubscription?.status === 'active' ||
    activeSubscription?.status === 'trialing' ||
    activeSubscription?.status === 'past_due';
  const samePlanSelected = currentPlan === selectedPlan;
  const sameIntervalSelected = currentInterval === selectedInterval;
  const isCurrentSelection =
    isManagedSubscriptionActive && samePlanSelected && sameIntervalSelected;
  const changeDirection =
    currentPlan === 'starter' || currentPlan === 'pro' || currentPlan === 'team'
      ? PLAN_ORDER[selectedPlan] > PLAN_ORDER[currentPlan]
        ? 'upgrade'
        : PLAN_ORDER[selectedPlan] < PLAN_ORDER[currentPlan]
          ? 'downgrade'
          : sameIntervalSelected
            ? 'current'
            : 'billing-cycle-change'
      : 'new-subscription';
  const checkoutLabel = isCurrentSelection
    ? 'Current subscription selected'
    : changeDirection === 'upgrade'
      ? `Upgrade to ${PLAN_OPTIONS.find((plan) => plan.id === selectedPlan)?.label ?? 'selected'}`
      : changeDirection === 'downgrade'
        ? `Downgrade to ${PLAN_OPTIONS.find((plan) => plan.id === selectedPlan)?.label ?? 'selected'}`
        : changeDirection === 'billing-cycle-change'
          ? `Switch to ${selectedInterval === 'monthly' ? 'monthly' : 'yearly'} billing`
          : `Start ${PLAN_OPTIONS.find((plan) => plan.id === selectedPlan)?.label ?? 'Plan'} ${selectedInterval === 'monthly' ? 'Monthly' : 'Yearly'} Checkout`;

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
            {formatMoney(controlPlane.billing?.platformFeeUsd)} platform fee
            {currentInterval !== 'unknown' ? ` · ${currentInterval}` : ''}
          </p>
        </article>
        <article className="console-card console-stat-card">
          <span className="console-card-label">Managed Spend</span>
          <strong>{formatMoney(controlPlane.billing?.managedSpendUsd)}</strong>
          <p>
            {activeSubscription?.status ? (
              <>
                Subscription{' '}
                <span
                  className={`console-status-chip ${getSubscriptionStatusTone(activeSubscription.status)}`}
                >
                  {formatStatusLabel(activeSubscription.status)}
                </span>
                {isCancelingAtPeriodEnd ? (
                  <>
                    {' '}
                    <span className="console-status-chip is-warn">
                      ends at period close
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              'Current billing period'
            )}
          </p>
        </article>
        <article className="console-card console-stat-card">
          <span className="console-card-label">Credits Balance</span>
          <strong>{formatMoney(controlPlane.credits?.creditsRemainingUsd)}</strong>
          <p>
            {controlPlane.credits?.stripeReady
              ? 'Available for managed usage'
              : 'Stripe-backed credits not live yet'}
          </p>
        </article>
        <article className="console-card console-stat-card">
          <span className="console-card-label">Latest Invoice</span>
          <strong>
            {latestInvoice?.status
              ? formatStatusLabel(latestInvoice.status)
              : controlPlane.stripeStatus?.ready
                ? 'Stripe Connected'
                : 'Stripe Pending'}
          </strong>
          <p>
            {latestInvoice
              ? `${formatMoney(latestInvoice.amountUsd)} · ${latestInvoice.eventLabel}`
              : controlPlane.stripeStatus?.reason ?? 'Billing rail not configured yet'}
          </p>
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
              disabled={
                billingAction === 'checkout' ||
                !controlPlane.stripeStatus?.checkoutReady ||
                isCurrentSelection
              }
            >
              {billingAction === 'checkout' ? 'Launching Checkout…' : checkoutLabel}
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
            <div className="console-list-item">
              Change type:{' '}
              {isCurrentSelection
                ? 'current subscription'
                : changeDirection.replaceAll('-', ' ')}
            </div>
            <div className="console-list-item">
              Manage cancel, payment method, and reactivation in the Stripe billing portal.
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
            <strong>Active Subscription</strong>
            <span>Backend truth from Supabase-backed Stripe state</span>
          </div>
          {activeSubscription?.status ? (
            <div className="console-pill-row">
              <span
                className={`console-status-chip ${getSubscriptionStatusTone(activeSubscription.status)}`}
              >
                {formatStatusLabel(activeSubscription.status)}
              </span>
              {isCancelingAtPeriodEnd ? (
                <span className="console-status-chip is-warn">
                  cancel at period end
                </span>
              ) : null}
              <span className="console-status-chip is-neutral">
                {activeSubscription.billingInterval}
              </span>
            </div>
          ) : null}
          <div className="console-list">
            <div className="console-list-item">
              Subscription ID: {activeSubscription?.externalSubscriptionId ?? 'Not created yet'}
            </div>
            <div className="console-list-item">
              Interval: {activeSubscription?.billingInterval ?? 'unknown'}
            </div>
            <div className="console-list-item">
              Current period start: {formatDate(activeSubscription?.currentPeriodStart)}
            </div>
            <div className="console-list-item">
              Current period end: {formatDate(activeSubscription?.currentPeriodEnd)}
            </div>
            <div className="console-list-item">
              Renewal behavior:{' '}
              {isCancelingAtPeriodEnd
                ? `scheduled to end${activeSubscription?.cancelAt ? ` on ${formatDate(activeSubscription.cancelAt)}` : ''}`
                : 'auto-renewing'}
            </div>
            <div className="console-list-item">
              Linked customer: {linkedCustomer?.externalCustomerId ?? 'Not linked yet'}
            </div>
            <div className="console-list-item">
              Billing email: {linkedCustomer?.billingEmail ?? 'Not available yet'}
            </div>
            <div className="console-list-item">
              Latest invoice event time: {formatDate(latestInvoice?.createdAt)}
            </div>
            <div className="console-list-item">
              Portal management: use billing portal for cancel, payment method, and invoice updates.
            </div>
            {activeSubscription?.status === 'past_due' ||
            activeSubscription?.status === 'unpaid' ? (
              <div className="console-list-item">
                Action needed: payment collection is not healthy. Open the billing portal and resolve the payment method or outstanding invoice.
              </div>
            ) : null}
            {activeSubscription?.status === 'trialing' ? (
              <div className="console-list-item">
                Trialing subscription: monitor the upcoming billing boundary and verify the workspace is on the intended plan before renewal.
              </div>
            ) : null}
            {activeSubscription?.status === 'canceled' ? (
              <div className="console-list-item">
                Canceled subscription: use the portal or a new checkout to restore paid access.
              </div>
            ) : null}
            {isCancelingAtPeriodEnd ? (
              <div className="console-list-item">
                Cancellation is scheduled for the end of the current billing period. Use the billing portal if you want to reactivate before the subscription ends.
              </div>
            ) : null}
          </div>
        </article>
      </section>
      <section className="console-card">
        <div className="console-card-heading">
          <strong>Subscription Management</strong>
          <span>Portal-first administration with console-side lifecycle visibility</span>
        </div>
        <div className="console-list">
          <div className="console-list-item">
            {getManagementSummary(
              activeSubscription?.status,
              activeSubscription?.cancelAtPeriodEnd
            )}
          </div>
          <div className="console-list-item">
            BrewAssist console is the billing visibility surface; Stripe Billing Portal remains the action surface for cancel, reactivate, payment method, and invoice administration.
          </div>
          <div className="console-list-item">
            Current management mode:{' '}
            {activeSubscription?.cancelAtPeriodEnd
              ? 'scheduled end of term'
              : activeSubscription?.status === 'active'
                ? 'renewing'
                : formatStatusLabel(activeSubscription?.status)}
          </div>
        </div>
        <div className="console-cta-row">
          <button
            type="button"
            className="public-landing-button"
            onClick={() => void launchBillingAction('portal')}
            disabled={billingAction === 'portal' || !controlPlane.stripeStatus?.portalReady}
          >
            {billingAction === 'portal' ? 'Opening Portal…' : 'Manage In Billing Portal'}
          </button>
        </div>
      </section>
      <section className="console-card">
        <div className="console-card-heading">
          <strong>Billing History</strong>
          <span>Recent invoice and payment events from Stripe webhook ledger</span>
        </div>
        <div className="console-list">
          {invoiceHistory.length ? (
            invoiceHistory.map((item, index) => (
              <div key={`${item.eventType}-${item.createdAt ?? index}`} className="console-list-item">
                {[
                  item.eventLabel,
                  formatStatusLabel(item.status),
                  item.invoiceId ?? 'no invoice id',
                  formatMoney(item.amountUsd),
                  formatDate(item.createdAt),
                ].join(' · ')}
              </div>
            ))
          ) : (
            <div className="console-list-item">No invoice or payment history has been recorded yet.</div>
          )}
        </div>
      </section>
    </ConsoleShell>
  );
}
