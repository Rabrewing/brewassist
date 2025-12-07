// components/WorkspaceSidebarRight.tsx
import React from "react";
import { ProjectTree } from "./ProjectTree";
import { SandboxPanel } from "./SandboxPanel";

export const WorkspaceSidebarRight: React.FC = () => {
  return (
    <div className="workspace-sidebar-right-inner">
      <div className="project-header">PROJECT · BREWASSIST</div>

      <div className="project-tree-scroll">
        <div className="project-tree-guides"> {/* Added wrapper div */}
          <ProjectTree />
        </div>
      </div>

      <div className="sandbox-region">
        <SandboxPanel />
      </div>
    </div>
  );
};
