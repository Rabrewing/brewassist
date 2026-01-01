// lib/devops8/adapters/flow.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface FlowContext {
  isStreaming?: boolean;
  plannerChurnCount?: number;
  lastLatencyMs?: number;
  interruptions?: number;
  currentStep?: number;
  totalSteps?: number;
  replans?: number;
}

export function computeFlowIntegrity(context: FlowContext = {}): DevOpsSignal {
  const {
    isStreaming = false,
    plannerChurnCount = 0,
    interruptions = 0,
    currentStep = 0,
    totalSteps = 1,
    replans = 0,
  } = context;

  const progress = totalSteps > 0 ? currentStep / totalSteps : 1;
  let value = Math.round(progress * 100);
  let confidence = 0.9;
  let notes = 'Work is flowing optimally.';

  let status: DevOpsSignal['status'] = 'optimal';

  if (interruptions > 0) {
    status = 'stalled';
    value = Math.max(0, value - 50);
    confidence = 0.8;
    notes = `Work flow stalled due to ${interruptions} interruptions.`;
  } else if (replans > 0) {
    status = 'degraded';
    value = Math.max(0, value - 20);
    confidence = 0.7;
    notes = `Planner replanned ${replans} times, flow may be degraded.`;
  } else if (plannerChurnCount > 2) {
    status = 'degraded';
    value = Math.max(0, value - 15);
    confidence = 0.7;
    notes = `Planner is churning (${plannerChurnCount} replans), flow may be degraded.`;
  } else if (!isStreaming) {
    status = 'degraded';
    value = Math.max(0, value - 10);
    confidence = 0.6;
    notes = 'Execution is in batch mode, not streaming.';
  }

  return createNormalizedSignal(
    'flow_integrity',
    DEVOPS_SIGNAL_DEFINITIONS.flow_integrity.label,
    status,
    value,
    'execution_planner',
    confidence,
    notes,
    {
      isStreaming,
      plannerChurnCount,
      interruptions,
      currentStep,
      totalSteps,
      replans,
    }
  );
}
