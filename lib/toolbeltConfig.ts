// lib/toolbeltConfig.ts

import type { CockpitMode } from "./brewTypes"; // Import CockpitMode

// Define ToolbeltBrewMode locally to avoid conflict with existing BrewMode in lib/brewModes.ts
export type ToolbeltBrewMode = 'HRM' | 'LLM' | 'AGENT' | 'LOOP';
export type BrewModeId = 'HRM' | 'LLM' | 'AGENT' | 'LOOP';

export type ToolbeltTier = 'T1_SAFE' | 'T2_GUIDED' | 'T3_POWER';
export type ToolbeltTierId = 1 | 2 | 3;

export type RiskLevel = 'read' | 'write_single' | 'write_multi' | 'system';
export type ToolSafetyLevel = 'read-only' | 'single-file-write' | 'multi-file-write' | 'system-write';

export type ToolPermission = 'allowed' | 'needs_confirm' | 'admin_only' | 'blocked';

export type McpToolId =
  | 'read-file'
  | 'list-directory'
  | 'explain-code'
  | 'propose-changes'
  | 'sandbox-prototype'
  | 'research-nims'
  | 'suggest-edits'
  | 'file-assistant'
  | 'git-command-center'
  | 'database-assistant'
  | 'multi-file-refactors'
  | 'layout-rewrites'
  | 'schema-changes'
  | 'cross-module-rewiring'
  | 'break-repo';

export interface ToolRule {
  enabled: boolean;
  safety: ToolSafetyLevel;
  requireConfirmation: boolean;
  requireGepHeader: boolean;
}

export interface ToolbeltRulesSnapshot {
  mcp: Record<string, ToolPermission>;
  actions: {
    fileWrite: ToolPermission;
    fileDelete: ToolPermission;
    gitCommit: ToolPermission;
    dbMigrate: ToolPermission;
    agentExec: ToolPermission;
  };
  truth: {
    minScoreForWrite: number;
    minScoreForSystemChange: number;
  };
}

export function getToolRule(toolId: McpToolId, action: string): ToolRule {
  // This is a placeholder implementation.
  // In a real application, this would look up the rule from a configuration.
  return {
    enabled: true,
    safety: 'read-only',
    requireConfirmation: false,
    requireGepHeader: false,
  };
}

