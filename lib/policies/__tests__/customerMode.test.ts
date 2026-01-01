import { enforceCustomerMode, checkCustomerSafety } from '../customerMode';
import { resolveModeProfile } from '../../mode/modeResolver';

describe('Customer Mode Safety', () => {
  test('Customer Mode caps tier at 1', () => {
    const profile = resolveModeProfile('AGENT');
    const enforced = enforceCustomerMode(profile, true);
    expect(enforced.toolbeltTier).toBe(1);
  });

  test('Customer Mode enforces read-only memory', () => {
    const profile = resolveModeProfile('LLM');
    const enforced = enforceCustomerMode(profile, true);
    expect(enforced.memoryPolicy).toBe('read-only');
  });

  test('Customer Mode blocks dangerous tools', () => {
    const profile = resolveModeProfile('AGENT');
    const enforced = enforceCustomerMode(profile, true);
    expect(enforced.allowedTools).not.toContain('edit');
    expect(enforced.allowedTools).not.toContain('write');
    expect(enforced.allowedTools).not.toContain('bash');
    expect(enforced.allowedTools).not.toContain('task');
  });

  test('Attempted escalation fails', () => {
    const profile = resolveModeProfile('AGENT');
    const isSafe = checkCustomerSafety(profile, true);
    expect(isSafe).toBe(true); // Because we enforce it
  });

  test('Admin mode unaffected', () => {
    const profile = resolveModeProfile('AGENT');
    const enforced = enforceCustomerMode(profile, false);
    expect(enforced.toolbeltTier).toBe(3);
    expect(enforced.memoryPolicy).toBe('full-access');
  });
});
