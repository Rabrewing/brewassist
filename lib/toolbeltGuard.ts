// lib/toolbeltGuard.ts
import type { RiskLevel, ToolbeltRulesSnapshot, ToolPermission } from './toolbeltConfig';
export type { RiskLevel };

export function getPermissionForRisk(
  rules: ToolbeltRulesSnapshot,
  risk: RiskLevel
): ToolPermission {
  switch (risk) {
    case 'read':
      return 'allowed';
    case 'write_single':
      return rules.actions.fileWrite;
    case 'write_multi':
      return rules.actions.fileWrite; // can specialize later
    case 'system':
      return rules.actions.dbMigrate;
    default:
      return 'blocked';
  }
}
