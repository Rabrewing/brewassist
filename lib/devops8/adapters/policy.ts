// lib/devops8/adapters/policy.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';
import { evaluateHandshake } from '@/lib/toolbelt/handshake';
import { CAPABILITY_REGISTRY } from '@/lib/capabilities/registry';

interface PolicyContext {
  tier?: string;
  cockpitMode?: 'admin' | 'customer';
  personaId?: string;
  recentHandshakes?: number;
  violations?: number;
}

export function computeSafetyPolicyEnforcement(
  context: PolicyContext = {}
): DevOpsSignal {
  const {
    tier = 'bronze',
    cockpitMode = 'customer',
    personaId = 'customer',
    recentHandshakes = 0,
    violations = 0,
  } = context;

  // Test handshake evaluation to determine enforcement status
  const testHandshake = evaluateHandshake({
    intent: 'ENGINEERING',
    tier: tier as any,
    cockpitMode,
    persona: {
      id: personaId as any,
      label: personaId,
      tone: 'neutral',
      emotionTier: 3,
      safetyMode: 'soft-stop',
      memoryWindow: 10,
      systemPrompt: '',
    },
  });

  const enforced = testHandshake.ok;
  const overridden =
    testHandshake.requiresConfirm === false && !testHandshake.ok; // Simplified
  const activeTier = testHandshake.tier;
  const sandboxAvailable = testHandshake.requiresSandbox !== true; // If not required, assume available

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Safety policies are being enforced correctly.';

  if (violations > 0) {
    status = 'stalled';
    value = Math.max(0, 100 - violations * 20);
    confidence = 0.8;
    notes = `${violations} policy violations detected.`;
  } else if (overridden) {
    status = 'degraded';
    value = 60;
    confidence = 0.7;
    notes = 'Policy has been overridden.';
  } else if (!enforced) {
    status = 'degraded';
    value = 40;
    confidence = 0.6;
    notes = 'Policy enforcement failed.';
  } else if (!sandboxAvailable && cockpitMode === 'admin') {
    status = 'degraded';
    value = 70;
    confidence = 0.5;
    notes = 'Sandbox not available for admin mode.';
  }

  // Count capabilities to determine scope
  const totalCapabilities = Object.keys(CAPABILITY_REGISTRY).length;
  const availableCapabilities = Object.values(CAPABILITY_REGISTRY).filter(
    (cap) => cap.personaAllowed.includes(personaId as any)
  ).length;

  value = Math.round((availableCapabilities / totalCapabilities) * 100);

  return createNormalizedSignal(
    'safety_policy_enforcement',
    DEVOPS_SIGNAL_DEFINITIONS.safety_policy_enforcement.label,
    status,
    value,
    'policy_gate',
    confidence,
    notes,
    {
      enforced,
      overridden,
      activeTier,
      sandboxAvailable,
      violations,
      totalCapabilities,
      availableCapabilities,
    }
  );
}
