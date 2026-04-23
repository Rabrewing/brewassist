import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const BILLING_ITEMS = [
  'Current subscription and platform fee',
  'Managed usage visibility and spend breakdown',
  'Credits summary and future invoice surfaces',
  'Clear separation between Brew platform fees and provider-side BYOK costs',
];

export default function ConsoleBillingPage() {
  const controlPlane = useConsoleControlPlane();

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
            <span>Initial scaffold before full Stripe and invoice integration.</span>
          </div>
          <div className="console-list">
            {[...BILLING_ITEMS, controlPlane.stripeStatus?.reason]
              .filter(Boolean)
              .map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card console-visual-card">
          <img
            src="/mockups/billing.png"
            alt="Billing console mockup"
            className="console-preview-image"
          />
        </article>
      </section>
    </ConsoleShell>
  );
}
