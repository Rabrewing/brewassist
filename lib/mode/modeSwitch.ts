import { ModeProfile, resolveModeProfile } from '../mode/modeResolver';
import { enforceCustomerMode } from '../policies/customerMode';

export interface ModeSwitchRequest {
  fromMode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP';
  toMode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP';
  confirmation: boolean;
  isCustomer: boolean;
}

export interface ModeSwitchResult {
  success: boolean;
  newProfile?: ModeProfile;
  error?: string;
}

export function switchMode(request: ModeSwitchRequest): ModeSwitchResult {
  if (!request.confirmation) {
    return {
      success: false,
      error: 'Mode switch requires explicit confirmation',
    };
  }

  try {
    const newProfile = resolveModeProfile(request.toMode);
    const enforcedProfile = enforceCustomerMode(newProfile, request.isCustomer);

    return { success: true, newProfile: enforcedProfile };
  } catch (error) {
    return {
      success: false,
      error: `Failed to switch mode: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
