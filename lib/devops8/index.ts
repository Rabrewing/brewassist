// lib/devops8/index.ts

// Types
export type {
  DevOpsSignal,
  DevOpsSignalId,
  DevOpsSignalStatus,
  DevOps8Snapshot,
} from './types';

// Constants
export {
  DEVOPS_SIGNAL_DEFINITIONS,
  SIGNAL_STATUS_LEVELS,
  CONFIDENCE_THRESHOLDS,
} from './constants';

// Normalization
export {
  normalizeSignalStatus,
  normalizeSignalValue,
  normalizeConfidence,
  normalizeSignal,
  createNormalizedSignal,
} from './normalize';

// Registry
export {
  DEVOPS_SIGNAL_REGISTRY,
  updateDevOpsFlowState,
  updateDevOpsFeedbackState,
  updateDevOpsMemoryState,
  updateDevOpsQualityState,
  getDevOpsFlowState,
  getDevOpsFeedbackState,
  getDevOpsMemoryState,
  getDevOpsQualityState,
} from './registry';
export type {
  DevOpsSignalDefinition,
  DevOpsSignalRegistry,
  ViewerRole,
} from './registry';

// State management
export {
  computeDevOps8State,
  getSignal,
  getAllSignals,
  getSignalsForPane,
  renderSignalForRole,
  initializeDevOps8State,
} from './state';
export type { DevOps8State } from './state';

// Collector
export { collectDevOps8Snapshot } from './collector';
export type { SnapshotMode } from './collector';
