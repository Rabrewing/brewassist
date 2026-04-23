import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

const PROVIDER_ITEMS = [
  'Managed provider availability by plan',
  'BYOK policy and hosted entitlement visibility',
  'Provider/model allowlist alignment between web and local runtime',
  'Future model-level admin controls and health views',
];

export default function ConsoleProvidersPage() {
  const controlPlane = useConsoleControlPlane();

  return (
    <ConsoleShell
      activePath="/console/providers"
      title="Providers"
      subtitle="Managed access, BYOK policy, and model visibility for the control plane."
      searchPlaceholder="Search providers and keys…"
    >
      {controlPlane.loading ? <ConsoleLoadingCard label="Providers" /> : null}
      {controlPlane.error ? <ConsoleErrorCard message={controlPlane.error} /> : null}

      <section className="console-content-grid">
        <article className="console-card">
          <div className="console-card-heading">
            <strong>Provider Surfaces</strong>
            <span>Shared hosted truth for model and entitlement visibility.</span>
          </div>
          <div className="console-list">
            {(controlPlane.managedProviders.length
              ? controlPlane.managedProviders.map(
                  (item) =>
                    `${item.id} · ${item.authModes.join(', ')} · ${item.models.join(', ') || 'no models yet'}`
                )
              : PROVIDER_ITEMS
            ).map((item) => (
              <div key={item} className="console-list-item">
                {item}
              </div>
            ))}
          </div>
        </article>
        <article className="console-card console-visual-card">
          <img
            src="/mockups/providers.png"
            alt="Provider and BYOK view"
            className="console-preview-image"
          />
        </article>
      </section>

      <section className="console-card">
        <div className="console-card-heading">
          <strong>Routing Summary</strong>
          <span>Priority order, quotas, and health visibility come here.</span>
        </div>
        <div className="console-list">
          <div className="console-list-item">
            Auth sources: {controlPlane.entitlements?.authSources.join(', ') || 'none'}
          </div>
          <div className="console-list-item">
            Providers tracked: {controlPlane.managedProviders.length}
          </div>
          <div className="console-list-item">
            Raw provider keys exposed: {String(controlPlane.providerContract?.rawProviderKeyExposed ?? false)}
          </div>
        </div>
      </section>
    </ConsoleShell>
  );
}
