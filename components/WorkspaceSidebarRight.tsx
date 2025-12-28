// components/WorkspaceSidebarRight.tsx
import React, { useState, useEffect } from "react";
import { ProjectTree } from "./ProjectTree";
import { SandboxPanel } from "./SandboxPanel";
import { useCockpitMode } from "@/contexts/CockpitModeContext"; // Import useCockpitMode
import { CognitionSurface } from "./CognitionSurface"; // Import CognitionSurface

export const WorkspaceSidebarRight: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from context
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Define tab configurations based on cockpitMode
  const tabsConfig = React.useMemo(() => {
    if (cockpitMode === 'customer') {
      return [
        { id: 'help', icon: '❓', tooltip: 'Help' },
        { id: 'docs', icon: '📄', tooltip: 'Docs' },
        { id: 'history', icon: '🕒', tooltip: 'History' },
      ];
    } else { // admin or dev mode
      return [
        { id: 'files', icon: '🗂', tooltip: 'Files' },
        { id: 'sandbox', icon: '🧪', tooltip: 'Sandbox' },
        { id: 'cognition', icon: '🧠', tooltip: 'Cognition' },
        { id: 'docs', icon: '📄', tooltip: 'Docs' },
        { id: 'history', icon: '🕒', tooltip: 'History' },
      ];
    }
  }, [cockpitMode]);

  // Close panel if mode changes or activeTabId becomes null
  useEffect(() => {
    if (activeTabId === null) {
      setIsPanelOpen(false);
    }
  }, [activeTabId]);

  // Close panel if cockpitMode changes
  useEffect(() => {
    setIsPanelOpen(false);
    setActiveTabId(null);
  }, [cockpitMode]);

  const handleTabClick = (tabId: string) => {
    if (activeTabId === tabId) {
      setIsPanelOpen(false);
      setActiveTabId(null);
    } else {
      setActiveTabId(tabId);
      setIsPanelOpen(true);
    }
  };

  // Mock cognition state and highlighted principle for demonstration
  const mockCognitionState = "Policy Enforcement";
  const mockHighlightedPrinciple = "Make work visible";

  return (
    <div className="workspace-sidebar-right-inner">
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

      {isPanelOpen && (
        <div className="brew-panel-backdrop" onClick={() => setIsPanelOpen(false)}></div>
      )}

      {isPanelOpen && (
        <div className="brew-glass-panel">
          <div className="brew-glass-panel-header">
            <span className="brew-glass-panel-title">
              {tabsConfig.find(tab => tab.id === activeTabId)?.tooltip || 'Panel'}
            </span>
            <button className="brew-glass-panel-close" onClick={() => setIsPanelOpen(false)}>
              ✕
            </button>
          </div>
          <div className="brew-glass-panel-body">
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
            {activeTabId === 'docs' && (
              <div>
                <h3>Docs Content</h3>
                <p>Documentation will appear here.</p>
              </div>
            )}
            {activeTabId === 'history' && (
              <div>
                <h3>History Content</h3>
                <p>Session history will appear here.</p>
              </div>
            )}
            {activeTabId === 'help' && (
              <div>
                <h3>Help Content</h3>
                <p>Help information will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
