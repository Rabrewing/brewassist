import { InitEngine } from '../lib/init/initEngine';
import { InitialProjectProfileManager } from '../lib/project/initialProfile';
import { resolveModeProfile } from '../lib/mode/modeResolver';
import { bindModeToToolbelt } from '../lib/toolbelt/modeBindings';
import { enforceCustomerMode } from '../lib/policies/customerMode';
import { switchMode } from '../lib/mode/modeSwitch';
import {
  emitModeSelectedEvent,
  emitInitCompletedEvent,
} from '../lib/brewtruth/modeEvents';

describe('S4.13-14 Integration Smoke Suite', () => {
  test('/init → mode → toolbelt integration', () => {
    const engine = new InitEngine();
    const detection = engine.detectProject();
    const modeProfile = engine.selectInitialMode(detection);
    const toolbelt = bindModeToToolbelt(modeProfile);

    expect(typeof detection.projectType).toBe('string');
    expect(modeProfile.mode).toBeDefined();
    expect(toolbelt.availableTools).toBeInstanceOf(Array);
    expect(toolbelt.tier).toBe(modeProfile.toolbeltTier);
  });

  test('Customer vs Admin paths diverge correctly', () => {
    const agentProfile = resolveModeProfile('AGENT');
    const customerEnforced = enforceCustomerMode(agentProfile, true);
    const adminProfile = enforceCustomerMode(agentProfile, false);

    expect(customerEnforced.toolbeltTier).toBe(1);
    expect(customerEnforced.memoryPolicy).toBe('read-only');
    expect(adminProfile.toolbeltTier).toBe(3);
    expect(adminProfile.memoryPolicy).toBe('full-access');
  });

  test('BrewTruth events emitted on mode and init decisions', () => {
    const profile = resolveModeProfile('HRM');
    const initProfile = {
      projectType: 'new' as const,
      stack: { language: ['javascript'] },
      experienceLevel: 'vibe' as const,
      selectedMode: 'HRM' as const,
      toolbeltTier: 2 as const,
      timestamp: new Date().toISOString(),
    };

    // These calls would emit events in real usage
    expect(() => emitModeSelectedEvent('HRM', profile)).not.toThrow();
    expect(() => emitInitCompletedEvent(initProfile)).not.toThrow();
  });

  test('No sandbox leak in toolbelt binding', () => {
    const loopProfile = resolveModeProfile('LOOP');
    const toolbelt = bindModeToToolbelt(loopProfile);

    expect(toolbelt.sandboxRequired).toBe(true);
    expect(toolbelt.availableTools).toContain('bash');
    expect(toolbelt.availableTools).not.toContain('task');
  });

  test('Mode switching preserves safety', () => {
    const switchResult = switchMode({
      fromMode: 'LLM',
      toMode: 'AGENT',
      confirmation: true,
      isCustomer: true,
    });

    expect(switchResult.success).toBe(true);
    expect(switchResult.newProfile?.toolbeltTier).toBe(1);
  });
});
