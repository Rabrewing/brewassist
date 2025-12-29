import React, { useState } from 'react';
import { TabDefinition, customerTabs, adminTabs } from './tabs';
import GlassOverlayPanel from './GlassOverlayPanel';
import DevOps8Panel from './DevOps8Panel';
import { CognitionSurface } from '../CognitionSurface'; // Import CognitionSurface

interface GlassTabRailProps {
  isAdmin: boolean;
}

const GlassTabRail: React.FC<GlassTabRailProps> = ({ isAdmin }) => {
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const tabsToRender = isAdmin ? adminTabs : customerTabs;

  const handleTabClick = (tabId: string) => {
    setActiveTabId(prevId => (prevId === tabId ? null : tabId));
  };

  const handleCloseOverlay = () => {
    setActiveTabId(null);
  };

  const ActiveTabContent = () => {
    switch (activeTabId) {
      case 'guide':
        return <DevOps8Panel />;
      case 'docs':
        return <div>Docs Content</div>;
      case 'help':
        return <div>Help Content</div>;
      case 'history':
        return <div>History Content</div>;
      case 'files':
        return <div>Files Content (Admin Only)</div>;
      case 'sandbox':
        return <div>Sandbox Content (Admin Only)</div>;
      case 'cognition':
        return <CognitionSurface />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="glass-tab-rail">
        {tabsToRender.map(tab => (
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
        isOpen={activeTabId !== null}
        onClose={handleCloseOverlay}
        title={tabsToRender.find(tab => tab.id === activeTabId)?.label}
      >
        <ActiveTabContent />
      </GlassOverlayPanel>
    </>
  );
};

export default GlassTabRail;
