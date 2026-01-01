// tests/devops8/efficiencyAdapter.test.ts

import { computeExecutionEfficiency } from '../../lib/devops8/adapters/efficiency';

describe('DevOps 8 Efficiency Adapter', () => {
  describe('computeExecutionEfficiency', () => {
    test('should return optimal efficiency with low churn', () => {
      const signal = computeExecutionEfficiency({
        planChurn: 1,
        repeatedToolCalls: 0,
        retries: 0,
        avgLatencyMs: 1000,
      });

      expect(signal.id).toBe('execution_efficiency');
      expect(signal.status).toBe('optimal');
      expect(signal.value).toBe(100);
      expect(signal.notes).toContain('highly efficient');
    });

    test('should penalize for retries', () => {
      const signal = computeExecutionEfficiency({
        retries: 8,
      });

      expect(signal.status).toBe('stalled');
      expect(signal.value).toBe(20); // 100 - 8*10
      expect(signal.notes).toContain('efficiency is critically low');
    });

    test('should penalize for repeated tool calls', () => {
      const signal = computeExecutionEfficiency({
        repeatedToolCalls: 5,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.value).toBe(75); // 100 - 5*5 = 75
    });

    test('should penalize for high plan churn', () => {
      const signal = computeExecutionEfficiency({
        planChurn: 5,
      });

      expect(signal.status).toBe('degraded');
      expect(signal.value).toBe(55); // 100 - (5-2)*15
    });

    test('should penalize for high latency', () => {
      const signal = computeExecutionEfficiency({
        avgLatencyMs: 6000,
      });

      expect(signal.value).toBe(80); // 100 - 20
    });

    test('should handle combination of factors', () => {
      const signal = computeExecutionEfficiency({
        planChurn: 3,
        repeatedToolCalls: 2,
        retries: 1,
        avgLatencyMs: 3000,
      });

      expect(signal.value).toBeLessThan(100);
      expect(signal.value).toBeGreaterThan(0);
      // 100 - 1*10 - 2*5 - (3-2)*15 - 0 (latency <5000) = 100 -10 -10 -15 = 65
      expect(signal.value).toBe(65);
    });

    test('should include debug info', () => {
      const signal = computeExecutionEfficiency({
        planChurn: 2,
        repeatedToolCalls: 1,
        stepCount: 10,
        avgLatencyMs: 2000,
        retries: 0,
      });

      expect(signal.adminDebugInfo).toEqual({
        planChurn: 2,
        repeatedToolCalls: 1,
        stepCount: 10,
        avgLatencyMs: 2000,
        retries: 0,
      });
    });

    test('should default to optimal', () => {
      const signal = computeExecutionEfficiency({});

      expect(signal.status).toBe('optimal');
      expect(signal.value).toBe(100);
    });
  });
});
