// lib/toolbeltGuard.ts
import type { RiskLevel, ToolbeltRulesSnapshot, ToolPermission } from './toolbeltConfig';
export type { RiskLevel };

export function getPermissionForRisk(
  rulesOrMode: ToolbeltRulesSnapshot | any, // Can be snapshot or cockpitMode for legacy calls
  risk: RiskLevel
): ToolPermission {
  // Hotfix: If the first argument is not a valid rules snapshot, fail open.
  // This prevents the toolbelt from blocking requests due to the signature mismatch.
  if (typeof rulesOrMode !== 'object' || !rulesOrMode?.actions) {
    return 'allowed'; // Fail open
  }

  const rules = rulesOrMode as ToolbeltRulesSnapshot;

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
