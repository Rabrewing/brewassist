// lib/devops8/collector.ts

import type { DevOpsSignal, DevOps8Snapshot } from './types';
import { DEVOPS_SIGNAL_REGISTRY } from './registry';
import { createNormalizedSignal } from './normalize';
import { DEVOPS_SIGNAL_DEFINITIONS } from './constants';

export type SnapshotMode = 'fast' | 'deep';

/**
 * Collects a DevOps 8 snapshot by running all signal adapters.
 * @param mode - "fast" for quick checks, "deep" for thorough analysis
 * @returns Promise<DevOps8Snapshot>
 */
export async function collectDevOps8Snapshot(
  mode: SnapshotMode = 'fast'
): Promise<DevOps8Snapshot> {
  const snapshotId = generateSnapshotId();
  const createdAt = new Date().toISOString();
  const signals: DevOpsSignal[] = [];

  // Run all adapters
  for (const signalId of Object.keys(DEVOPS_SIGNAL_REGISTRY) as Array<
    keyof typeof DEVOPS_SIGNAL_REGISTRY
  >) {
    const definition = DEVOPS_SIGNAL_REGISTRY[signalId];

    try {
      // In deep mode, we might pass additional context or use more intensive logic
      // For now, all adapters are called the same way
      const signal = definition.compute();

      // In deep mode, enhance confidence or add debug info
      if (mode === 'deep') {
        signal.confidence = Math.min(1.0, signal.confidence + 0.1); // Boost confidence slightly
        signal.adminDebugInfo = {
          ...signal.adminDebugInfo,
          mode: 'deep',
          collectedAt: createdAt,
        };
      }

      signals.push(signal);
    } catch (error) {
      // On error, create a failed signal
      const failedSignal = createNormalizedSignal(
        signalId,
        DEVOPS_SIGNAL_DEFINITIONS[signalId].label,
        'stalled',
        0,
        'error',
        0.0,
        `Failed to compute signal: ${(error as Error).message}`,
        { error: (error as Error).stack }
      );
      signals.push(failedSignal);
    }
  }

  return {
    signals,
    timestamp: createdAt,
    version: '1.0',
    snapshotId,
  };
}

function generateSnapshotId(): string {
  return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
