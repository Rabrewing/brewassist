import { switchMode } from '../modeSwitch';

describe('Runtime Mode Switching', () => {
  test('requires confirmation flag', () => {
    const request = {
      fromMode: 'LLM' as const,
      toMode: 'HRM' as const,
      confirmation: false,
      isCustomer: false,
    };
    const result = switchMode(request);
    expect(result.success).toBe(false);
    expect(result.error).toContain('requires explicit confirmation');
  });

  test('switches mode safely with confirmation', () => {
    const request = {
      fromMode: 'LLM' as const,
      toMode: 'AGENT' as const,
      confirmation: true,
      isCustomer: false,
    };
    const result = switchMode(request);
    expect(result.success).toBe(true);
    expect(result.newProfile?.mode).toBe('AGENT');
  });

  test('enforces customer restrictions during switch', () => {
    const request = {
      fromMode: 'LLM' as const,
      toMode: 'AGENT' as const,
      confirmation: true,
      isCustomer: true,
    };
    const result = switchMode(request);
    expect(result.success).toBe(true);
    expect(result.newProfile?.toolbeltTier).toBe(1);
    expect(result.newProfile?.memoryPolicy).toBe('read-only');
  });

  test('fails on invalid mode', () => {
    const request = {
      fromMode: 'LLM' as const,
      toMode: 'INVALID' as any,
      confirmation: true,
      isCustomer: false,
    };
    const result = switchMode(request);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown mode');
  });
});
