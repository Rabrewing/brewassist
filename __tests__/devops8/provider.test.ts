// tests/devops8/provider.test.ts

import { getDevOps8Snapshot } from '../../lib/devops8/provider';

describe('DevOps 8 Provider', () => {
  describe('getDevOps8Snapshot', () => {
    test('should return snapshot for admin mode with full visibility', async () => {
      const snapshot = await getDevOps8Snapshot({ mode: 'admin' });

      expect(snapshot).toHaveProperty('signals');
      expect(snapshot.signals).toHaveLength(8);
      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('version');
      expect(snapshot).toHaveProperty('snapshotId');

      // Admin should see full signals
      snapshot.signals.forEach((signal) => {
        expect(signal).toHaveProperty('adminDebugInfo');
      });
    });

    test('should filter signals for customer mode', async () => {
      const snapshot = await getDevOps8Snapshot({ mode: 'customer' });

      expect(snapshot.signals).toHaveLength(8);

      // Customer should not see admin debug info
      snapshot.signals.forEach((signal) => {
        if (signal.notes !== 'Hidden for this mode.') {
          expect(signal.adminDebugInfo).toBeUndefined();
        }
      });
    });

    test('should hide sensitive signals in customer mode', async () => {
      const snapshot = await getDevOps8Snapshot({ mode: 'customer' });

      // Find learning_memory_integrity (should be hidden)
      const memorySignal = snapshot.signals.find(
        (s) => s.id === 'learning_memory_integrity'
      );
      expect(memorySignal).toBeDefined();
      expect(memorySignal?.status).toBe('unknown');
      expect(memorySignal?.notes).toBe('Hidden for this mode.');
      expect(memorySignal?.value).toBe(0);
    });

    test('should support deep mode', async () => {
      const snapshot = await getDevOps8Snapshot({ mode: 'admin', deep: true });

      expect(snapshot.signals).toHaveLength(8);
      // Deep mode should include enhanced debug info
      snapshot.signals.forEach((signal) => {
        expect(signal.adminDebugInfo).toBeDefined();
        expect(signal.adminDebugInfo?.mode).toBe('deep');
      });
    });

    test('should default to fast mode', async () => {
      const snapshot = await getDevOps8Snapshot({ mode: 'admin' });

      // Should not have deep mode markers
      snapshot.signals.forEach((signal) => {
        expect(signal.adminDebugInfo?.mode).toBeUndefined();
      });
    });

    test('should accept tier and sandbox options', async () => {
      // These are passed but not used in current implementation
      const snapshot = await getDevOps8Snapshot({
        mode: 'admin',
        tier: 'gold',
        sandbox: true,
      });

      expect(snapshot.signals).toHaveLength(8);
    });

    test('should generate valid snapshot ID', async () => {
      const snapshot1 = await getDevOps8Snapshot({ mode: 'admin' });
      const snapshot2 = await getDevOps8Snapshot({ mode: 'admin' });

      expect(snapshot1.snapshotId).toMatch(/^snapshot_\d+_/);
      expect(snapshot2.snapshotId).toMatch(/^snapshot_\d+_/);
      expect(snapshot1.snapshotId).not.toBe(snapshot2.snapshotId);
    });
  });
});
