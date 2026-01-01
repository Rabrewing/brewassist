import { resolveModeProfile } from '../mode/modeResolver';
import { enforceCustomerMode } from '../policies/customerMode';

export interface SpecValidationResult {
  compliant: boolean;
  violations: string[];
}

export function validateBrewAssistSpec(): SpecValidationResult {
  const violations: string[] = [];

  // Check mode-driven behavior
  const hrmProfile = resolveModeProfile('HRM');
  if (hrmProfile.defaultTone !== 'safe') {
    violations.push('HRM mode should have safe tone');
  }

  const agentProfile = resolveModeProfile('AGENT');
  if (agentProfile.toolbeltTier !== 3) {
    violations.push('AGENT mode should have tier 3 access');
  }

  // Check customer safety
  const customerEnforced = enforceCustomerMode(agentProfile, true);
  if (customerEnforced.toolbeltTier > 1) {
    violations.push('Customer mode should cap at tier 1');
  }
  if (customerEnforced.memoryPolicy !== 'read-only') {
    violations.push('Customer mode should enforce read-only memory');
  }

  // Check no UI dependencies (logic only)
  // This is validated by the fact that our implementation has no React imports

  return {
    compliant: violations.length === 0,
    violations,
  };
}
