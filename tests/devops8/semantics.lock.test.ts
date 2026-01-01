import { DEVOPS8_PRINCIPLES } from '../../lib/devops8/semantics';

describe('DevOps8 Semantics Lock', () => {
  test('has exactly 8 principles', () => {
    expect(DEVOPS8_PRINCIPLES).toHaveLength(8);
  });

  test('all principles have required fields', () => {
    DEVOPS8_PRINCIPLES.forEach((principle) => {
      expect(principle).toHaveProperty('id');
      expect(principle).toHaveProperty('label');
      expect(principle).toHaveProperty('signal');
      expect(typeof principle.id).toBe('string');
      expect(typeof principle.label).toBe('string');
      expect(typeof principle.signal).toBe('string');
    });
  });

  test('principle IDs are unique', () => {
    const ids = DEVOPS8_PRINCIPLES.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('principle labels are unique', () => {
    const labels = DEVOPS8_PRINCIPLES.map((p) => p.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });
});
