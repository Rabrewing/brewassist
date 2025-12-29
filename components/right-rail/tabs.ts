import React from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext";

export interface TabConfig {
  id: string;
  icon: string;
  label: string; // Changed from tooltip to label to match GlassTabRail
  modes: ('customer' | 'admin' | 'dev')[];
  contentComponent?: React.FC<any>; // Optional: for directly embedding components
}

export const getTabsConfig = (cockpitMode: 'customer' | 'admin' | 'dev'): TabConfig[] => {
  const baseTabs: TabConfig[] = [
    { id: 'guide', icon: '🧭', label: 'Guide', modes: ['customer', 'admin', 'dev'] },
    { id: 'docs', icon: '📄', label: 'Docs', modes: ['customer', 'admin', 'dev'] },
    { id: 'help', icon: '❓', label: 'Help', modes: ['customer', 'admin', 'dev'] },
    { id: 'history', icon: '🕒', label: 'History', modes: ['customer', 'admin', 'dev'] },
  ];

  const adminDevTabs: TabConfig[] = [
    { id: 'files', icon: '🗂', label: 'Files', modes: ['admin', 'dev'] },
    { id: 'sandbox', icon: '🧪', label: 'Sandbox', modes: ['admin', 'dev'] },
    { id: 'cognition', icon: '🧠', label: 'Cognition', modes: ['admin', 'dev'] },
  ];

  if (cockpitMode === 'customer') {
    return baseTabs;
  } else {
    return [...baseTabs, ...adminDevTabs];
  }
};