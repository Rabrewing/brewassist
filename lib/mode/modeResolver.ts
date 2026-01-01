import {
  ModeProfile,
  getHRMProfile,
  getLLMProfile,
  getAgentProfile,
  getLoopProfile,
} from './modeProfiles';

export type { ModeProfile };

export function resolveModeProfile(
  mode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP'
): ModeProfile {
  switch (mode) {
    case 'HRM':
      return getHRMProfile();
    case 'LLM':
      return getLLMProfile();
    case 'AGENT':
      return getAgentProfile();
    case 'LOOP':
      return getLoopProfile();
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}
