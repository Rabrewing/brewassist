import { DEVOPS_TABS } from '../../lib/devops/tabs/DevOpsTabRegistry';

describe('Right Panel Tab Registry Integrity', () => {
  test('all tabs have unique IDs', () => {
    const ids = DEVOPS_TABS.map((tab) => tab.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('tabs have required fields', () => {
    DEVOPS_TABS.forEach((tab) => {
      expect(tab).toHaveProperty('id');
      expect(tab).toHaveProperty('label');
      expect(tab).toHaveProperty('icon');
      expect(tab).toHaveProperty('adminOnly');
      expect(typeof tab.id).toBe('string');
      expect(typeof tab.label).toBe('string');
      expect(typeof tab.icon).toBe('string');
      expect(typeof tab.adminOnly).toBe('boolean');
    });
  });

  test('customer sees exactly guide, docs, help, history', () => {
    const customerTabs = DEVOPS_TABS.filter((tab) => !tab.adminOnly);
    const ids = customerTabs.map((tab) => tab.id);
    expect(ids.sort()).toEqual(['docs', 'guide', 'help', 'history'].sort());
  });
});
