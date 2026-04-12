import { getVisibleTabs } from '../../lib/devops/tabs/getVisibleTabs';

describe('DevOps Tabs Visibility', () => {
  test('Customer sees only non-admin tabs', () => {
    const tabs = getVisibleTabs('customer');
    const tabIds = tabs.map((tab) => tab.id);
    expect(tabIds).toEqual([
      'guide',
      'docs',
      'help',
      'history',
      'collab',
      'ops',
    ]);
  });

  test('Admin sees all tabs', () => {
    const tabs = getVisibleTabs('admin');
    const tabIds = tabs.map((tab) => tab.id);
    expect(tabIds).toEqual([
      'guide',
      'docs',
      'help',
      'history',
      'collab',
      'ops',
      'files',
      'sandbox',
      'cognition',
    ]);
  });
});
