import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const WORKSPACES = [
  'Acme Web App · Production',
  'API Gateway · Staging',
  'Mobile Backend · Development',
  'Auth Service · Shared Services',
];

const METRICS = [
  'Total Workspaces · 12',
  'Active Workspaces · 8',
  'Total Environments · 24',
  'Total Members · 48',
];

export default function ConsoleWorkspacesPage() {
  const controlPlane = useConsoleControlPlane();
  const metrics = [
    {
      label: 'Total Workspaces',
      value: String(controlPlane.workspaces.length),
    },
    {
      label: 'Active Workspaces',
      value: String(controlPlane.workspaces.filter((item) => item.active).length),
    },
    {
      label: 'Total Environments',
      value: String(controlPlane.workspaces.length),
    },
    {
      label: 'Billing Mode',
      value: controlPlane.workspaces[0]?.billingMode ?? 'pending',
    },
  ];

  return (
    <ConsoleShell
      activePath="/console/workspaces"
      title="Workspaces"
      subtitle="Workspace and environment inventory for the hosted control plane."
      searchPlaceholder="Search workspaces…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Workspaces" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-card-grid">
        {metrics.map((item) => (
          <article key={item.label} className="console-card console-stat-card">
            <span className="console-card-label">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Workspace Inventory</strong>
            <span>Initial route scaffold aligned to the shared registry.</span>
          </div>
          <div className="console-list">
            {(controlPlane.workspaces.length
              ? controlPlane.workspaces.map(
                  (item) =>
                    `${item.name} · ${item.role} · ${item.billingMode}${item.active ? ' · active' : ''}`
                )
              : WORKSPACES
            ).map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Workspace Cards</strong>
            <span>Environment, members, and billing mode overview</span>
          </div>
          <div className="console-action-grid">
            <div className="console-action-card">Production · hybrid</div>
            <div className="console-action-card">Staging · brew-managed</div>
            <div className="console-action-card">Development · byok</div>
          </div>
        </article>
      </section>

      <section className="console-card">
        <div className="console-card-heading">
          <strong>Workspace Health</strong>
          <span>Plan, member, and environment summaries per workspace come next.</span>
        </div>
        <div className="console-list">
          <div className="console-list-item">Healthy · 8 workspaces</div>
          <div className="console-list-item">Attention · 2 workspaces</div>
          <div className="console-list-item">Issues · 2 workspaces</div>
        </div>
      </section>
    </ConsoleShell>
  );
}
