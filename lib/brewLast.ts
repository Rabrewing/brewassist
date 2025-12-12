import type { BrewTruthReport } from './brewtruth';
import { readBrewLast, writeBrewLast } from './brewLastServer';

export interface BrewLastTask {
  id: string;
  type: string;
  description: string;
  createdAt: string; // ISO timestamp
  // Extend as needed for task-level UI or workflows
}

export type BrewLastToolRun = {
  id: string; // uuid or timestamp-based id
  tool: string; // "write_file" | "run_shell" | "git_status" | etc.
  args: any; // original args
  cwd: string; // directory where it ran
  timestamp: string; // ISO
  summary?: string; // short human description
  ok?: boolean; // success flag if available
  exitCode?: number;
  stdout?: string;
  stderr?: string;

  // BrewTruth attachment
  truthReview?: BrewTruthReport; // Changed from BrewTruthReview to BrewTruthReport

  // Sandbox context
  isSandbox?: boolean;
  sandboxRunId?: string;
};

export type BrewLastSandboxRun = {
  id: string;
  type: 'sandbox_run';
  runId: string; // s4-5-1764200303 style
  mode: 'maintenance' | 'upgrade' | 'debug';
  timestamp: string;
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  truthScore?: number;
  patchPath?: string; // path to generated patch (if any)
};

export type BrewLastSandboxBlock = {
    id: string;
    type: 'sandbox_block';
    mode: string;
    path: string;
    reason: string;
    at: string;
};

export type BrewLastPersonaEvent = {
  id: string;
  type: 'persona';
  personaId: string;
  mode: 'rb' | 'calm' | 'strict';
  timestamp: string;
  userPrompt: string;
  replySummary: string;
};

export type BrewLastIdentityEvent = {
  id: string;
  type: 'identity_event';
  event: string; // "emotion_shift" | "context_update" | "hrm_call" | etc.
  personaId: string;
  timestamp: string;
  details?: any;
};

export type BrewLastHRMRun = {
  id: string;
  type: 'hrm_run';
  personaId: string;
  emotionTier: number;
  steps: number; // number of steps in HRM plan
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  truthScore?: number;
  timestamp: string;
  summary: string;
  ok: boolean;
  raw?: any; // raw HRM response
};

export type HRMStatus = {
  enabled: boolean;
  model: string;
  lastRunAt: string | null;
  lastOk: boolean;
  lastError?: string | null;
  lastInputSummary?: string | null;
  lastOutputSummary?: string | null;
};

export type BrewLastState = {
  version: 1;
  projectRoot: string;
  lastUpdated: string;

  lastToolRun?: BrewLastToolRun;
  lastPersonaEvent?: BrewLastPersonaEvent;
  lastSandboxRun?: BrewLastSandboxRun;
  lastIdentityEvent?: BrewLastIdentityEvent;
  lastHRMRun?: BrewLastHRMRun;

  history?: Array<
    | BrewLastToolRun
    | BrewLastPersonaEvent
    | BrewLastSandboxRun
    | BrewLastSandboxBlock
    | BrewLastIdentityEvent
    | BrewLastHRMRun
  >;

  hrmStatus?: HRMStatus;
};

export const DEFAULT_BREWLAST: BrewLastState = {
  version: 1,
  projectRoot: '',
  lastUpdated: new Date().toISOString(),
};

export function summarizeToolRun(run: BrewLastToolRun): string {
  const time = run.timestamp ?? '';
  return `[${time}] ${run.tool} @ ${run.cwd}`;
}

export async function logSandboxBlocked(opts: {
    mode: string;
    path: string;
    reason: string;
  }) {
    // For now: console + BrewLast entry
    console.warn('[SANDBOX_BLOCKED]', opts);
  
    const current = await readBrewLast();
    const sandboxBlock: BrewLastSandboxBlock = {
      id: `${Date.now()}-sandbox-block`,
      type: 'sandbox_block',
      mode: opts.mode,
      path: opts.path,
      reason: opts.reason,
      at: new Date().toISOString(),
    };
    const history = [...(current.history ?? []), sandboxBlock].slice(-100); // cap history
  
    await writeBrewLast({
      history: history,
    });
  }