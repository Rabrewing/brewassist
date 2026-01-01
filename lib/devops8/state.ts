// lib/devops8/state.ts
import type { DevOpsSignal, DevOpsSignalId } from './types';
import { DEVOPS_SIGNAL_REGISTRY, ViewerRole } from './registry';

// Define the aggregated DevOps 8 State object
export interface DevOps8State {
  flow_integrity: DevOpsSignal;
  feedback_velocity: DevOpsSignal;
  learning_memory_integrity: DevOpsSignal;
  build_change_quality: DevOpsSignal;
  scope_containment: DevOpsSignal;
  safety_policy_enforcement: DevOpsSignal;
  reasoning_visibility: DevOpsSignal;
  execution_efficiency: DevOpsSignal;
  timestamp: string;
  sources: string[]; // To track where the state was last updated from
}

// Internal state for DevOps8
let currentDevOps8State: DevOps8State | null = null;

/**
 * Computes and updates the aggregated DevOps 8 State.
 * This function pulls from real system sources via the DEVOPS_SIGNAL_REGISTRY.
 * @returns The newly computed DevOps8State.
 */
export async function computeDevOps8State(): Promise<DevOps8State> {
  const signalReadings: Partial<Record<DevOpsSignalId, DevOpsSignal>> = {};
  const sources: string[] = [];

  for (const signalId in DEVOPS_SIGNAL_REGISTRY) {
    const definition = DEVOPS_SIGNAL_REGISTRY[signalId as DevOpsSignalId];
    try {
      const reading = definition.compute(); // Compute is sync now
      signalReadings[signalId as DevOpsSignalId] = reading;
      sources.push(`Computed ${signalId}`);
    } catch (error) {
      console.error(`Error computing DevOps signal ${signalId}:`, error);
      signalReadings[signalId as DevOpsSignalId] = {
        id: signalId as DevOpsSignalId,
        label: 'Error',
        status: 'stalled',
        value: 0,
        source: 'error',
        timestamp: new Date().toISOString(),
        confidence: 0,
        notes: `Error computing signal: ${(error as Error).message}`,
      };
      sources.push(`Error computing ${signalId}`);
    }
  }

  currentDevOps8State = {
    flow_integrity: signalReadings.flow_integrity!,
    feedback_velocity: signalReadings.feedback_velocity!,
    learning_memory_integrity: signalReadings.learning_memory_integrity!,
    build_change_quality: signalReadings.build_change_quality!,
    scope_containment: signalReadings.scope_containment!,
    safety_policy_enforcement: signalReadings.safety_policy_enforcement!,
    reasoning_visibility: signalReadings.reasoning_visibility!,
    execution_efficiency: signalReadings.execution_efficiency!,
    timestamp: new Date().toISOString(),
    sources: sources,
  };

  return currentDevOps8State;
}

/**
 * Retrieves a specific DevOpsSignalReading from the current state.
 * @param id The ID of the signal to retrieve.
 * @returns The DevOpsSignalReading if found, otherwise null.
 */
export function getSignal(id: DevOpsSignalId): DevOpsSignal | null {
  if (!currentDevOps8State) {
    return null;
  }
  return currentDevOps8State[id] || null;
}

/**
 * Retrieves all DevOpsSignals from the current state.
 * @returns An array of all DevOpsSignals.
 */
export function getAllSignals(): DevOpsSignal[] {
  if (!currentDevOps8State) {
    return [];
  }
  return Object.values(DEVOPS_SIGNAL_REGISTRY).map(
    (def) => currentDevOps8State![def.id]
  );
}

/**
 * Retrieves DevOpsSignals relevant to a specific pane.
 * @param paneId The ID of the pane (e.g., "flow", "quality").
 * @returns An array of relevant DevOpsSignals.
 */
export function getSignalsForPane(paneId: string): DevOpsSignal[] {
  if (!currentDevOps8State) {
    return [];
  }
  return Object.values(DEVOPS_SIGNAL_REGISTRY)
    .filter((def) => def.defaultPane === paneId)
    .map((def) => currentDevOps8State![def.id]);
}

/**
 * Renders a DevOpsSignalReading for a specific role, redacting details based on visibility rules.
 * @param reading The DevOpsSignalReading to render.
 * @param role The ViewerRole (customer, admin, dev).
 * @returns A redacted DevOpsSignalReading suitable for the given role.
 */
export function renderSignalForRole(
  reading: DevOpsSignal,
  role: ViewerRole
): DevOpsSignal {
  const definition = DEVOPS_SIGNAL_REGISTRY[reading.id];
  if (!definition) {
    return { ...reading, notes: 'Unknown signal definition.' };
  }

  const visibility = definition.visibility[role];

  if (visibility === 'hidden') {
    return {
      id: reading.id,
      label: reading.label,
      status: 'unknown',
      value: 0,
      source: reading.source,
      timestamp: reading.timestamp,
      confidence: 0,
      notes: 'Hidden for this role.',
    };
  }

  if (visibility === 'summary') {
    // Only basic info visible, strip adminDebugInfo
    return {
      ...reading,
      adminDebugInfo: undefined,
    };
  }

  // "full" visibility
  return reading;
}

/**
 * Initializes the DevOps8State. Should be called once at application startup.
 */
export async function initializeDevOps8State(): Promise<void> {
  await computeDevOps8State();
  console.log('DevOps 8 State initialized.');
}

// Optionally, re-compute state periodically or on specific events
// For now, manual computation is assumed via computeDevOps8State()
