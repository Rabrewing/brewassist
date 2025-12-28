import React, { useEffect } from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { ProjectTree } from "../ProjectTree";
import { SandboxPanel } from "../SandboxPanel";
import { CognitionSurface } from "../CognitionSurface";
import { getTabsConfig } from "./tabs";
import { DevOps8SignalsPanel } from "./DevOps8SignalsPanel"; // Import the new component

interface GlassOverlayPanelProps {
  activeTabId: string | null;
  setIsPanelOpen: (isOpen: boolean) => void;
  setActiveTabId: (id: string | null) => void;
}

export const GlassOverlayPanel: React.FC<GlassOverlayPanelProps> = ({
  activeTabId,
  setIsPanelOpen,
  setActiveTabId,
}) => {
  const { mode: cockpitMode } = useCockpitMode();
  const tabsConfig = React.useMemo(() => getTabsConfig(cockpitMode), [cockpitMode]);

  // Mock cognition state and highlighted principle for demonstration
  const mockCognitionState = "Policy Enforcement";
  const mockHighlightedPrinciple = "Make work visible";

  // Close panel on ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPanelOpen(false);
        setActiveTabId(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsPanelOpen, setActiveTabId]);

  if (!activeTabId) return null;

  const panelTitle = tabsConfig.find(tab => tab.id === activeTabId)?.tooltip || 'Panel';

  return (
    <>
      <div className="brew-panel-backdrop" onClick={() => { setIsPanelOpen(false); setActiveTabId(null); }}></div>
      <div className="brew-glass-panel">
        <div className="brew-glass-panel-header">
          <span className="brew-glass-panel-title">{panelTitle}</span>
          <button className="brew-glass-panel-close" onClick={() => { setIsPanelOpen(false); setActiveTabId(null); }}>
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
          {activeTabId === 'guide' && (
            <DevOps8SignalsPanel />
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
    </>
  );
};
