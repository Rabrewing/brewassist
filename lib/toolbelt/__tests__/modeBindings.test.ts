import { bindModeToToolbelt } from '../modeBindings';
import { resolveModeProfile } from '../../mode/modeResolver';

describe('Mode to Toolbelt Binding', () => {
  test('HRM blocks code mutation tools', () => {
    const profile = resolveModeProfile('HRM');
    const toolbelt = bindModeToToolbelt(profile);
    expect(toolbelt.availableTools).not.toContain('edit');
    expect(toolbelt.availableTools).not.toContain('write');
    expect(toolbelt.availableTools).not.toContain('bash');
    expect(toolbelt.tier).toBe(2);
    expect(toolbelt.sandboxRequired).toBe(true);
  });

  test('LLM blocks file mutation unless allowed', () => {
    const profile = resolveModeProfile('LLM');
    const toolbelt = bindModeToToolbelt(profile);
    expect(toolbelt.availableTools).toContain('read');
    expect(toolbelt.availableTools).not.toContain('edit');
    expect(toolbelt.availableTools).not.toContain('write');
    expect(toolbelt.tier).toBe(1);
    expect(toolbelt.sandboxRequired).toBe(false);
  });

  test('AGENT requires sandbox', () => {
    const profile = resolveModeProfile('AGENT');
    const toolbelt = bindModeToToolbelt(profile);
    expect(toolbelt.availableTools).toContain('task');
    expect(toolbelt.tier).toBe(3);
    expect(toolbelt.sandboxRequired).toBe(true);
  });

  test('LOOP enforces scope + iteration limits', () => {
    const profile = resolveModeProfile('LOOP');
    const toolbelt = bindModeToToolbelt(profile);
    expect(toolbelt.availableTools).toContain('bash');
    expect(toolbelt.availableTools).not.toContain('task');
    expect(toolbelt.tier).toBe(2);
    expect(toolbelt.sandboxRequired).toBe(true);
  });
});
