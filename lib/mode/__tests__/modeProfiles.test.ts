import { resolveModeProfile } from '../modeResolver';

describe('Mode Profiles', () => {
  test('HRM mode resolves deterministically', () => {
    const profile = resolveModeProfile('HRM');
    expect(profile.mode).toBe('HRM');
    expect(profile.defaultTone).toBe('safe');
    expect(profile.allowedTools).toContain('read');
    expect(profile.allowedTools).toContain('capability.file.read.analyze');
    expect(profile.allowedTools).toContain('capability.plan.assist');
    expect(profile.toolbeltTier).toBe(2);
    expect(profile.sandboxPolicy).toBe('required');
    expect(profile.memoryPolicy).toBe('read-only');
    expect(profile.brewtruthLevel).toBe('detailed');
  });

  test('LLM mode resolves deterministically', () => {
    const profile = resolveModeProfile('LLM');
    expect(profile.mode).toBe('LLM');
    expect(profile.defaultTone).toBe('balanced');
    expect(profile.allowedTools).toContain('websearch');
    expect(profile.allowedTools).toContain('capability.code.explain');
    expect(profile.allowedTools).toContain('capability.research.external');
    expect(profile.toolbeltTier).toBe(1);
    expect(profile.sandboxPolicy).toBe('optional');
    expect(profile.memoryPolicy).toBe('write-allowed');
    expect(profile.brewtruthLevel).toBe('standard');
  });

  test('AGENT mode resolves deterministically', () => {
    const profile = resolveModeProfile('AGENT');
    expect(profile.mode).toBe('AGENT');
    expect(profile.defaultTone).toBe('directive');
    expect(profile.allowedTools).toContain('task');
    expect(profile.allowedTools).toContain('capability.file.read.analyze');
    expect(profile.allowedTools).toContain('capability.plan.assist');
    expect(profile.toolbeltTier).toBe(3);
    expect(profile.sandboxPolicy).toBe('required');
    expect(profile.memoryPolicy).toBe('full-access');
    expect(profile.brewtruthLevel).toBe('detailed');
  });

  test('LOOP mode resolves deterministically', () => {
    const profile = resolveModeProfile('LOOP');
    expect(profile.mode).toBe('LOOP');
    expect(profile.defaultTone).toBe('balanced');
    expect(profile.allowedTools).toContain('bash');
    expect(profile.allowedTools).toContain('capability.code.explain');
    expect(profile.toolbeltTier).toBe(2);
    expect(profile.sandboxPolicy).toBe('required');
    expect(profile.memoryPolicy).toBe('write-allowed');
    expect(profile.brewtruthLevel).toBe('standard');
  });

  test('Unknown mode throws error', () => {
    expect(() => resolveModeProfile('UNKNOWN' as any)).toThrow(
      'Unknown mode: UNKNOWN'
    );
  });
});
