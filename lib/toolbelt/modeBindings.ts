import { ModeProfile } from '../mode/modeProfiles';

export interface ToolbeltSubset {
  availableTools: string[];
  tier: number;
  sandboxRequired: boolean;
}

export function bindModeToToolbelt(profile: ModeProfile): ToolbeltSubset {
  return {
    availableTools: profile.allowedTools,
    tier: profile.toolbeltTier,
    sandboxRequired: profile.sandboxPolicy === 'required',
  };
}
