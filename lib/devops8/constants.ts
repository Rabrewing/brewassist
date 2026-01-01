// lib/devops8/constants.ts

import type { DevOpsSignalId } from './types';

// DevOps 8 Signal Definitions (constants for labels and descriptions)
export const DEVOPS_SIGNAL_DEFINITIONS: Record<
  DevOpsSignalId,
  { label: string; description: string }
> = {
  flow_integrity: {
    label: 'Flow Integrity',
    description: 'Is work flowing smoothly or stalling?',
  },
  feedback_velocity: {
    label: 'Feedback Velocity',
    description: 'How fast does the system respond to change?',
  },
  learning_memory_integrity: {
    label: 'Learning & Memory Integrity',
    description: 'Is the system learning safely and correctly?',
  },
  build_change_quality: {
    label: 'Build & Change Quality',
    description: 'Are builds and changes high-quality and reliable?',
  },
  scope_containment: {
    label: 'Scope Containment',
    description: 'Is work staying within defined boundaries?',
  },
  safety_policy_enforcement: {
    label: 'Safety Policy Enforcement',
    description: 'Are safety policies being enforced correctly?',
  },
  reasoning_visibility: {
    label: 'Reasoning Visibility',
    description: "How visible is the system's reasoning process?",
  },
  execution_efficiency: {
    label: 'Execution Efficiency',
    description: 'How efficiently is work being executed?',
  },
};

// Status levels for signals
export const SIGNAL_STATUS_LEVELS = {
  optimal: 'optimal',
  degraded: 'degraded',
  stalled: 'stalled',
  unknown: 'unknown',
} as const;

// Default confidence thresholds
export const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.5,
  low: 0.2,
};
