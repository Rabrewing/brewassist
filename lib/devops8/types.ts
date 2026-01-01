// lib/devops8/types.ts

// Canonical DevOps 8 Signal Schema
// Defines the structured telemetry for DevOps 8 panes/tabs

export type DevOpsSignalStatus = 'optimal' | 'degraded' | 'stalled' | 'unknown';

export type DevOpsSignalId =
  | 'flow_integrity'
  | 'feedback_velocity'
  | 'learning_memory_integrity'
  | 'build_change_quality'
  | 'scope_containment'
  | 'safety_policy_enforcement'
  | 'reasoning_visibility'
  | 'execution_efficiency';

export interface DevOpsSignal {
  id: DevOpsSignalId;
  label: string;
  status: DevOpsSignalStatus;
  value: number; // 0-100 score
  source: string; // e.g., "execution_planner", "policy_gate"
  timestamp: string; // ISO string
  confidence: number; // 0.0 to 1.0
  notes: string; // short explanation

  // Admin-only debug metadata (stripped in Customer Mode)
  adminDebugInfo?: Record<string, any>;
}

export interface DevOps8Snapshot {
  signals: DevOpsSignal[];
  timestamp: string;
  version: string;
}
