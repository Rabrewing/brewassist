import { WorkspaceSidebarRight } from '@/components/WorkspaceSidebarRight';
import BrewCockpitCenter from '@/components/BrewCockpitCenter';
import McpToolsColumn from '@/components/McpToolsColumn';

export default function Home() {
  return (
    <div className="cockpit-root">
      <aside className="cockpit-left">
        <McpToolsColumn />
      </aside>

      <main className="cockpit-center">
        <BrewCockpitCenter />
      </main>

      <aside className="cockpit-right">
        <WorkspaceSidebarRight />
      </aside>
    </div>
  );
}
