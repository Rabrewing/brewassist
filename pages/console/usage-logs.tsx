import { ConsoleShell } from '@/components/console/ConsoleShell';

const USAGE_METRICS = [
  { label: 'Total Commands', value: '28,542', detail: '+18.6%' },
  { label: 'Tokens Used', value: '19.4M', detail: '+12.7%' },
  { label: 'Total Spend', value: '$1,284.75', detail: '+16.7%' },
  { label: 'Avg Cost / Command', value: '$0.045', detail: '-3.1%' },
];

const LOGS = [
  'Fix auth flow bug · Claude 3.5 · Success · $0.032',
  'Deploy to staging · GPT-4o · Success · $0.018',
  'DB migration script · Claude 3.5 · Success · $0.041',
  'Add rate limiting · GPT-4o · Failed · $0.006',
];

export default function ConsoleUsageLogsPage() {
  return (
    <ConsoleShell
      activePath="/console/usage-logs"
      title="Usage & Logs"
      subtitle="Track hosted usage, spend, execution logs, and provider visibility."
      searchPlaceholder="Search usage and logs…"
    >
      <section className="console-card-grid">
        {USAGE_METRICS.map((item) => (
          <article key={item.label} className="console-card console-stat-card">
            <span className="console-card-label">{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Execution Logs</strong>
            <span>Authoritative hosted usage and run visibility</span>
          </div>
          <div className="console-list">
            {LOGS.map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Usage Snapshot</strong>
            <span>Tracked commands, spend, and provider mix</span>
          </div>
          <div className="console-chart-preview">
            <span style={{ height: '52%' }} />
            <span style={{ height: '74%' }} />
            <span style={{ height: '44%' }} />
            <span style={{ height: '68%' }} />
            <span style={{ height: '60%' }} />
            <span style={{ height: '82%' }} />
            <span style={{ height: '57%' }} />
          </div>
        </article>
      </section>
    </ConsoleShell>
  );
}
