// tests/devops8/types.test.ts

import {
  DevOpsSignal,
  DevOpsSignalId,
  DevOpsSignalStatus,
  DevOps8Snapshot,
} from '../../lib/devops8/types';
import {
  DEVOPS_SIGNAL_DEFINITIONS,
  SIGNAL_STATUS_LEVELS,
  CONFIDENCE_THRESHOLDS,
} from '../../lib/devops8/constants';
import {
  normalizeSignalStatus,
  normalizeSignalValue,
  normalizeConfidence,
  normalizeSignal,
  createNormalizedSignal,
} from '../../lib/devops8/normalize';

describe('DevOps 8 Types', () => {
  describe('DevOpsSignal interface', () => {
    test('should validate required fields', () => {
      const signal: DevOpsSignal = {
        id: 'flow_integrity',
        label: 'Flow Integrity',
        status: 'optimal',
        value: 85,
        source: 'execution_planner',
        timestamp: '2025-01-01T00:00:00Z',
        confidence: 0.9,
        notes: 'Flow is optimal',
      };

      expect(signal.id).toBe('flow_integrity');
      expect(signal.label).toBe('Flow Integrity');
      expect(signal.status).toBe('optimal');
      expect(signal.value).toBe(85);
      expect(signal.source).toBe('execution_planner');
      expect(signal.timestamp).toBe('2025-01-01T00:00:00Z');
      expect(signal.confidence).toBe(0.9);
      expect(signal.notes).toBe('Flow is optimal');
    });

    test('should allow optional adminDebugInfo', () => {
      const signal: DevOpsSignal = {
        id: 'flow_integrity',
        label: 'Flow Integrity',
        status: 'optimal',
        value: 85,
        source: 'execution_planner',
        timestamp: '2025-01-01T00:00:00Z',
        confidence: 0.9,
        notes: 'Flow is optimal',
        adminDebugInfo: { internalMetric: 42 },
      };

      expect(signal.adminDebugInfo).toEqual({ internalMetric: 42 });
    });
  });

  describe('DevOps8Snapshot interface', () => {
    test('should validate snapshot structure', () => {
      const snapshot: DevOps8Snapshot = {
        signals: [],
        timestamp: '2025-01-01T00:00:00Z',
        version: '1.0',
      };

      expect(snapshot.signals).toEqual([]);
      expect(snapshot.timestamp).toBe('2025-01-01T00:00:00Z');
      expect(snapshot.version).toBe('1.0');
    });
  });

  describe('Constants', () => {
    test('should have all 8 signal definitions', () => {
      expect(Object.keys(DEVOPS_SIGNAL_DEFINITIONS)).toHaveLength(8);
      expect(DEVOPS_SIGNAL_DEFINITIONS.flow_integrity.label).toBe(
        'Flow Integrity'
      );
      expect(DEVOPS_SIGNAL_DEFINITIONS.execution_efficiency.description).toBe(
        'How efficiently is work being executed?'
      );
    });

    test('should define status levels', () => {
      expect(SIGNAL_STATUS_LEVELS.optimal).toBe('optimal');
      expect(SIGNAL_STATUS_LEVELS.stalled).toBe('stalled');
    });

    test('should define confidence thresholds', () => {
      expect(CONFIDENCE_THRESHOLDS.high).toBe(0.8);
      expect(CONFIDENCE_THRESHOLDS.low).toBe(0.2);
    });
  });

  describe('Normalization', () => {
    test('normalizeSignalStatus should return valid status', () => {
      expect(normalizeSignalStatus('optimal')).toBe('optimal');
      expect(normalizeSignalStatus('INVALID')).toBe('unknown');
      expect(normalizeSignalStatus('Degraded')).toBe('degraded');
    });

    test('normalizeSignalValue should clamp to 0-100', () => {
      expect(normalizeSignalValue(50)).toBe(50);
      expect(normalizeSignalValue(-10)).toBe(0);
      expect(normalizeSignalValue(150)).toBe(100);
    });

    test('normalizeConfidence should clamp to 0.0-1.0', () => {
      expect(normalizeConfidence(0.5)).toBe(0.5);
      expect(normalizeConfidence(-0.1)).toBe(0.0);
      expect(normalizeConfidence(1.5)).toBe(1.0);
    });

    test('normalizeSignal should enforce required fields', () => {
      const rawSignal = {
        status: 'optimal' as DevOpsSignalStatus,
        value: 75,
        source: 'test',
        confidence: 0.8,
        notes: 'test',
      };

      expect(() => normalizeSignal(rawSignal)).toThrow(
        'Signal must have id and label'
      );
    });

    test('normalizeSignal should provide defaults for missing optional fields', () => {
      const rawSignal = {
        id: 'flow_integrity' as DevOpsSignalId,
        label: 'Flow Integrity',
      };

      const normalized = normalizeSignal(rawSignal);
      expect(normalized.status).toBe('unknown');
      expect(normalized.value).toBe(0);
      expect(normalized.source).toBe('unknown');
      expect(normalized.confidence).toBe(CONFIDENCE_THRESHOLDS.low);
      expect(normalized.notes).toBe('');
      expect(normalized.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    });

    test('createNormalizedSignal should create valid signal', () => {
      const signal = createNormalizedSignal(
        'flow_integrity',
        'Flow Integrity',
        'optimal',
        85,
        'execution_planner',
        0.9,
        'Flow is optimal',
        { debug: 'info' }
      );

      expect(signal.id).toBe('flow_integrity');
      expect(signal.status).toBe('optimal');
      expect(signal.value).toBe(85);
      expect(signal.adminDebugInfo).toEqual({ debug: 'info' });
    });
  });
});
