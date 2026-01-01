// tests/devops8/registry.test.ts

import { DEVOPS_SIGNAL_REGISTRY } from '../../lib/devops8/registry';
import type { DevOpsSignalId } from '../../lib/devops8/types';

describe('DevOps 8 Signal Registry', () => {
  test('should have all 8 signal definitions', () => {
    expect(Object.keys(DEVOPS_SIGNAL_REGISTRY)).toHaveLength(8);
    const expectedIds: DevOpsSignalId[] = [
      'flow_integrity',
      'feedback_velocity',
      'learning_memory_integrity',
      'build_change_quality',
      'scope_containment',
      'safety_policy_enforcement',
      'reasoning_visibility',
      'execution_efficiency',
    ];
    expectedIds.forEach((id) => {
      expect(DEVOPS_SIGNAL_REGISTRY[id]).toBeDefined();
      expect(DEVOPS_SIGNAL_REGISTRY[id].id).toBe(id);
    });
  });

  test('should have valid compute functions for all signals', () => {
    Object.values(DEVOPS_SIGNAL_REGISTRY).forEach((definition) => {
      expect(typeof definition.compute).toBe('function');
      const signal = definition.compute();
      expect(signal).toHaveProperty('id');
      expect(signal).toHaveProperty('label');
      expect(signal).toHaveProperty('status');
      expect(signal).toHaveProperty('value');
      expect(signal).toHaveProperty('source');
      expect(signal).toHaveProperty('timestamp');
      expect(signal).toHaveProperty('confidence');
      expect(signal).toHaveProperty('notes');
    });
  });

  test('should have stable signal IDs', () => {
    const registryIds = Object.keys(DEVOPS_SIGNAL_REGISTRY).sort();
    const expectedIds = [
      'build_change_quality',
      'execution_efficiency',
      'feedback_velocity',
      'flow_integrity',
      'learning_memory_integrity',
      'reasoning_visibility',
      'safety_policy_enforcement',
      'scope_containment',
    ].sort();
    expect(registryIds).toEqual(expectedIds);
  });

  test('should have valid visibility settings', () => {
    Object.values(DEVOPS_SIGNAL_REGISTRY).forEach((definition) => {
      const { visibility } = definition;
      expect(['hidden', 'summary', 'full']).toContain(visibility.customer);
      expect(['summary', 'full']).toContain(visibility.admin);
      expect(['summary', 'full']).toContain(visibility.dev);
    });
  });

  test('should have appropriate default panes', () => {
    const paneCounts: Record<string, number> = {};
    Object.values(DEVOPS_SIGNAL_REGISTRY).forEach((definition) => {
      if (definition.defaultPane) {
        paneCounts[definition.defaultPane] =
          (paneCounts[definition.defaultPane] || 0) + 1;
      }
    });

    expect(paneCounts.flow).toBeGreaterThan(0);
    expect(paneCounts.quality).toBeGreaterThan(0);
    expect(paneCounts.policy).toBeGreaterThan(0);
    expect(paneCounts.memory).toBeGreaterThan(0);
    expect(paneCounts.reasoning).toBeGreaterThan(0);
    expect(paneCounts.efficiency).toBeGreaterThan(0);
  });

  test('should compute signals with valid data', () => {
    const flowSignal = DEVOPS_SIGNAL_REGISTRY.flow_integrity.compute();
    expect(flowSignal.id).toBe('flow_integrity');
    expect(['optimal', 'degraded', 'stalled', 'unknown']).toContain(
      flowSignal.status
    );
    expect(flowSignal.value).toBeGreaterThanOrEqual(0);
    expect(flowSignal.value).toBeLessThanOrEqual(100);
    expect(flowSignal.confidence).toBeGreaterThanOrEqual(0);
    expect(flowSignal.confidence).toBeLessThanOrEqual(1);
    expect(flowSignal.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
  });
});
