// __tests__/toolbeltConfig.test.ts
import { computeToolbeltRules, ToolbeltBrewMode, ToolbeltTier } from '@/lib/toolbeltConfig';

describe('computeToolbeltRules', () => {
  // Test cases for HRM Mode
  test('HRM mode always results in blocked write actions and T1_SAFE equivalent', () => {
            const modes: ToolbeltBrewMode[] = ['HRM'];
            const tiers: ToolbeltTier[] = ['T1_SAFE', 'T2_GUIDED', 'T3_POWER'];
    
            modes.forEach(mode => {
              tiers.forEach(tier => {
                const rules = computeToolbeltRules(mode, tier);
                expect(rules.mcp['file-assistant']).toBe('blocked');
                expect(rules.actions.fileWrite).toBe('blocked');
                expect(rules.actions.gitCommit).toBe('blocked');
                expect(rules.actions.dbMigrate).toBe('blocked');
                expect(rules.actions.agentExec).toBe('blocked');
                expect(rules.mcp['research-nims']).toBe('allowed');        expect(rules.truth.minScoreForWrite).toBe(1.0);
        expect(rules.truth.minScoreForSystemChange).toBe(1.0);
      });
    });
  });

  // Test cases for LLM Mode
  test('LLM mode T1_SAFE blocks all write actions', () => {
    const rules = computeToolbeltRules('LLM', 'T1_SAFE');
    expect(rules.actions.fileWrite).toBe('blocked');
    expect(rules.actions.gitCommit).toBe('blocked');
    expect(rules.actions.dbMigrate).toBe('blocked');
    expect(rules.actions.agentExec).toBe('blocked');
    expect(rules.truth.minScoreForWrite).toBe(1.0);
  });

  test('LLM mode T2_GUIDED requires confirmation for fileWrite, gitCommit, agentExec', () => {
    const rules = computeToolbeltRules('LLM', 'T2_GUIDED');
    expect(rules.actions.fileWrite).toBe('needs_confirm');
    expect(rules.actions.gitCommit).toBe('needs_confirm');
    expect(rules.actions.agentExec).toBe('needs_confirm');
    expect(rules.actions.dbMigrate).toBe('needs_confirm'); // Still blocked
    expect(rules.truth.minScoreForWrite).toBe(0.7);
  });

  test('LLM mode T3_POWER marks agentExec and dbMigrate as admin_only', () => {
    const rules = computeToolbeltRules('LLM', 'T3_POWER');
    expect(rules.actions.fileWrite).toBe('allowed');
    expect(rules.actions.gitCommit).toBe('needs_confirm');
    expect(rules.actions.agentExec).toBe('admin_only');
    expect(rules.actions.dbMigrate).toBe('admin_only');
    expect(rules.truth.minScoreForWrite).toBe(0.7);
    expect(rules.truth.minScoreForSystemChange).toBe(0.7);
  });

  // Test cases for AGENT Mode
  test('AGENT mode T1_SAFE requires confirmation for agentExec, blocks other writes', () => {
    const rules = computeToolbeltRules('AGENT', 'T1_SAFE');
    expect(rules.actions.agentExec).toBe('needs_confirm');
    expect(rules.actions.fileWrite).toBe('blocked');
    expect(rules.actions.gitCommit).toBe('blocked');
  });

  test('AGENT mode T2_GUIDED requires confirmation for all write actions', () => {
    const rules = computeToolbeltRules('AGENT', 'T2_GUIDED');
    expect(rules.actions.fileWrite).toBe('allowed');
    expect(rules.actions.fileDelete).toBe('needs_confirm');
    expect(rules.actions.gitCommit).toBe('needs_confirm');
    expect(rules.actions.dbMigrate).toBe('needs_confirm');
    expect(rules.actions.agentExec).toBe('needs_confirm');
    expect(rules.truth.minScoreForWrite).toBe(0.7);
  });

  test('AGENT mode T3_POWER marks agentExec and dbMigrate as admin_only', () => {
    const rules = computeToolbeltRules('AGENT', 'T3_POWER');
    expect(rules.actions.fileWrite).toBe('allowed');
    expect(rules.actions.fileDelete).toBe('allowed');
    expect(rules.actions.gitCommit).toBe('allowed');
    expect(rules.actions.dbMigrate).toBe('admin_only');
    expect(rules.actions.agentExec).toBe('admin_only');
    expect(rules.truth.minScoreForWrite).toBe(0.7);
    expect(rules.truth.minScoreForSystemChange).toBe(0.7);
  });

  // Test cases for LOOP Mode
  test('LOOP mode always results in blocked write actions and T1_SAFE equivalent', () => {
    const modes: ToolbeltBrewMode[] = ['LOOP'];
    const tiers: ToolbeltTier[] = ['T1_SAFE', 'T2_GUIDED', 'T3_POWER'];

    modes.forEach(mode => {
      tiers.forEach(tier => {
        const rules = computeToolbeltRules(mode, tier);
        expect(rules.mcp['file-assistant']).toBe('blocked');
        expect(rules.actions.fileWrite).toBe('blocked');
        expect(rules.actions.gitCommit).toBe('blocked');
        expect(rules.actions.dbMigrate).toBe('blocked');
        expect(rules.actions.agentExec).toBe('blocked');
        expect(rules.mcp['research-nims']).toBe('allowed');
        expect(rules.truth.minScoreForWrite).toBe(1.0);
        expect(rules.truth.minScoreForSystemChange).toBe(1.0);
      });
    });
  });
});
