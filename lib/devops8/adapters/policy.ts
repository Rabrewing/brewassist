// lib/devops8/adapters/policy.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface PolicyContext {
  enforced?: boolean;
  overridden?: boolean;
  activeTier?: string;
  sandboxAvailable?: boolean;
  policyViolations?: number;
}

export function computeSafetyPolicyEnforcement(
  context: PolicyContext = {}
): DevOpsSignal {
  const {
    enforced = true,
    overridden = false,
    activeTier = 'unknown',
    sandboxAvailable = false,
    policyViolations = 0,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Safety policies are being enforced correctly.';

  if (policyViolations > 0) {
    status = 'stalled';
    value = 20;
    confidence = 0.8;
    notes = `${policyViolations} policy violations detected.`;
  } else if (overridden) {
    status = 'degraded';
    value = 50;
    confidence = 0.7;
    notes = 'Policy has been overridden.';
  } else if (!enforced) {
    status = 'degraded';
    value = 30;
    confidence = 0.6;
    notes = 'Policy enforcement is disabled.';
  } else if (!sandboxAvailable && activeTier !== 'customer') {
    status = 'degraded';
    value = 70;
    confidence = 0.5;
    notes = 'Sandbox not available for current tier.';
  }

  return createNormalizedSignal(
    'safety_policy_enforcement',
    DEVOPS_SIGNAL_DEFINITIONS.safety_policy_enforcement.label,
    status,
    value,
    'policy_gate',
    confidence,
    notes,
    { enforced, overridden, activeTier, sandboxAvailable, policyViolations }
  );
}
