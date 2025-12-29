// components/WorkspaceSidebarRight.tsx
import React, { useState, useEffect } from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext"; // Import useCockpitMode
import { GlassTabRail } from "./right-rail/GlassTabRail";
import { GlassOverlayPanel } from "./right-rail/GlassOverlayPanel";

export const WorkspaceSidebarRight: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from context
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Close panel if cockpitMode changes
  useEffect(() => {
    setIsPanelOpen(false);
    setActiveTabId(null);
  }, [cockpitMode]);

  return (
    <div className="workspace-sidebar-right-inner">
      <GlassTabRail
        activeTabId={activeTabId}
        setActiveTabId={setActiveTabId}
        setIsPanelOpen={setIsPanelOpen}
      />
      {isPanelOpen && (
        <GlassOverlayPanel
          activeTabId={activeTabId}
          setIsPanelOpen={setIsPanelOpen}
          setActiveTabId={setActiveTabId}
        />
      )}
    </div>
  );
};
