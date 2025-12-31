// lib/devops8/registry.ts

// DevOps 8 signal IDs (canonical)
export type DevOpsSignalId =
  | "flow_integrity"
  | "feedback_velocity"
  | "learning_memory_integrity"
  | "build_change_quality"
  | "scope_containment"
  | "safety_policy_enforcement"
  | "reasoning_visibility"
  | "execution_efficiency";

// Universal status levels
export type SignalLevel = "ok" | "warn" | "bad" | "off" | "unknown";

// Personas/roles
export type ViewerRole = "customer" | "admin" | "dev";

// A single signal measurement at a point in time
export interface DevOpsSignalReading {
  id: DevOpsSignalId;

  // overall state
  level: SignalLevel;
  score?: number; // 0-100 if applicable

  // short explanation safe for display
  summary: string; // <= 140 chars

  // richer details (role-gated at render time)
  details?: {
    reasons?: string[];        // bullet reasons
    metrics?: Record<string, number | string | boolean>;
    sources?: string[];        // e.g. ["execution_planner", "policy_gate"]
    relatedSignals?: DevOpsSignalId[];
    recommendedActionId?: string; // points to an action registry (optional)
  };

  // trace + audit
  meta: {
    ts: string;        // ISO timestamp
    sessionId?: string;
    runId?: string;
    buildId?: string;
    environment?: "local" | "preview" | "prod";
    confidence?: number; // 0-1
  };
}

// Registry entry describes how to compute + render a signal
export interface DevOpsSignalDefinition {
  id: DevOpsSignalId;
  label: string;
  description: string;

  // compute contract: returns the latest reading
  // (implementation can be sync or async depending on your architecture)
  compute: () => Promise<DevOpsSignalReading> | DevOpsSignalReading;

  // role-based visibility + redaction
  visibility: {
    customer: "hidden" | "summary" | "full";
    admin: "summary" | "full";
    dev: "summary" | "full";
  };

  // optional: map to panes
  defaultPane?: "flow" | "quality" | "policy" | "memory" | "reasoning" | "efficiency";

  // severity rules (optional override)
  thresholds?: {
    warnBelowScore?: number;
    badBelowScore?: number;
  };
}

// Central registry shape
export type DevOpsSignalRegistry = Record<DevOpsSignalId, DevOpsSignalDefinition>;

// Internal state for flow integrity simulation
let _devOpsFlowState = {
  isStreaming: false,
  plannerChurnCount: 0,
  lastLatencyMs: 0,
  interruptions: 0,
};

// Helper to update flow state (will be called from execution lifecycle hooks)
export function updateDevOpsFlowState(updates: Partial<typeof _devOpsFlowState>) {
  _devOpsFlowState = { ..._devOpsFlowState, ...updates };
}

// Internal state for feedback velocity simulation
let _devOpsFeedbackState = {
  chunkCount: 0,
  lastChunkTime: 0,
  feedbackGaps: 0, // Number of times a significant delay occurred between chunks
};

// Helper to update feedback state (will be called from execution lifecycle hooks)
export function updateDevOpsFeedbackState(updates: Partial<typeof _devOpsFeedbackState>) {
  _devOpsFeedbackState = { ..._devOpsFeedbackState, ...updates };
}

// Internal state for learning & memory integrity simulation
let _devOpsMemoryState = {
  brewLastWrites: 0,
  memorySkips: 0,
  permissionGatingBlocks: 0,
  conflicts: 0,
};

// Helper to update memory state (will be called from execution lifecycle hooks)
export function updateDevOpsMemoryState(updates: Partial<typeof _devOpsMemoryState>) {
  _devOpsMemoryState = { ..._devOpsMemoryState, ...updates };
}

// Internal state for build & change quality simulation
let _devOpsQualityState = {
  policyGateFailures: 0,
  brewTruthScore: 1.0, // 0-1, 1.0 is perfect
  testConfidence: 1.0, // 0-1, 1.0 is high confidence
  schemaDiffsDetected: false,
};

// Helper to update quality state (will be called from execution lifecycle hooks)
export function updateDevOpsQualityState(updates: Partial<typeof _devOpsQualityState>) {
  _devOpsQualityState = { ..._devOpsQualityState, ...updates };
}

// Getter functions for the internal states
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

