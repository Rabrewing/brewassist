import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const TRUST_ITEMS = [
  'Row-level security and org/workspace access direction',
  'Audit-friendly replay and event trails',
  'Hosted identity, session, and workspace selection posture',
  'Transparency around provider access, billing, and managed usage truth',
];

export default function ConsoleTrustCenterPage() {
  const controlPlane = useConsoleControlPlane();

  return (
    <ConsoleShell
      activePath="/console/trust-center"
      title="Trust Center"
      subtitle="Security, compliance, and transparency scaffolding for the hosted control plane."
      searchPlaceholder="Search trust and security…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Trust Center" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Trust Surface</strong>
            <span>First route scaffold for security and compliance IA.</span>
          </div>
          <div className="console-list">
            {[
              ...TRUST_ITEMS,
              ...(controlPlane.securityReadiness?.trustChecklist ?? []).map(
                (item) => `${item.status}: ${item.detail}`
              ),
              ...(controlPlane.identity?.capabilities ?? []).map(
                (item) => `${item.label}: ${item.status}`
              ),
              ...(controlPlane.identity?.nextActions ?? []).map(
                (item) => `Next: ${item}`
              ),
              controlPlane.providerContract
                ? `Runtime token path: ${controlPlane.providerContract.localRuntimeGets}`
                : null,
              controlPlane.securityReadiness?.stripe
                ? `Stripe mode: ${controlPlane.securityReadiness.stripe.mode}`
                : null,
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
            <strong>Trust Snapshot</strong>
            <span>Security, compliance, and audit posture</span>
          </div>
          <div className="console-list">
            <div className="console-list-item">Row-level security · enabled</div>
            <div className="console-list-item">Audit logs · present</div>
            <div className="console-list-item">Identity admin · staged</div>
            <div className="console-list-item">Billing transparency · visible</div>
          </div>
        </article>
      </section>
    </ConsoleShell>
  );
}
