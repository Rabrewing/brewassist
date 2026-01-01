// lib/devops8/adapters/quality.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface QualityContext {
  policyGateFailures?: number;
  brewTruthScore?: number; // 0-1
  testConfidence?: number; // 0-1
  schemaDiffsDetected?: boolean;
}

export function computeBuildChangeQuality(
  context: QualityContext = {}
): DevOpsSignal {
  const {
    policyGateFailures = 0,
    brewTruthScore = 1.0,
    testConfidence = 1.0,
    schemaDiffsDetected = false,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = Math.round(((brewTruthScore + testConfidence) / 2) * 100);
  let confidence = Math.min(brewTruthScore, testConfidence);
  let notes = 'Builds and changes are high-quality.';

  if (policyGateFailures > 0) {
    status = 'stalled';
    value = Math.max(0, value - 50);
    confidence = Math.min(confidence, 0.5);
    notes = `${policyGateFailures} policy gate failures detected.`;
  } else if (schemaDiffsDetected) {
    status = 'degraded';
    value = Math.max(0, value - 30);
    confidence = Math.min(confidence, 0.7);
    notes = 'Schema differences detected in builds.';
  } else if (brewTruthScore < 0.8 || testConfidence < 0.8) {
    status = 'degraded';
    confidence = Math.min(confidence, 0.6);
    notes = 'BrewTruth or test confidence below threshold.';
  }

  return createNormalizedSignal(
    'build_change_quality',
    DEVOPS_SIGNAL_DEFINITIONS.build_change_quality.label,
    status,
    value,
    'brew_truth',
    confidence,
    notes,
    { policyGateFailures, brewTruthScore, testConfidence, schemaDiffsDetected }
  );
}
