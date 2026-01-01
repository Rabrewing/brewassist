// lib/devops8/registry.ts

import type { DevOpsSignal, DevOpsSignalId } from './types';
import { DEVOPS_SIGNAL_DEFINITIONS } from './constants';
import { computeFlowIntegrity } from './adapters/flow';
import { computeFeedbackVelocity } from './adapters/feedback';
import { computeLearningMemoryIntegrity } from './adapters/memory';
import { computeBuildChangeQuality } from './adapters/quality';
import { computeScopeContainment } from './adapters/scope';
import { computeSafetyPolicyEnforcement } from './adapters/policy';
import { computeReasoningVisibility } from './adapters/reasoning';
import { computeExecutionEfficiency } from './adapters/efficiency';

// Personas/roles
export type ViewerRole = 'customer' | 'admin' | 'dev';

// Registry entry describes how to compute + render a signal
export interface DevOpsSignalDefinition {
  id: DevOpsSignalId;
  label: string;
  description: string;

  // compute contract: returns the latest signal
  compute: (context?: any) => DevOpsSignal;

  // role-based visibility + redaction
  visibility: {
    customer: 'hidden' | 'summary' | 'full';
    admin: 'summary' | 'full';
    dev: 'summary' | 'full';
  };

  // optional: map to panes
  defaultPane?:
    | 'flow'
    | 'quality'
    | 'policy'
    | 'memory'
    | 'reasoning'
    | 'efficiency';

  // severity rules (optional override)
  thresholds?: {
    warnBelowScore?: number;
    badBelowScore?: number;
  };
}

// Central registry shape
export type DevOpsSignalRegistry = Record<
  DevOpsSignalId,
  DevOpsSignalDefinition
>;

// Internal state for adapters (shared across adapters)
let _devOpsFlowState = {
  isStreaming: false,
  plannerChurnCount: 0,
  lastLatencyMs: 0,
  interruptions: 0,
};

let _devOpsFeedbackState = {
  chunkCount: 0,
  lastChunkTime: 0,
  feedbackGaps: 0,
};

let _devOpsMemoryState = {
  brewLastWrites: 0,
  memorySkips: 0,
  permissionGatingBlocks: 0,
  conflicts: 0,
};

let _devOpsQualityState = {
  policyGateFailures: 0,
  brewTruthScore: 1.0,
  testConfidence: 1.0,
  schemaDiffsDetected: false,
};

// Helper functions to update internal state
export function updateDevOpsFlowState(
  updates: Partial<typeof _devOpsFlowState>
) {
  _devOpsFlowState = { ..._devOpsFlowState, ...updates };
}

export function updateDevOpsFeedbackState(
  updates: Partial<typeof _devOpsFeedbackState>
) {
  _devOpsFeedbackState = { ..._devOpsFeedbackState, ...updates };
}

export function updateDevOpsMemoryState(
  updates: Partial<typeof _devOpsMemoryState>
) {
  _devOpsMemoryState = { ..._devOpsMemoryState, ...updates };
}

export function updateDevOpsQualityState(
  updates: Partial<typeof _devOpsQualityState>
) {
  _devOpsQualityState = { ..._devOpsQualityState, ...updates };
}

// Concrete registry instance using adapter pattern
export const DEVOPS_SIGNAL_REGISTRY: DevOpsSignalRegistry = {
  flow_integrity: {
    id: 'flow_integrity',
    label: DEVOPS_SIGNAL_DEFINITIONS.flow_integrity.label,
    description: DEVOPS_SIGNAL_DEFINITIONS.flow_integrity.description,
    compute: computeFlowIntegrity,
    visibility: {
      customer: 'summary',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'flow',
  },
  feedback_velocity: {
    id: 'feedback_velocity',
    label: DEVOPS_SIGNAL_DEFINITIONS.feedback_velocity.label,
    description: DEVOPS_SIGNAL_DEFINITIONS.feedback_velocity.description,
    compute: computeFeedbackVelocity,
    visibility: {
      customer: 'summary',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'flow',
  },
  learning_memory_integrity: {
    id: 'learning_memory_integrity',
    label: DEVOPS_SIGNAL_DEFINITIONS.learning_memory_integrity.label,
    description:
      DEVOPS_SIGNAL_DEFINITIONS.learning_memory_integrity.description,
    compute: computeLearningMemoryIntegrity,
    visibility: {
      customer: 'hidden',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'memory',
  },
  build_change_quality: {
    id: 'build_change_quality',
    label: DEVOPS_SIGNAL_DEFINITIONS.build_change_quality.label,
    description: DEVOPS_SIGNAL_DEFINITIONS.build_change_quality.description,
    compute: computeBuildChangeQuality,
    visibility: {
      customer: 'summary',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'quality',
  },
  scope_containment: {
    id: 'scope_containment',
    label: DEVOPS_SIGNAL_DEFINITIONS.scope_containment.label,
    description: DEVOPS_SIGNAL_DEFINITIONS.scope_containment.description,
    compute: computeScopeContainment,
    visibility: {
      customer: 'summary',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'policy',
  },
  safety_policy_enforcement: {
    id: 'safety_policy_enforcement',
    label: DEVOPS_SIGNAL_DEFINITIONS.safety_policy_enforcement.label,
    description:
      DEVOPS_SIGNAL_DEFINITIONS.safety_policy_enforcement.description,
    compute: computeSafetyPolicyEnforcement,
    visibility: {
      customer: 'summary',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'policy',
  },
  reasoning_visibility: {
    id: 'reasoning_visibility',
    label: DEVOPS_SIGNAL_DEFINITIONS.reasoning_visibility.label,
    description: DEVOPS_SIGNAL_DEFINITIONS.reasoning_visibility.description,
    compute: computeReasoningVisibility,
    visibility: {
      customer: 'hidden',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'reasoning',
  },
  execution_efficiency: {
    id: 'execution_efficiency',
    label: DEVOPS_SIGNAL_DEFINITIONS.execution_efficiency.label,
    description: DEVOPS_SIGNAL_DEFINITIONS.execution_efficiency.description,
    compute: computeExecutionEfficiency,
    visibility: {
      customer: 'summary',
      admin: 'full',
      dev: 'full',
    },
    defaultPane: 'efficiency',
  },
};

// Getter functions for internal states
export function getDevOpsFlowState() {
  return _devOpsFlowState;
}

export function getDevOpsFeedbackState() {
  return _devOpsFeedbackState;
}

export function getDevOpsMemoryState() {
  return _devOpsMemoryState;
}

export function getDevOpsQualityState() {
  return _devOpsQualityState;
}
