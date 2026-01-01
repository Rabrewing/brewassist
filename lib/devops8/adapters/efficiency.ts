// lib/devops8/adapters/efficiency.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface EfficiencyContext {
  planChurn?: number;
  repeatedToolCalls?: number;
  stepCount?: number;
  avgLatencyMs?: number;
  retries?: number;
}

export function computeExecutionEfficiency(
  context: EfficiencyContext = {}
): DevOpsSignal {
  const {
    planChurn = 0,
    repeatedToolCalls = 0,
    stepCount = 0,
    avgLatencyMs = 0,
    retries = 0,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Execution is highly efficient.';

  // Calculate efficiency score based on various factors
  let efficiencyScore = 100;

  if (retries > 0) {
    efficiencyScore -= retries * 10;
  }
  if (repeatedToolCalls > 0) {
    efficiencyScore -= repeatedToolCalls * 5;
  }
  if (planChurn > 2) {
    efficiencyScore -= (planChurn - 2) * 15;
  }
  if (avgLatencyMs > 5000) {
    efficiencyScore -= 20;
  }

  value = Math.max(0, efficiencyScore);

  if (value < 30) {
    status = 'stalled';
    confidence = 0.8;
    notes = 'Execution efficiency is critically low.';
  } else if (value < 60) {
    status = 'degraded';
    confidence = 0.7;
    notes = 'Execution efficiency is degraded.';
  } else if (value < 80) {
    status = 'degraded';
    confidence = 0.6;
    notes = 'Execution efficiency could be improved.';
  }

  return createNormalizedSignal(
    'execution_efficiency',
    DEVOPS_SIGNAL_DEFINITIONS.execution_efficiency.label,
    status,
    value,
    'execution_planner',
    confidence,
    notes,
    { planChurn, repeatedToolCalls, stepCount, avgLatencyMs, retries }
  );
}
