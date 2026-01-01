// lib/devops8/provider.ts

import type { DevOps8Snapshot } from './types';
import { collectDevOps8Snapshot } from './collector';

export interface SnapshotProviderOptions {
  mode: 'admin' | 'customer';
  tier?: string;
  sandbox?: boolean;
  deep?: boolean;
}

/**
 * Provides a filtered DevOps 8 snapshot for UI consumption.
 * Enforces mode-based visibility rules.
 */
export async function getDevOps8Snapshot(
  options: SnapshotProviderOptions
): Promise<DevOps8Snapshot> {
  const { mode, deep = false } = options;

  // Collect the raw snapshot
  const rawSnapshot = await collectDevOps8Snapshot(deep ? 'deep' : 'fast');

  // Filter signals based on mode
  const filteredSignals = rawSnapshot.signals.map((signal) => {
    const definition = DEVOPS_SIGNAL_REGISTRY[signal.id];

    if (!definition) {
      return signal;
    }

    // Check visibility
    const visibility = definition.visibility[mode];

    if (visibility === 'hidden') {
      // Return minimal signal
      return {
        id: signal.id,
        label: signal.label,
        status: 'unknown' as const,
        value: 0,
        source: signal.source,
        timestamp: signal.timestamp,
        confidence: 0,
        notes: 'Hidden for this mode.',
      };
    }

    if (visibility === 'summary') {
      // Strip admin debug info
      return {
        ...signal,
        adminDebugInfo: undefined,
      };
    }

    // "full" visibility - include everything
    return signal;
  });

  return {
    signals: filteredSignals,
    timestamp: rawSnapshot.timestamp,
    version: rawSnapshot.version,
    snapshotId: rawSnapshot.snapshotId,
  };
}

// Import here to avoid circular dependency
import { DEVOPS_SIGNAL_REGISTRY } from './registry';
