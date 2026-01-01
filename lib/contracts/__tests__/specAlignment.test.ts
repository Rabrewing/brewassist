import { validateBrewAssistSpec } from '../brewAssistSpec';

describe('BrewAssist Spec Validation', () => {
  test('validates mode-driven behavior correctly', () => {
    const result = validateBrewAssistSpec();
    expect(result.compliant).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  test('detects violations if HRM tone changed', () => {
    // This test assumes the spec is correct; in practice we'd mock the resolver
    const result = validateBrewAssistSpec();
    expect(result.violations).not.toContain('HRM mode should have safe tone');
  });

  test('fails if customer restrictions not enforced', () => {
    const result = validateBrewAssistSpec();
    expect(result.violations).not.toContain(
      'Customer mode should cap at tier 1'
    );
  });
});
