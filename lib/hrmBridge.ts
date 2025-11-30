// File: lib/hrmBridge.ts
// Phase: S4.6 Implementation
// Summary: JS ↔ Python bridge for HRM v3, handling task packets and response normalization.

import { logHRMRun } from './brewLastServer'; // Assuming logHRMRun is defined here

// Define types for HRM Task Packet and HRM Result
export type HRMTaskPacket = {
  personaId: string;
  emotionTier: number;
  goal: string;
  context: string[];
  projectRoot: string;
  sandboxRoot?: string;
  riskHint?: 'LOW' | 'MEDIUM' | 'HIGH';
};

export type HRMResult = {
  ok: boolean;
  plan: string[];
  explanations?: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  truthScore?: number;
  raw?: any;
};

/**
 * Builds an HRM task packet from current context.
 * @param goal The main goal for the HRM.
 * @param context The conversational context.
 * @param projectRoot The root directory of the project.
 * @param sandboxRoot Optional sandbox root directory.
 * @param riskHint Optional hint about the risk level.
 * @returns A structured HRMTaskPacket.
 */
export function buildHRMTaskPacket(
  goal: string,
  context: string[],
  projectRoot: string,
  sandboxRoot?: string,
  riskHint?: 'LOW' | 'MEDIUM' | 'HIGH'
): HRMTaskPacket {
  // Placeholder for getting active persona and emotion tier
  const personaId = 'rb'; // Replace with actual call to getActivePersona().id
  const emotionTier = 3; // Replace with actual call to getActivePersona().emotionTier

  return {
    personaId,
    emotionTier,
    goal,
    context,
    projectRoot,
    sandboxRoot,
    riskHint,
  };
}

import { updateHRMStatus } from './brewLastServer'; // path as appropriate

/**
 * Calls the Python HRM core with a given task packet.
 * @param taskPacket The HRMTaskPacket to send to the HRM.
 * @returns A promise that resolves to an HRMResult.
 */
export async function callHRM(taskPacket: HRMTaskPacket): Promise<HRMResult> {
  try {
    console.log('Calling HRM with task:', taskPacket);
    // TODO: Implement actual call to Python HRM (e.g., via child_process.spawn or HTTP)
    // For now, return a mock result
    const mockResult: HRMResult = {
      ok: true,
      plan: ['Mock Step 1', 'Mock Step 2'],
      explanations: ['This is a mock explanation.'],
      riskLevel: 'LOW',
      truthScore: 0.8,
      raw: { mock: 'data' },
    };

    await updateHRMStatus({
      enabled: true,
      model: 'hrm_chain_v2',
      lastOk: true,
      lastError: null,
      lastInputSummary: summarizeHRMInput(taskPacket),
      lastOutputSummary: summarizeHRMOutput(mockResult),
    });

    return mockResult;
  } catch (err) {
    await updateHRMStatus({
      enabled: true,
      model: 'hrm_chain_v2',
      lastOk: false,
      lastError:
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Unknown HRM error',
    });

    throw err;
  }
}

// Optional helpers:
function summarizeHRMInput(input: HRMTaskPacket): string {
  // Keep it short to avoid bloating .brewlast.json
  try {
    return input?.goal ?? '[no description]';
  } catch {
    return '[unavailable]';
  }
}

function summarizeHRMOutput(result: HRMResult): string {
  try {
    return result?.plan.join(', ') ?? '[no summary]';
  } catch {
    return '[unavailable]';
  }
}

/**
 * Normalizes the response from the HRM.
 * (This function might be integrated into callHRM or be a separate utility if needed)
 * @param rawResponse The raw response from the HRM.
 * @returns A normalized HRMResult.
 */
export function normalizeHRMResponse(rawResponse: any): HRMResult {
  // TODO: Implement actual normalization logic
  return rawResponse as HRMResult;
}
