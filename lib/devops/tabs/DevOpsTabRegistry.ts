export type DevOpsTabId =
  | 'guide'
  | 'docs'
  | 'help'
  | 'history'
  | 'collab'
  | 'ops'
  | 'files'
  | 'sandbox'
  | 'cognition';

export interface DevOpsTab {
  id: DevOpsTabId;
  label: string;
  icon: string;
  adminOnly: boolean;
}

export const DEVOPS_TABS: DevOpsTab[] = [
  { id: 'guide', label: 'Guide', icon: '🗺️', adminOnly: false },
  { id: 'docs', label: 'Docs', icon: '📚', adminOnly: false },
  { id: 'help', label: 'Help', icon: '❓', adminOnly: false },
  { id: 'history', label: 'History', icon: '📜', adminOnly: false },
  { id: 'collab', label: 'Collab', icon: '🤝', adminOnly: false },
  { id: 'ops', label: 'Ops', icon: '🛠️', adminOnly: false },

  // Admin-only
  { id: 'files', label: 'Files', icon: '📁', adminOnly: true },
  { id: 'sandbox', label: 'Sandbox', icon: '🏖️', adminOnly: true },
  { id: 'cognition', label: 'Cognition', icon: '🧠', adminOnly: true },
];
