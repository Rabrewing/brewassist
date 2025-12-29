import React, { useState, useEffect, useMemo } from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { getTabsConfig } from "./tabs";
import { GlassOverlayPanel } from "./GlassOverlayPanel"; // Import GlassOverlayPanel

interface GlassTabRailProps {
  // No props needed here, state will be managed internally
}

export const GlassTabRail: React.FC<GlassTabRailProps> = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const tabsConfig = useMemo(() => getTabsConfig(cockpitMode), [cockpitMode]);

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    if (activeTabId === tabId) {
      setIsPanelOpen(false);
      setActiveTabId(null);
    } else {
      setActiveTabId(tabId);
      setIsPanelOpen(true);
    }
  };

  const handleCloseOverlay = () => {
    setIsPanelOpen(false);
    setActiveTabId(null);
  };

  return (
    <>
      <div className="glass-tab-rail">
        {tabsConfig.map((tab) => (
          <button
            key={tab.id}
            className={`glass-tab-item ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>
      <GlassOverlayPanel
        activeTabId={activeTabId}
        onClose={handleCloseOverlay}
      />
    </>
  );
};

export default GlassTabRail;