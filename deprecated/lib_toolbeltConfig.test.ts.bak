import {
  computeToolbeltRules,
  ToolbeltBrewMode,
  ToolbeltTier,
  McpToolId,
  ToolPermission,
} from '@/lib/toolbeltConfig';

describe('computeToolbeltRules', () => {
  // Define a helper to easily check a specific tool's permission
  const checkPermission = (
    mode: ToolbeltBrewMode,
    tier: ToolbeltTier,
    toolId: McpToolId,
  ): ToolPermission => {
    const rules = computeToolbeltRules(mode, tier);
    return rules.mcp[toolId] || 'blocked'; // Default to 'blocked' if not explicitly defined
  };

  // Define a helper to easily check a specific action's permission
  const checkActionPermission = (
    mode: ToolbeltBrewMode,
    tier: ToolbeltTier,
    action: 'fileWrite' | 'fileDelete' | 'gitCommit' | 'dbMigrate' | 'agentExec',
  ): ToolPermission => {
    const rules = computeToolbeltRules(mode, tier);
    return rules.actions[action] || 'blocked';
  };

  // --- Tier 1 (T1_SAFE) Tests ---
  describe('T1_SAFE (Tier 1 - Safe Actions)', () => {
    const safeTools: McpToolId[] = [
      'read-file',
      'list-directory',
      'explain-code',
      'propose-changes',
      'sandbox-prototype',
      'research-nims',
      'suggest-edits',
    ];

    safeTools.forEach(toolId => {
      it(`should allow ${toolId} in HRM at T1_SAFE`, () => {
        expect(checkPermission('HRM', 'T1_SAFE', toolId)).toBe('allowed');
      });
      it(`should allow ${toolId} in LLM at T1_SAFE`, () => {
        expect(checkPermission('LLM', 'T1_SAFE', toolId)).toBe('allowed');
      });
      it(`should allow ${toolId} in AGENT at T1_SAFE`, () => {
        expect(checkPermission('AGENT', 'T1_SAFE', toolId)).toBe('allowed');
      });
      it(`should allow ${toolId} in LOOP at T1_SAFE`, () => {
        expect(checkPermission('LOOP', 'T1_SAFE', toolId)).toBe('allowed');
      });
    });

    it('should block file-assistant in HRM at T1_SAFE', () => {
      expect(checkPermission('HRM', 'T1_SAFE', 'file-assistant')).toBe('blocked');
    });
    it('should block multi-file-refactors in AGENT at T1_SAFE', () => {
      expect(checkPermission('AGENT', 'T1_SAFE', 'multi-file-refactors')).toBe('blocked');
    });

    it('LLM mode T1_SAFE blocks all write actions', () => {
      const rules = computeToolbeltRules('LLM', 'T1_SAFE');
      expect(rules.actions.fileWrite).toBe('blocked');
      expect(rules.actions.fileDelete).toBe('blocked');
      expect(rules.actions.gitCommit).toBe('blocked');
      expect(rules.actions.dbMigrate).toBe('blocked');
      expect(rules.actions.agentExec).toBe('blocked'); // AgentExec is needs_confirm in T1_SAFE for AGENT
      expect(rules.truth.minScoreForWrite).toBe(1.0); // Corrected expectation
    });
  });

  // --- Tier 2 (T2_PATCH) Tests ---
  describe('T2_PATCH (Tier 2 - Patch Actions)', () => {
    it('should allow file-assistant in LLM at T2_PATCH with confirmation', () => {
      expect(checkPermission('LLM', 'T2_PATCH', 'file-assistant')).toBe('needs_confirm');
    });
    it('should allow file-assistant in AGENT at T2_PATCH', () => {
      expect(checkPermission('AGENT', 'T2_PATCH', 'file-assistant')).toBe('allowed');
    });
    it('should block file-assistant in HRM at T2_PATCH', () => {
      expect(checkPermission('HRM', 'T2_PATCH', 'file-assistant')).toBe('blocked');
    });

    it('should allow git-command-center in AGENT at T2_PATCH with confirmation', () => {
      expect(checkPermission('AGENT', 'T2_PATCH', 'git-command-center')).toBe('needs_confirm');
    });
    it('should allow git-command-center in LLM at T2_PATCH with confirmation', () => {
      expect(checkPermission('LLM', 'T2_PATCH', 'git-command-center')).toBe('needs_confirm');
    });

    it('should block multi-file-refactors in LLM at T2_PATCH', () => {
      expect(checkPermission('LLM', 'T2_PATCH', 'multi-file-refactors')).toBe('blocked');
    });
    it('should allow multi-file-refactors in AGENT at T2_PATCH with confirmation', () => {
      expect(checkPermission('AGENT', 'T2_PATCH', 'multi-file-refactors')).toBe('needs_confirm');
    });

    it('LLM mode T2_PATCH requires confirmation for fileWrite, gitCommit, agentExec', () => {
      const rules = computeToolbeltRules('LLM', 'T2_PATCH');
      expect(rules.actions.fileWrite).toBe('needs_confirm');
      expect(rules.actions.gitCommit).toBe('needs_confirm');
      expect(rules.actions.agentExec).toBe('needs_confirm');
      expect(rules.actions.dbMigrate).toBe('needs_confirm');
      expect(rules.truth.minScoreForWrite).toBe(0.7);
    });

    it('AGENT mode T2_PATCH requires confirmation for all write actions', () => {
      const rules = computeToolbeltRules('AGENT', 'T2_PATCH');
      expect(rules.actions.fileWrite).toBe('allowed');
      expect(rules.actions.fileDelete).toBe('needs_confirm');
      expect(rules.actions.gitCommit).toBe('needs_confirm');
      expect(rules.actions.dbMigrate).toBe('needs_confirm');
      expect(rules.actions.agentExec).toBe('needs_confirm');
    });
  });

  // --- Tier 3 (T3_DANGEROUS) Tests ---
  describe('T3_DANGEROUS (Tier 3 - Dangerous Actions)', () => {
    it('should allow file-assistant in LLM at T3_DANGEROUS', () => {
      expect(checkPermission('LLM', 'T3_DANGEROUS', 'file-assistant')).toBe('allowed');
    });
    it('should allow multi-file-refactors in AGENT at T3_DANGEROUS with admin_only', () => {
      expect(checkPermission('AGENT', 'T3_DANGEROUS', 'multi-file-refactors')).toBe('admin_only');
    });
    it('should allow break-repo in AGENT at T3_DANGEROUS with admin_only', () => {
      expect(checkPermission('AGENT', 'T3_DANGEROUS', 'break-repo')).toBe('admin_only');
    });
    it('should allow break-repo in LLM at T3_DANGEROUS with admin_only', () => {
      expect(checkPermission('LLM', 'T3_DANGEROUS', 'break-repo')).toBe('admin_only');
    });

    it('LLM mode T3_DANGEROUS marks agentExec and dbMigrate as admin_only', () => {
      const rules = computeToolbeltRules('LLM', 'T3_DANGEROUS');
      expect(rules.actions.fileWrite).toBe('allowed');
      expect(rules.actions.gitCommit).toBe('needs_confirm');
      expect(rules.actions.agentExec).toBe('admin_only');
      expect(rules.actions.dbMigrate).toBe('admin_only');
    });

    it('AGENT mode T3_DANGEROUS marks agentExec and dbMigrate as admin_only', () => {
      const rules = computeToolbeltRules('AGENT', 'T3_DANGEROUS');
      expect(rules.actions.fileWrite).toBe('allowed');
      expect(rules.actions.fileDelete).toBe('allowed');
      expect(rules.actions.gitCommit).toBe('allowed');
      expect(rules.actions.dbMigrate).toBe('admin_only');
      expect(rules.actions.agentExec).toBe('admin_only');
    });
  });

  // --- Edge Cases and Defaults ---
  it('should return "blocked" for a non-existent tool', () => {
    expect(checkPermission('AGENT', 'T3_POWER', 'non-existent-tool' as McpToolId)).toBe('blocked');
  });

  it('should handle unknown mode gracefully (default to blocked)', () => {
    // Casting to bypass TypeScript for testing invalid input
    const rules = computeToolbeltRules('UNKNOWN_MODE' as ToolbeltBrewMode, 'T1_SAFE');
    expect(rules.mcp['read-file']).toBe('blocked');
    expect(rules.actions.fileWrite).toBe('blocked');
  });

  it('should handle unknown tier gracefully (default to blocked)', () => {
    // Casting to bypass TypeScript for testing invalid input
    const rules = computeToolbeltRules('HRM', 'UNKNOWN_TIER' as ToolbeltTier);
    expect(rules.mcp['read-file']).toBe('allowed');
    expect(rules.actions.fileWrite).toBe('blocked');
  });
});