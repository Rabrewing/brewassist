// lib/devops8/adapters/flow.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface FlowContext {
  isStreaming?: boolean;
  plannerChurnCount?: number;
  lastLatencyMs?: number;
  interruptions?: number;
}

export function computeFlowIntegrity(context: FlowContext = {}): DevOpsSignal {
  const {
    isStreaming = false,
    plannerChurnCount = 0,
    interruptions = 0,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Work is flowing optimally.';

  if (interruptions > 0) {
    status = 'stalled';
    value = 20;
    confidence = 0.8;
    notes = `Work flow stalled due to ${interruptions} interruptions.`;
  } else if (plannerChurnCount > 2) {
    status = 'degraded';
    value = 60;
    confidence = 0.7;
    notes = `Planner is churning (${plannerChurnCount} replans), flow may be degraded.`;
  } else if (!isStreaming) {
    status = 'degraded';
    value = 70;
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
    { isStreaming, plannerChurnCount, interruptions }
  );
}
