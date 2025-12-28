import React, { useState, useEffect } from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { getTabsConfig } from "./tabs";

interface GlassTabRailProps {
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  setIsPanelOpen: (isOpen: boolean) => void;
}

export const GlassTabRail: React.FC<GlassTabRailProps> = ({
  activeTabId,
  setActiveTabId,
  setIsPanelOpen,
}) => {
  const { mode: cockpitMode } = useCockpitMode();
  const tabsConfig = React.useMemo(() => getTabsConfig(cockpitMode), [cockpitMode]);

  const handleTabClick = (tabId: string) => {
    if (activeTabId === tabId) {
      setIsPanelOpen(false);
      setActiveTabId(null);
    } else {
      setActiveTabId(tabId);
      setIsPanelOpen(true);
    }
  };

  return (
    <div className="brew-tabs-rail">
      {tabsConfig.map((tab) => (
        <div
          key={tab.id}
          className={`brew-tab ${activeTabId === tab.id ? 'is-active' : ''}`}
          onClick={() => handleTabClick(tab.id)}
        >
          <span className="brew-tab-icon">{tab.icon}</span>
          <span className="brew-tab-tooltip">{tab.tooltip}</span>
        </div>
      ))}
    </div>
  );
};