export function computeToolbeltRules(
  mode: ToolbeltBrewMode,
  tier: ToolbeltTier,
  cockpitMode: CockpitMode // Add cockpitMode
): ToolbeltRulesSnapshot {
  // Base rules: most restrictive defaults
  const rules: ToolbeltRulesSnapshot = {
    mcp: {
      'read-file': 'blocked',
      'list-directory': 'blocked',
      'explain-code': 'blocked',
      'propose-changes': 'blocked',
      'sandbox-prototype': 'blocked',
      'research-nims': 'blocked',
      'suggest-edits': 'blocked',
      'file-assistant': 'blocked',
      'git-command-center': 'blocked',
      'database-assistant': 'blocked',
      'multi-file-refactors': 'blocked',
      'layout-rewrites': 'blocked',
      'schema-changes': 'blocked',
      'cross-module-rewiring': 'blocked',
      'break-repo': 'blocked',
    },
    actions: {
      fileWrite: 'blocked',
      fileDelete: 'blocked',
      gitCommit: 'blocked',
      dbMigrate: 'blocked',
      agentExec: 'blocked',
    },
    truth: {
      minScoreForWrite: 1.0, // Default to highest score for safety
      minScoreForSystemChange: 1.0,
    },
  };

  if (cockpitMode === 'customer') {
    // For customer mode, all write/exec actions are blocked,
    // but read/proposals are allowed.
    rules.mcp['read-file'] = 'allowed';
    rules.mcp['list-directory'] = 'allowed';
    rules.mcp['explain-code'] = 'allowed';
    rules.mcp['propose-changes'] = 'allowed';
    rules.mcp['research-nims'] = 'allowed';
    rules.mcp['suggest-edits'] = 'allowed';
    rules.mcp['sandbox-prototype'] = 'blocked'; // Sandbox is hidden and blocked
    // All other mcp actions remain blocked by default

    rules.actions.fileWrite = 'blocked';
    rules.actions.fileDelete = 'blocked';
    rules.actions.gitCommit = 'blocked';
    rules.actions.dbMigrate = 'blocked';
    rules.actions.agentExec = 'blocked';

    // BrewTruth thresholds can remain as is, as BrewTruth is always on
    return rules; // Return early for customer mode
  }

  // Apply mode-specific and tier-specific rules
  if (mode === 'HRM') {
    // HRM is primarily for planning and read-only operations
    rules.mcp['read-file'] = 'allowed';
    rules.mcp['list-directory'] = 'allowed';
    rules.mcp['explain-code'] = 'allowed';
    rules.mcp['propose-changes'] = 'allowed';
    rules.mcp['research-nims'] = 'allowed';
    rules.mcp['suggest-edits'] = 'allowed'; // Can suggest edits, but not apply
    rules.mcp['sandbox-prototype'] = 'allowed'; // Can prototype in sandbox
    // All write actions remain blocked
    return rules;
  }

  if (mode === 'LOOP') {
    // LOOP is for commentary and read-only operations
    rules.mcp['read-file'] = 'allowed';
    rules.mcp['list-directory'] = 'allowed';
    rules.mcp['explain-code'] = 'allowed';
    rules.mcp['propose-changes'] = 'allowed';
    rules.mcp['research-nims'] = 'allowed';
    rules.mcp['suggest-edits'] = 'allowed'; // Can suggest edits, but not apply
    rules.mcp['sandbox-prototype'] = 'allowed'; // Can prototype in sandbox
    // All write actions remain blocked
    return rules;
  }

  if (mode === 'LLM') {
    // For LLM mode, start with a more permissive base for read actions
    rules.mcp['read-file'] = 'allowed';
    rules.mcp['list-directory'] = 'allowed';
    rules.mcp['explain-code'] = 'allowed';
    rules.mcp['propose-changes'] = 'allowed';
    rules.mcp['research-nims'] = 'allowed';
    rules.mcp['sandbox-prototype'] = 'allowed';
    rules.mcp['suggest-edits'] = 'allowed';

    if (tier === 'T1_SAFE') {
      // Already set to allowed for read-only tools
    } else if (tier === 'T2_GUIDED') {
      rules.mcp['file-assistant'] = 'needs_confirm';
      rules.mcp['git-command-center'] = 'needs_confirm';
      rules.mcp['database-assistant'] = 'needs_confirm';
      rules.actions.fileWrite = 'needs_confirm';
      rules.actions.gitCommit = 'needs_confirm';
      rules.actions.dbMigrate = 'needs_confirm';
      rules.actions.agentExec = 'needs_confirm';
      rules.truth.minScoreForWrite = 0.7;
    } else if (tier === 'T3_POWER') {
      rules.mcp['file-assistant'] = 'allowed';
      rules.mcp['git-command-center'] = 'needs_confirm';
      rules.mcp['database-assistant'] = 'admin_only';
      rules.mcp['multi-file-refactors'] = 'needs_confirm';
      rules.mcp['layout-rewrites'] = 'needs_confirm';
      rules.mcp['schema-changes'] = 'admin_only';
      rules.mcp['cross-module-rewiring'] = 'admin_only';
      rules.mcp['break-repo'] = 'admin_only';

      rules.actions.fileWrite = 'allowed';
      rules.actions.fileDelete = 'needs_confirm';
      rules.actions.gitCommit = 'needs_confirm';
      rules.actions.dbMigrate = 'admin_only';
      rules.actions.agentExec = 'admin_only';
      rules.truth.minScoreForWrite = 0.7;
      rules.truth.minScoreForSystemChange = 0.7;
    }
  } else if (mode === 'AGENT') {
    // For AGENT mode, start with a more permissive base for read actions
    rules.mcp['read-file'] = 'allowed';
    rules.mcp['list-directory'] = 'allowed';
    rules.mcp['explain-code'] = 'allowed';
    rules.mcp['propose-changes'] = 'allowed';
    rules.mcp['research-nims'] = 'allowed';
    rules.mcp['sandbox-prototype'] = 'allowed';
    rules.mcp['suggest-edits'] = 'allowed';

    if (tier === 'T1_SAFE') {
      rules.actions.agentExec = 'needs_confirm';
    } else if (tier === 'T2_GUIDED') {
      rules.mcp['file-assistant'] = 'allowed';
      rules.mcp['git-command-center'] = 'needs_confirm';
      rules.mcp['database-assistant'] = 'needs_confirm';
      rules.mcp['multi-file-refactors'] = 'needs_confirm';
      rules.mcp['layout-rewrites'] = 'needs_confirm';
      rules.mcp['schema-changes'] = 'needs_confirm';
      rules.mcp['cross-module-rewiring'] = 'needs_confirm';

      rules.actions.fileWrite = 'allowed';
      rules.actions.fileDelete = 'needs_confirm';
      rules.actions.gitCommit = 'needs_confirm';
      rules.actions.dbMigrate = 'needs_confirm';
      rules.actions.agentExec = 'needs_confirm';
      rules.truth.minScoreForWrite = 0.7;
    } else if (tier === 'T3_POWER') {
      rules.mcp['file-assistant'] = 'allowed';
      rules.mcp['git-command-center'] = 'allowed';
      rules.mcp['database-assistant'] = 'admin_only';
      rules.mcp['multi-file-refactors'] = 'admin_only';
      rules.mcp['layout-rewrites'] = 'admin_only';
      rules.mcp['schema-changes'] = 'admin_only';
      rules.mcp['cross-module-rewiring'] = 'admin_only';
      rules.mcp['break-repo'] = 'admin_only';

      rules.actions.fileWrite = 'allowed';
      rules.actions.fileDelete = 'allowed';
      rules.actions.gitCommit = 'allowed';
      rules.actions.dbMigrate = 'admin_only';
      rules.actions.agentExec = 'admin_only';
      rules.truth.minScoreForWrite = 0.7;
      rules.truth.minScoreForSystemChange = 0.7;
    }
  }

  return rules;
}