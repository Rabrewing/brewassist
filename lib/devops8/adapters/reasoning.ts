// lib/devops8/adapters/reasoning.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';
import type { BrewTruthReport, BrewTruthDimension } from '@/lib/brewtruth';

interface ReasoningContext {
  brewTruthReport?: BrewTruthReport;
  recentChecks?: number;
  coverage?: number; // 0-1
}

export function computeReasoningVisibility(
  context: ReasoningContext = {}
): DevOpsSignal {
  const { brewTruthReport, recentChecks = 0, coverage = 1.0 } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = Math.round(coverage * 100);
  let confidence = 0.9;
  let notes = 'Reasoning process is fully visible with BrewTruth coverage.';

  if (brewTruthReport) {
    // Analyze BrewTruth report for visibility
    const scores = brewTruthReport.scores || [];
    const totalScores = scores.length;
    const highConfidenceScores = scores.filter((s) => s.score >= 0.7).length;

    if (totalScores > 0) {
      const coverageRatio = highConfidenceScores / totalScores;
      value = Math.round(coverageRatio * 100);

      if (coverageRatio < 0.5) {
        status = 'stalled';
        confidence = 0.7;
        notes = 'BrewTruth coverage is critically low.';
      } else if (coverageRatio < 0.8) {
        status = 'degraded';
        confidence = 0.8;
        notes = 'BrewTruth coverage is incomplete.';
      }

      // Check for missing dimensions
      const expectedDimensions: BrewTruthDimension[] = [
        'factuality',
        'relevance',
        'clarity',
        'safety',
        'structure',
      ];
      const presentDimensions = scores.map((s) => s.dim);
      const missingDimensions = expectedDimensions.filter(
        (dim) => !presentDimensions.includes(dim)
      );

      if (missingDimensions.length > 0) {
        status = 'degraded';
        confidence = Math.max(
          0.1,
          confidence - missingDimensions.length * 0.05
        );
        notes += ` Missing: ${missingDimensions.join(', ')}.`;
      }
    } else {
      // No scores
      status = 'stalled';
      value = 0;
      confidence = 0.3;
      notes = 'No BrewTruth scores available.';
    }

    // Overall score affects confidence
    confidence = Math.min(confidence, brewTruthReport.overallScore);

    // Check flags
    const hasFlags = brewTruthReport.flags && brewTruthReport.flags.length > 0;
    if (hasFlags) {
      status = 'degraded';
      confidence -= 0.1;
      notes += ` Flags: ${brewTruthReport.flags.join(', ')}.`;
    }
  } else {
    // Use coverage parameter when no report
    value = Math.round(coverage * 100);
    if (recentChecks === 0) {
      // No BrewTruth activity
      status = 'degraded';
      value = 30;
      confidence = 0.5;
      notes = 'No recent BrewTruth checks.';
    }
  }

  return createNormalizedSignal(
    'reasoning_visibility',
    DEVOPS_SIGNAL_DEFINITIONS.reasoning_visibility.label,
    status,
    value,
    'brew_truth',
    confidence,
    notes,
    { brewTruthReport, recentChecks, coverage }
  );
}
