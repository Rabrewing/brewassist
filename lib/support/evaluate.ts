import { SupportTrace, SupportEvaluation } from './types';

export function evaluateSupportTrace(trace: SupportTrace): SupportEvaluation {
  const trustScore = calculateTrustScore(trace);
  const riskTier = determineRiskTier(trustScore);
  const confidenceDelta = calculateConfidenceDelta(trace);
  const flags = generateFlags(trace);

  return {
    trustScore,
    riskTier,
    confidenceDelta,
    flags,
  };
}

function calculateTrustScore(trace: SupportTrace): number {
  // Base on brewTruthScore, response quality, etc.
  let score = trace.brewTruthScore;

  // Adjust based on response length (assuming longer is better, but not always)
  const responseLength = trace.response.length;
  if (responseLength > 100) score += 0.1;
  else if (responseLength < 20) score -= 0.1;

  // Adjust based on activeMode reliability
  const modeMultipliers = {
    LLM: 1.0,
    HRM: 0.9,
    AGENT: 1.1,
    LOOP: 0.8,
  };
  score *= modeMultipliers[trace.activeMode];

  // Ensure bounds
  return Math.max(0, Math.min(1, score));
}

function determineRiskTier(trustScore: number): 'low' | 'medium' | 'high' {
  if (trustScore > 0.8) return 'low';
  if (trustScore > 0.5) return 'medium';
  return 'high';
}

function calculateConfidenceDelta(trace: SupportTrace): number {
  // Simple delta based on brewTruthScore vs expected
  const expectedScore = 0.7; // Baseline
  return trace.brewTruthScore - expectedScore;
}

function generateFlags(trace: SupportTrace): string[] {
  const flags: string[] = [];

  if (trace.brewTruthScore < 0.5) flags.push('low_truth_score');
  if (trace.response.includes('[REDACTED]')) flags.push('pii_detected');
  if (trace.capabilityIds.length === 0) flags.push('no_capabilities');
  if (trace.activeMode === 'LOOP') flags.push('loop_mode');

  return flags;
}
