// components/WorkspaceSidebarRight.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useCockpitMode } from '@/contexts/CockpitModeContext';
import { ProjectTree } from './ProjectTree';
import { SandboxPanel } from './SandboxPanel';
import { CognitionSurface } from './CognitionSurface';
import DevOps8Panel from './right-rail/DevOps8Panel';
import { getVisibleTabs } from '@/lib/devops/tabs/getVisibleTabs';
import { type DevOpsTab } from '@/lib/devops/tabs/DevOpsTabRegistry';

export const WorkspaceSidebarRight: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const tabsConfig = useMemo(() => getVisibleTabs(cockpitMode), [cockpitMode]);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    tabsConfig[0]?.id || null
  );

  // Mock cognition state and highlighted principle for demonstration
  const mockCognitionState = 'Policy Enforcement';
  const mockHighlightedPrinciple = 'Make work visible';

  // Reset active tab if cockpitMode changes and current tab is no longer available
  useEffect(() => {
    if (activeTabId && !tabsConfig.some((tab) => tab.id === activeTabId)) {
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
            className={`workspace-sidebar-right-tab-item ${activeTabId === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>
      <div className="workspace-sidebar-right-content">
        {activeTabId === 'files' && <div data-testid="tab-files" />}
        {activeTabId === 'sandbox' && <div data-testid="tab-sandbox" />}
        {activeTabId === 'cognition' && <div data-testid="tab-cognition" />}
        {activeTabId === 'guide' && <div data-testid="tab-guide" />}
        {activeTabId === 'docs' && <div data-testid="tab-docs" />}
        {activeTabId === 'help' && <div data-testid="tab-help" />}
        {activeTabId === 'history' && <div data-testid="tab-history" />}
      </div>
    </div>
  );
};
