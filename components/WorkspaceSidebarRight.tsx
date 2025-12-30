// components/WorkspaceSidebarRight.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { ProjectTree } from "./ProjectTree";
import { SandboxPanel } from "./SandboxPanel";
import { CognitionSurface } from "./CognitionSurface";
import DevOps8Panel from "./right-rail/DevOps8Panel"; // Assuming DevOps8Panel is still needed

// Define the structure for a tab
interface TabConfig {
  id: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

// Define the tabs for the right sidebar
const getTabsConfig = (cockpitMode: "admin" | "customer"): TabConfig[] => {
  const baseTabs: TabConfig[] = [
    { id: "files", label: "Files", icon: "📁" },
    { id: "sandbox", label: "Sandbox", icon: "🏖️", adminOnly: true },
    { id: "cognition", label: "Cognition", icon: "🧠" },
    { id: "guide", label: "Guide", icon: "🗺️" },
    { id: "docs", label: "Docs", icon: "📚" },
    { id: "help", label: "Help", icon: "❓" },
    { id: "history", label: "History", icon: "📜" },
  ];

  if (cockpitMode === "admin") {
    return baseTabs;
  } else {
    return baseTabs.filter(tab => !tab.adminOnly);
  }
};

export const WorkspaceSidebarRight: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const tabsConfig = useMemo(() => getTabsConfig(cockpitMode), [cockpitMode]);
  const [activeTabId, setActiveTabId] = useState<string | null>(tabsConfig[0]?.id || null);

  // Mock cognition state and highlighted principle for demonstration
  const mockCognitionState = "Policy Enforcement";
  const mockHighlightedPrinciple = "Make work visible";

  // Reset active tab if cockpitMode changes and current tab is no longer available
  useEffect(() => {
    if (activeTabId && !tabsConfig.some(tab => tab.id === activeTabId)) {
      setActiveTabId(tabsConfig[0]?.id || null);
    } else if (!activeTabId && tabsConfig.length > 0) {
      setActiveTabId(tabsConfig[0].id);
    }
  }, [cockpitMode, tabsConfig, activeTabId]);

  return (
    <div className="workspace-sidebar-right-tabs-and-content">
      <div className="workspace-sidebar-right-tabs">
        {tabsConfig.map((tab) => (
          <button
            key={tab.id}
            className={`workspace-sidebar-right-tab-item ${activeTabId === tab.id ? "is-active" : ""}`}
            onClick={() => setActiveTabId(tab.id)}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>
      <div className="workspace-sidebar-right-content">
        {activeTabId === 'files' && (
          <div className="project-tree-scroll">
            <div className="project-tree-guides">
              <ProjectTree />
            </div>
          </div>
        )}
        {activeTabId === 'sandbox' && cockpitMode === 'admin' && (
          <div className="sandbox-region">
            <SandboxPanel />
          </div>
        )}
        {activeTabId === 'cognition' && (
          <CognitionSurface
            currentCognitionState={mockCognitionState}
            highlightedPrinciple={mockHighlightedPrinciple}
          />
        )}
        {activeTabId === 'guide' && (
          <DevOps8Panel />
        )}
        {activeTabId === 'docs' && (
          <div>
            <h3>Docs Content</h3>
            <p>Documentation will appear here.</p>
          </div>
        )}
        {activeTabId === 'help' && (
          <div>
            <h3>Help Content</h3>
            <p>Help information will appear here.</p>
          </div>
        )}
        {activeTabId === 'history' && (
          <div>
            <h3>History Content</h3>
            <p>Session history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );};
