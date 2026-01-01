import { DEVOPS_TABS } from './DevOpsTabRegistry';

export function getVisibleTabs(cockpitMode: 'admin' | 'customer') {
  return DEVOPS_TABS.filter((tab) =>
    tab.adminOnly ? cockpitMode === 'admin' : true
  );
}
