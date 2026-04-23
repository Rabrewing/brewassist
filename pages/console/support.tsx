import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const SUPPORT_ITEMS = [
  'Get AI help for deployment, billing, and runtime questions',
  'Create and track support tickets by workspace',
  'Browse documentation, setup guides, and billing explanations',
  'Surface common Brew Agentic and provider-management issues',
];

export default function ConsoleSupportPage() {
  const controlPlane = useConsoleControlPlane();

  return (
    <ConsoleShell
      activePath="/console/support"
      title="Support Center"
      subtitle="Get help, track issues, and access product resources."
      searchPlaceholder="Search docs, guides, and support…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Support Center" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Support Surface</strong>
            <span>Docs, tickets, AI help, and contact paths.</span>
          </div>
          <div className="console-list">
            {[
              ...SUPPORT_ITEMS,
              controlPlane.workspace?.name
                ? `Current workspace: ${controlPlane.workspace.name}`
                : null,
              controlPlane.account?.email
                ? `Signed in as: ${controlPlane.account.email}`
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
            src="/mockups/support-center.png"
            alt="Support center mockup"
            className="console-preview-image"
          />
        </article>
      </section>
    </ConsoleShell>
  );
}
