// lib/devops8/adapters/reasoning.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface ReasoningContext {
  visible?: boolean;
  partial?: boolean;
  confidenceMapping?: boolean;
  missingDimensions?: string[];
  chainOfThoughtAvailable?: boolean;
}

export function computeReasoningVisibility(
  context: ReasoningContext = {}
): DevOpsSignal {
  const {
    visible = true,
    partial = false,
    confidenceMapping = true,
    missingDimensions = [],
    chainOfThoughtAvailable = true,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Reasoning process is fully visible.';

  if (!visible) {
    status = 'stalled';
    value = 10;
    confidence = 0.8;
    notes = 'Reasoning visibility is disabled.';
  } else if (partial) {
    status = 'degraded';
    value = 60;
    confidence = 0.7;
    notes = 'Reasoning visibility is partial.';
  } else if (!confidenceMapping) {
    status = 'degraded';
    value = 70;
    confidence = 0.6;
    notes = 'Confidence mapping is missing.';
  } else if (missingDimensions.length > 0) {
    status = 'degraded';
    value = Math.max(50, 100 - missingDimensions.length * 10);
    confidence = 0.5;
    notes = `Missing dimensions: ${missingDimensions.join(', ')}.`;
  } else if (!chainOfThoughtAvailable) {
    status = 'degraded';
    value = 80;
    confidence = 0.6;
    notes = 'Chain of thought not available.';
  }

  return createNormalizedSignal(
    'reasoning_visibility',
    DEVOPS_SIGNAL_DEFINITIONS.reasoning_visibility.label,
    status,
    value,
    'brew_truth',
    confidence,
    notes,
    {
      visible,
      partial,
      confidenceMapping,
      missingDimensions,
      chainOfThoughtAvailable,
    }
  );
}
