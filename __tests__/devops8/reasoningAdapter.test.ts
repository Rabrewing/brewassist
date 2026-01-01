// tests/devops8/reasoningAdapter.test.ts

import { computeReasoningVisibility } from '../../lib/devops8/adapters/reasoning';
import type { BrewTruthReport } from '../../lib/brewtruth';

describe('DevOps 8 Reasoning Adapter', () => {
  describe('computeReasoningVisibility', () => {
    test('should return optimal signal with full BrewTruth coverage', () => {
      const mockReport: Partial<BrewTruthReport> = {
        overallScore: 0.9,
        scores: [
          { dim: 'factuality', score: 0.95 },
          { dim: 'relevance', score: 0.92 },
          { dim: 'clarity', score: 0.88 },
          { dim: 'safety', score: 0.96 },
          { dim: 'structure', score: 0.9 },
        ],
        flags: [],
      };

      const signal = computeReasoningVisibility({
        brewTruthReport: mockReport as BrewTruthReport,
      });

      expect(signal.id).toBe('reasoning_visibility');
      expect(signal.status).toBe('optimal');
      expect(signal.value).toBe(100); // All scores >= 0.7
      expect(signal.confidence).toBe(0.9);
      expect(signal.notes).toContain('fully visible');
    });

    test('should detect incomplete coverage', () => {
      const mockReport: Partial<BrewTruthReport> = {
        overallScore: 0.6,
        scores: [
          { dim: 'factuality', score: 0.8 },
          { dim: 'safety', score: 0.3 }, // Low score
        ],
        flags: [],
      };

      const signal = computeReasoningVisibility({
        brewTruthReport: mockReport as BrewTruthReport,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.value).toBe(50); // 1/2 high confidence scores
      expect(signal.confidence).toBe(0.6);
    });

    test('should handle missing dimensions', () => {
      const mockReport: Partial<BrewTruthReport> = {
        overallScore: 0.8,
        scores: [
          { dim: 'factuality', score: 0.9 },
          { dim: 'safety', score: 0.85 },
        ],
        flags: [],
      };

      const signal = computeReasoningVisibility({
        brewTruthReport: mockReport as BrewTruthReport,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.confidence).toBeLessThan(0.8);
      expect(signal.notes).toContain('Missing:');
    });

    test('should handle flags', () => {
      const mockReport: Partial<BrewTruthReport> = {
        overallScore: 0.7,
        scores: [
          { dim: 'factuality', score: 0.8 },
          { dim: 'relevance', score: 0.75 },
        ],
        flags: ['low_confidence', 'speculative'],
      };

      const signal = computeReasoningVisibility({
        brewTruthReport: mockReport as BrewTruthReport,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.confidence).toBeLessThan(0.7);
      expect(signal.notes).toContain('Flags:');
    });

    test('should handle no recent BrewTruth checks', () => {
      const signal = computeReasoningVisibility({ recentChecks: 0 });

      expect(signal.status).toBe('degraded');
      expect(signal.value).toBe(30);
      expect(signal.notes).toContain('No recent BrewTruth checks');
    });

    test('should use coverage parameter', () => {
      const signal = computeReasoningVisibility({
        coverage: 0.75,
        recentChecks: 1,
      });

      expect(signal.value).toBe(75);
    });

    test('should handle empty BrewTruth report', () => {
      const mockReport: Partial<BrewTruthReport> = {
        overallScore: 0.5,
        scores: [],
        flags: [],
      };

      const signal = computeReasoningVisibility({
        brewTruthReport: mockReport as BrewTruthReport,
      });

      expect(signal.status).toBe('stalled');
      expect(signal.value).toBe(0);
    });
  });
});
