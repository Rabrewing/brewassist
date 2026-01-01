// lib/devops8/normalize.ts

import type { DevOpsSignal, DevOpsSignalStatus } from './types';
import { SIGNAL_STATUS_LEVELS, CONFIDENCE_THRESHOLDS } from './constants';

// Normalization rules for DevOps signals
// Ensures consistent status mapping and value clamping

export function normalizeSignalStatus(rawStatus: string): DevOpsSignalStatus {
  const status = rawStatus.toLowerCase();
  if (status in SIGNAL_STATUS_LEVELS) {
    return status as DevOpsSignalStatus;
  }
  return 'unknown';
}

export function normalizeSignalValue(rawValue: number): number {
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, rawValue));
}

export function normalizeConfidence(rawConfidence: number): number {
  // Clamp to 0.0-1.0 range
  return Math.max(0.0, Math.min(1.0, rawConfidence));
}

export function normalizeSignal(signal: Partial<DevOpsSignal>): DevOpsSignal {
  if (!signal.id || !signal.label) {
    throw new Error('Signal must have id and label');
  }

  return {
    id: signal.id,
    label: signal.label,
    status: signal.status ? normalizeSignalStatus(signal.status) : 'unknown',
    value: signal.value !== undefined ? normalizeSignalValue(signal.value) : 0,
    source: signal.source || 'unknown',
    timestamp: signal.timestamp || new Date().toISOString(),
    confidence:
      signal.confidence !== undefined
        ? normalizeConfidence(signal.confidence)
        : CONFIDENCE_THRESHOLDS.low,
    notes: signal.notes || '',
    adminDebugInfo: signal.adminDebugInfo, // Keep as-is, will be stripped elsewhere
  };
}

// Utility to create a normalized signal from raw data
export function createNormalizedSignal(
  id: DevOpsSignal['id'],
  label: string,
  status: DevOpsSignalStatus,
  value: number,
  source: string,
  confidence: number,
  notes: string,
  adminDebugInfo?: Record<string, any>
): DevOpsSignal {
  return normalizeSignal({
    id,
    label,
    status,
    value,
    source,
    confidence,
    notes,
    adminDebugInfo,
  });
}