// Concrete registry instance
export const DEVOPS_SIGNAL_REGISTRY: DevOpsSignalRegistry = {
  flow_integrity: {
    id: "flow_integrity",
    label: "Flow Integrity",
    description: "Is work flowing smoothly or stalling?",
    compute: () => {
      let level: SignalLevel = "ok";
      let summary = "Work is flowing optimally.";
      const reasons: string[] = [];
      const metrics: Record<string, number | string | boolean> = {};

      if (_devOpsFlowState.interruptions > 0) {
        level = "bad";
        summary = "Work flow stalled due to interruptions.";
        reasons.push(`Interruptions detected: ${_devOpsFlowState.interruptions}`);
      } else if (_devOpsFlowState.plannerChurnCount > 2) { // Arbitrary threshold for churn
        level = "warn";
        summary = "Planner is churning, flow may be degraded.";
        reasons.push(`Planner replans: ${_devOpsFlowState.plannerChurnCount}`);
      } else if (!_devOpsFlowState.isStreaming) {
        level = "warn";
        summary = "Execution is in batch mode, not streaming.";
        reasons.push("Streaming is not active.");
      }

      metrics.isStreaming = _devOpsFlowState.isStreaming;
      metrics.plannerChurnCount = _devOpsFlowState.plannerChurnCount;
      metrics.lastLatencyMs = _devOpsFlowState.lastLatencyMs;
      metrics.interruptions = _devOpsFlowState.interruptions;

      return {
        id: "flow_integrity",
        level,
        score: level === "ok" ? 100 : (level === "warn" ? 50 : 0), // Placeholder score
        summary,
        details: {
          reasons,
          metrics,
          sources: ["execution_planner", "streaming_engine"],
        },
        meta: { ts: new Date().toISOString() },
      };
    },
    visibility: {
      customer: "summary",
      admin: "full",
      dev: "full",
    },
    defaultPane: "flow",
  },
  feedback_velocity: {
    id: "feedback_velocity",
    label: "Feedback Velocity",
    description: "How fast does the system respond to change?",
    compute: () => {
      let level: SignalLevel = "ok";
      let summary = "Feedback is fast and incremental.";
      const reasons: string[] = [];
      const metrics: Record<string, number | string | boolean> = {};

      if (_devOpsFeedbackState.feedbackGaps > 0) {
        level = "warn";
        summary = "Feedback is delayed due to gaps.";
        reasons.push(`Feedback gaps detected: ${_devOpsFeedbackState.feedbackGaps}`);
      } else if (_devOpsFeedbackState.chunkCount === 0 && _devOpsFlowState.isStreaming) {
        level = "warn";
        summary = "Streaming is active but no chunks received yet.";
        reasons.push("No incremental outputs yet.");
      } else if (!_devOpsFlowState.isStreaming) {
        level = "warn";
        summary = "System is not streaming, feedback is not incremental.";
        reasons.push("Batch execution, no incremental feedback.");
      }

      metrics.chunkCount = _devOpsFeedbackState.chunkCount;
      metrics.lastChunkTime = _devOpsFeedbackState.lastChunkTime;
      metrics.feedbackGaps = _devOpsFeedbackState.feedbackGaps;
      metrics.isStreaming = _devOpsFlowState.isStreaming;

      return {
        id: "feedback_velocity",
        level,
        score: level === "ok" ? 100 : (level === "warn" ? 50 : 0), // Placeholder score
        summary,
        details: {
          reasons,
          metrics,
          sources: ["streaming_engine", "output_parser"],
        },
        meta: { ts: new Date().toISOString() },
      };
    },
    visibility: {
      customer: "summary",
      admin: "full",
      dev: "full",
    },
    defaultPane: "flow",
  },
  learning_memory_integrity: {
    id: "learning_memory_integrity",
    label: "Learning & Memory Integrity",
    description: "Is the system learning safely and correctly?",
    compute: () => {
      let level: SignalLevel = "ok";
      let summary = "Memory operations are integral.";
      const reasons: string[] = [];
      const metrics: Record<string, number | string | boolean> = {};

      if (_devOpsMemoryState.permissionGatingBlocks > 0) {
        level = "bad";
        summary = "Memory writes blocked by permission gating.";
        reasons.push(`Permission blocks: ${_devOpsMemoryState.permissionGatingBlocks}`);
      } else if (_devOpsMemoryState.memorySkips > 0) {
        level = "warn";
        summary = "Memory writes were skipped.";
        reasons.push(`Memory skips: ${_devOpsMemoryState.memorySkips}`);
      } else if (_devOpsMemoryState.conflicts > 0) {
        level = "warn";
        summary = "Memory conflicts detected.";
        reasons.push(`Conflicts: ${_devOpsMemoryState.conflicts}`);
      } else if (_devOpsMemoryState.brewLastWrites === 0) {
        level = "warn";
        summary = "No BrewLast writes recorded.";
        reasons.push("No recent memory writes.");
      }

      metrics.brewLastWrites = _devOpsMemoryState.brewLastWrites;
      metrics.memorySkips = _devOpsMemoryState.memorySkips;
      metrics.permissionGatingBlocks = _devOpsMemoryState.permissionGatingBlocks;
      metrics.conflicts = _devOpsMemoryState.conflicts;

      return {
        id: "learning_memory_integrity",
        level,
        score: level === "ok" ? 100 : (level === "warn" ? 50 : 0), // Placeholder score
        summary,
        details: {
          reasons,
          metrics,
          sources: ["brew_last", "identity_engine"],
        },
        meta: { ts: new Date().toISOString() },
      };
    },
    visibility: {
      customer: "hidden",
      admin: "full",
      dev: "full",
    },
    defaultPane: "memory",
  },
};