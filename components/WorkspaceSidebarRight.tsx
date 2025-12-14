// components/WorkspaceSidebarRight.tsx
import React from "react";
import { ProjectTree } from "./ProjectTree";
import { SandboxPanel } from "./SandboxPanel";
import { useCockpitMode } from "@/contexts/CockpitModeContext"; // Import useCockpitMode

export const WorkspaceSidebarRight: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from context

  return (
    <div className="workspace-sidebar-right-inner">
      <div className="project-header">PROJECT · BREWASSIST</div>

      <div className="project-tree-scroll">
        <div className="project-tree-guides"> {/* Added wrapper div */}
          <ProjectTree />
        </div>
      </div>

      {cockpitMode === 'admin' && ( // Conditionally render SandboxPanel
        <div className="sandbox-region">
          <SandboxPanel />
        </div>
      )}
    </div>
  );
};
