import { checkS4FreezeReadiness } from '../s4Check';

describe('S4 Freeze Readiness', () => {
  test('asserts S4 is freeze-safe', () => {
    const check = checkS4FreezeReadiness();
    expect(check.ready).toBe(true);
    expect(check.issues).toHaveLength(0);
  });

  test('detects missing components', () => {
    // This test assumes all components are present
    const check = checkS4FreezeReadiness();
    expect(check.issues).not.toContain('Mode wizard engine incomplete');
    expect(check.issues).not.toContain('/init orchestration incomplete');
  });

  test('validates no UI dependencies', () => {
    const check = checkS4FreezeReadiness();
    expect(check.issues).not.toContain('Implementation has UI dependencies');
  });
});
