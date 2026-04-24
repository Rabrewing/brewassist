import { ConsoleShell } from '@/components/console/ConsoleShell';

const CONNECTION_ITEMS = [
  'Runtime registration status and last-seen heartbeat',
  'Workspace link state and active machine label',
  'Managed entitlement visibility from the hosted console',
  'Path to future account, billing, and credits alignment with local commands',
];

export default function ConsoleBrewAgenticPage() {
  return (
    <ConsoleShell
      activePath="/console/brew-agentic"
      title="Brew Agentic"
      subtitle="Hosted view of the local runtime companion and its console link state."
      searchPlaceholder="Search Brew Agentic runtime state…"
    >
      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Connection Summary</strong>
            <span>Local runtime relationship to the hosted control plane.</span>
          </div>
          <div className="console-list">
            {CONNECTION_ITEMS.map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Runtime Status</strong>
            <span>Last-seen heartbeat and sync posture</span>
          </div>
          <div className="console-list">
            <div className="console-list-item">Connected · local runtime online</div>
            <div className="console-list-item">Commands synced · 12</div>
            <div className="console-list-item">Events uploaded · 8</div>
            <div className="console-list-item">Memory updates · healthy</div>
          </div>
        </article>
      </section>

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Runtime Logs</strong>
            <span>Connection, sync, and execution heartbeat</span>
          </div>
          <div className="console-list">
            <div className="console-list-item">INFO · Connection established</div>
            <div className="console-list-item">INFO · Syncing workspace: acme-web-app</div>
            <div className="console-list-item">INFO · Agent is up to date</div>
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Capabilities</strong>
            <span>Hosted visibility into enabled local runtime features</span>
          </div>
          <div className="console-list">
            <div className="console-list-item">Local execution · Enabled</div>
            <div className="console-list-item">File system access · Enabled</div>
            <div className="console-list-item">Git integration · Enabled</div>
            <div className="console-list-item">Secure tunnel · Enabled</div>
          </div>
        </article>
      </section>
    </ConsoleShell>
  );
}
