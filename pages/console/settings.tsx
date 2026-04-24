import { ConsoleIdentitySettings } from '@/components/console/ConsoleIdentitySettings';
import { ConsoleShell } from '@/components/console/ConsoleShell';
import {
  ConsoleErrorCard,
  ConsoleLoadingCard,
} from '@/components/console/ConsoleStateBlocks';
import { useConsoleControlPlane } from '@/lib/hooks/useConsoleControlPlane';

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
      <ConsoleIdentitySettings identity={controlPlane.identity ?? null} />
    </ConsoleShell>
  );
}
