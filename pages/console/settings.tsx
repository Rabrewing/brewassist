import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const SETTINGS_ITEMS = [
  'Workspace defaults, default models, and timezone preferences',
  'Security settings such as 2FA, session timeout, and device management',
  'API keys, access tokens, rate limits, and webhooks',
  'Connected integrations and trust center cross-links',
];

export default function ConsoleSettingsPage() {
  const controlPlane = useConsoleControlPlane();

  return (
    <ConsoleShell
      activePath="/console/settings"
      title="Settings"
      subtitle="Manage account, preferences, security, and system configuration."
      searchPlaceholder="Search settings…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Settings" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Settings Surface</strong>
            <span>Preferences, security, API access, and integrations.</span>
          </div>
          <div className="console-list">
            {[
              ...SETTINGS_ITEMS,
              controlPlane.account?.displayName
                ? `Display name: ${controlPlane.account.displayName}`
                : null,
              controlPlane.organization?.slug
                ? `Organization slug: ${controlPlane.organization.slug}`
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
            alt="Settings mockup"
            className="console-preview-image"
          />
        </article>
      </section>
    </ConsoleShell>
  );
}
