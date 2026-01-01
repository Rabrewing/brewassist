import { ModeProfile } from '../mode/modeProfiles';
import { ToolbeltSubset } from '../toolbelt/modeBindings';

export interface CustomerGuardbands {
  maxTier: 1;
  readOnlyMemory: boolean;
  noSilentEscalation: boolean;
  noToolAutoExecution: boolean;
}

export function enforceCustomerMode(
  profile: ModeProfile,
  isCustomer: boolean
): ModeProfile {
  if (!isCustomer) return profile;

  return {
    ...profile,
    toolbeltTier: Math.min(profile.toolbeltTier, 1) as 1 | 2 | 3,
    memoryPolicy: 'read-only',
    allowedTools: profile.allowedTools.filter(
      (tool) => !['edit', 'write', 'bash', 'task'].includes(tool)
    ),
  };
}

export function checkCustomerSafety(
  profile: ModeProfile,
  isCustomer: boolean
): boolean {
  if (!isCustomer) return true;

  const enforced = enforceCustomerMode(profile, true);
  return (
    enforced.toolbeltTier <= 1 &&
    enforced.memoryPolicy === 'read-only' &&
    !enforced.allowedTools.some((tool) =>
      ['edit', 'write', 'bash', 'task'].includes(tool)
    )
  );
}
