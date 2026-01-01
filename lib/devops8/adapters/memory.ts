// lib/devops8/adapters/memory.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface MemoryContext {
  brewLastWrites?: number;
  memorySkips?: number;
  permissionGatingBlocks?: number;
  conflicts?: number;
}

export function computeLearningMemoryIntegrity(
  context: MemoryContext = {}
): DevOpsSignal {
  const {
    brewLastWrites = 0,
    memorySkips = 0,
    permissionGatingBlocks = 0,
    conflicts = 0,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Memory operations are integral.';

  if (permissionGatingBlocks > 0) {
    status = 'stalled';
    value = 10;
    confidence = 0.8;
    notes = `Memory writes blocked by ${permissionGatingBlocks} permission gates.`;
  } else if (memorySkips > 0) {
    status = 'degraded';
    value = 50;
    confidence = 0.7;
    notes = `Memory writes were skipped ${memorySkips} times.`;
  } else if (conflicts > 0) {
    status = 'degraded';
    value = 60;
    confidence = 0.7;
    notes = `${conflicts} memory conflicts detected.`;
  } else if (brewLastWrites === 0) {
    status = 'degraded';
    value = 40;
    confidence = 0.6;
    notes = 'No BrewLast writes recorded.';
  }

  return createNormalizedSignal(
    'learning_memory_integrity',
    DEVOPS_SIGNAL_DEFINITIONS.learning_memory_integrity.label,
    status,
    value,
    'brew_last',
    confidence,
    notes,
    { brewLastWrites, memorySkips, permissionGatingBlocks, conflicts }
  );
}
