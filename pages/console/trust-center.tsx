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
              controlPlane.providerContract
                ? `Runtime token path: ${controlPlane.providerContract.localRuntimeGets}`
                : null,
              controlPlane.billing
                ? `Stripe ready: ${String(controlPlane.billing.stripeReady)}`
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
        <article className="console-card console-visual-card">
          <img
            src="/mockups/settings-trust-center.png"
            alt="Trust center visual direction"
            className="console-preview-image"
          />
        </article>
      </section>
    </ConsoleShell>
  );
}
