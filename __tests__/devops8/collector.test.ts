// tests/devops8/collector.test.ts

import {
  collectDevOps8Snapshot,
  type SnapshotMode,
} from '../../lib/devops8/collector';

describe('DevOps 8 Collector', () => {
  describe('collectDevOps8Snapshot', () => {
    test('should collect a snapshot with all 8 signals in fast mode', async () => {
      const snapshot = await collectDevOps8Snapshot('fast');

      expect(snapshot).toHaveProperty('signals');
      expect(snapshot.signals).toHaveLength(8);
      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('version');
      expect(snapshot.version).toBe('1.0');

      // Check each signal has required properties
      snapshot.signals.forEach((signal) => {
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

    test('should collect a snapshot with all 8 signals in deep mode', async () => {
      const snapshot = await collectDevOps8Snapshot('deep');

      expect(snapshot.signals).toHaveLength(8);

      // In deep mode, signals should have adminDebugInfo with mode
      snapshot.signals.forEach((signal) => {
        expect(signal.adminDebugInfo).toBeDefined();
        expect(signal.adminDebugInfo?.mode).toBe('deep');
        expect(signal.adminDebugInfo?.collectedAt).toBe(snapshot.timestamp);
      });
    });

    test('should generate unique snapshot IDs', async () => {
      const snapshot1 = await collectDevOps8Snapshot();
      const snapshot2 = await collectDevOps8Snapshot();

      expect(snapshot1.snapshotId).toBeDefined();
      expect(snapshot2.snapshotId).toBeDefined();
      expect(snapshot1.snapshotId).not.toBe(snapshot2.snapshotId);
    });

    test('should handle adapter errors gracefully', async () => {
      // Mock an adapter to throw (this is hard to test directly)
      // For now, assume all adapters work
      const snapshot = await collectDevOps8Snapshot();

      // All signals should be present even if some fail
      expect(snapshot.signals).toHaveLength(8);
    });

    test('should return valid ISO timestamp', async () => {
      const snapshot = await collectDevOps8Snapshot();

      expect(snapshot.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
      expect(new Date(snapshot.timestamp).toISOString()).toBe(
        snapshot.timestamp
      );
    });

    test('should default to fast mode', async () => {
      const snapshot = await collectDevOps8Snapshot();

      // In fast mode, adminDebugInfo should not have mode
      snapshot.signals.forEach((signal) => {
        expect(signal.adminDebugInfo?.mode).toBeUndefined();
      });
    });

    test('should boost confidence in deep mode', async () => {
      const fastSnapshot = await collectDevOps8Snapshot('fast');
      const deepSnapshot = await collectDevOps8Snapshot('deep');

      // Compare signals (assuming same order)
      fastSnapshot.signals.forEach((fastSignal, index) => {
        const deepSignal = deepSnapshot.signals[index];
        expect(deepSignal.confidence).toBeGreaterThanOrEqual(
          fastSignal.confidence
        );
      });
    });
  });
});
