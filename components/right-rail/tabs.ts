export interface TabDefinition {
  id: string;
  label: string;
  icon: string; // Placeholder for icon, will be used later
  adminOnly?: boolean;
}

export const customerTabs: TabDefinition[] = [
  { id: 'guide', label: 'Guide', icon: '📖' },
  { id: 'docs', label: 'Docs', icon: '📚' },
  { id: 'help', label: 'Help', icon: '❓' },
  { id: 'history', label: 'History', icon: '⏳' },
];

export const adminTabs: TabDefinition[] = [
  ...customerTabs,
  { id: 'files', label: 'Files', icon: '📁', adminOnly: true },
  { id: 'sandbox', label: 'Sandbox', icon: '🏖️', adminOnly: true },
  { id: 'cognition', label: 'Cognition', icon: '🧠', adminOnly: true },
];
