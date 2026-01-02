import { SupportTrace } from './types';

export type TriageResult =
  | 'DAILY_RESOLVABLE'
  | 'SANDBOX_MAINTENANCE_CANDIDATE'
  | 'PHASE_RELEASE_CANDIDATE'
  | 'RISK_BLOCKER';

export interface TriagedSupportTrace extends SupportTrace {
  triageResult: TriageResult;
  confidence: number;
}

export function triageSupportTrace(
  trace: SupportTrace
): TriagedSupportTrace | null {
  const triageResult = determineTriage(trace);
  if (!triageResult) return null; // If no match or below threshold

  const confidence = calculateConfidence(trace);
  if (confidence < 0.6) return null; // Confidence threshold

  const triaged: TriagedSupportTrace = {
    ...trace,
    triageResult,
    confidence,
  };

  return triaged;
}

function determineTriage(trace: SupportTrace): TriageResult | null {
  // Rule-based triage - exactly one category
  if (trace.brewTruthScore < 0.3) {
    return 'RISK_BLOCKER';
  }

  if (trace.activeMode === 'LOOP' && trace.flags.includes('loop_mode')) {
    return 'SANDBOX_MAINTENANCE_CANDIDATE';
  }

  if (trace.input.includes('bug') || trace.input.includes('error')) {
    return 'DAILY_RESOLVABLE';
  }

  if (trace.capabilityIds.length > 5) {
    return 'PHASE_RELEASE_CANDIDATE';
  }

  // If no clear match, don't triage
  return null;
}

function calculateConfidence(trace: SupportTrace): number {
  // Deterministic confidence based on trace quality
  let score = 0.5;

  if (trace.brewTruthScore > 0.8) score += 0.3;
  if (trace.capabilityIds.length > 0) score += 0.1;
  if (trace.response.length > 50) score += 0.1;
  if (trace.activeMode === 'AGENT') score += 0.1;

  return Math.min(score, 1.0);
}
