import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const STATS = [
  { label: 'Commands Today', value: '1,248', detail: '+18.2% vs yesterday' },
  { label: 'Active Workspaces', value: '12', detail: '+2 new this week' },
  { label: 'Usage Spend', value: '$284.63', detail: '-2.5% vs last week' },
  { label: 'Agentic Connection', value: 'Connected', detail: 'Local runtime online' },
];

const ACTIVITY = [
  'Command executed: deploy to staging',
  'Brew Agentic runtime linked to workspace',
  'Provider route updated for model allowlist',
  'Usage threshold warning generated for billing review',
];

const QUICK_ACTIONS = [
  'Launch Command Center',
  'Connect Brew Agentic',
  'View Billing',
];

const SESSIONS = [
  'Fix auth flow bug · Success',
  'Database migration · Success',
  'Add new API endpoint · Failed',
];

export default function ConsoleOverviewPage() {
  const controlPlane = useConsoleControlPlane();

  const stats = [
    {
      label: 'Commands Today',
      value: controlPlane.entitlements?.platformAccess ? 'Online' : '0',
      detail: controlPlane.organization?.name
        ? `Org: ${controlPlane.organization.name}`
        : 'Hosted platform access not established',
    },
    {
      label: 'Active Workspaces',
      value: String(controlPlane.workspaces.length),
      detail: controlPlane.workspace?.name
        ? `Current: ${controlPlane.workspace.name}`
        : '+0 active workspace selected',
    },
    {
      label: 'Usage Spend',
      value: controlPlane.billing
        ? `$${controlPlane.billing.managedSpendUsd.toFixed(2)}`
        : '$0.00',
      detail: controlPlane.billing
        ? `Intelligence: $${controlPlane.billing.intelligenceSpendUsd.toFixed(2)}`
        : 'No hosted usage recorded yet',
    },
    {
      label: 'Agentic Connection',
      value: controlPlane.providerContract ? 'Protected' : 'Pending',
      detail: controlPlane.providerContract
        ? 'Managed keys stay server-side'
        : 'Runtime token path still pending',
    },
  ];

  const activity = [
    controlPlane.account?.accountStanding === 'active'
      ? 'Account session active'
      : 'Account standing not active',
    controlPlane.workspace?.name
      ? `Workspace selected: ${controlPlane.workspace.name}`
      : 'No workspace selected',
    controlPlane.billing
      ? `Managed spend tracked: $${controlPlane.billing.managedSpendUsd.toFixed(2)}`
      : 'Billing summary not loaded',
    controlPlane.providerContract
      ? 'Managed-provider proxy contract loaded'
      : 'Managed-provider contract unavailable',
  ];

  return (
    <ConsoleShell
      activePath="/console/overview"
      title="Overview"
      subtitle="System at a glance for workspaces, usage, runtime link, and recent activity."
      searchPlaceholder="Search overview…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Overview" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-card-grid">
        {stats.map((item) => (
          <article key={item.label} className="console-card console-stat-card">
            <span className="console-card-label">{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="console-content-grid console-content-grid--overview">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Recent Activity</strong>
            <span>Hosted control-plane events</span>
          </div>
          <div className="console-list">
            {activity.map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card console-visual-card">
          <img
            src="/mockups/overview.png"
            alt="Console overview mockup"
            className="console-preview-image"
          />
        </article>
      </section>

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Quick Actions</strong>
            <span>Shortcuts into the hosted control plane</span>
          </div>
          <div className="console-action-grid">
            {QUICK_ACTIONS.map((item) => (
              <div key={item} className="console-action-card">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Recent Sessions</strong>
            <span>Latest runs and review status</span>
          </div>
          <div className="console-list">
            {SESSIONS.map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </ConsoleShell>
  );
}
