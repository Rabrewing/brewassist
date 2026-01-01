// tests/devops8/flowAdapter.test.ts

import { computeFlowIntegrity } from '../../lib/devops8/adapters/flow';

describe('DevOps 8 Flow Adapter', () => {
  describe('computeFlowIntegrity', () => {
    test('should return optimal signal for streaming execution', () => {
      const signal = computeFlowIntegrity({
        isStreaming: true,
        plannerChurnCount: 0,
        interruptions: 0,
        currentStep: 5,
        totalSteps: 10,
      });

      expect(signal.id).toBe('flow_integrity');
      expect(signal.status).toBe('optimal');
      expect(signal.value).toBe(50); // 5/10 progress
      expect(signal.notes).toBe('Work is flowing optimally.');
    });

    test('should detect interruptions', () => {
      const signal = computeFlowIntegrity({
        interruptions: 2,
      });

      expect(signal.status).toBe('stalled');
      expect(signal.value).toBeLessThan(50);
      expect(signal.notes).toContain('2 interruptions');
    });

    test('should handle planner replans', () => {
      const signal = computeFlowIntegrity({
        replans: 3,
        currentStep: 8,
        totalSteps: 10,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.value).toBe(60); // 80 - 20
      expect(signal.notes).toContain('replanned 3 times');
    });

    test('should penalize batch execution', () => {
      const signal = computeFlowIntegrity({
        isStreaming: false,
        currentStep: 1,
        totalSteps: 1,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.value).toBe(90); // 100 - 10
      expect(signal.notes).toContain('batch mode');
    });

    test('should calculate progress correctly', () => {
      const signal = computeFlowIntegrity({
        isStreaming: true,
        currentStep: 3,
        totalSteps: 5,
      });

      expect(signal.value).toBe(60); // 3/5 = 60%
    });

    test('should handle zero total steps', () => {
      const signal = computeFlowIntegrity({
        isStreaming: true,
        totalSteps: 0,
      });

      expect(signal.value).toBe(100); // Defaults to 100%
    });

    test('should include debug info', () => {
      const signal = computeFlowIntegrity({
        isStreaming: true,
        plannerChurnCount: 1,
        interruptions: 0,
        currentStep: 2,
        totalSteps: 4,
        replans: 1,
      });

      expect(signal.adminDebugInfo).toEqual({
        isStreaming: true,
        plannerChurnCount: 1,
        interruptions: 0,
        currentStep: 2,
        totalSteps: 4,
        replans: 1,
      });
    });
  });
});
