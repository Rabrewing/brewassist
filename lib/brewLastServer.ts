// lib/brewLastServer.ts
import fs from 'fs';
import path from 'path';
import {
  BrewLastState,
  DEFAULT_BREWLAST,
  BrewLastToolRun,
  BrewLastPersonaEvent,
  BrewLastSandboxRun,
  BrewLastIdentityEvent,
  BrewLastHRMRun,
} from './brewLast';

function getBrewLastPath() {
  const root = process.env.BREW_PROJECT_ROOT || process.cwd();
  return path.join(root, '.brewlast.json');
}

export async function readBrewLast(): Promise<BrewLastState> {
  const file = getBrewLastPath();
  if (!fs.existsSync(file)) {
    return {
      ...DEFAULT_BREWLAST,
      projectRoot: path.dirname(file),
      history: [], // Ensure history is always initialized
    };
  }

  try {
    const raw = await fs.promises.readFile(file, 'utf8');
    if (raw.trim() === '') {
      return {
        ...DEFAULT_BREWLAST,
        projectRoot: path.dirname(file),
        history: [], // Ensure history is always initialized
      };
    }
    const json = JSON.parse(raw);
    return {
      ...DEFAULT_BREWLAST,
      ...json,
      history: json.history ?? [], // Ensure history is always present
    };
  } catch (err) {
    console.error('Failed to read or parse .brewlast.json:', err);
    return {
      ...DEFAULT_BREWLAST,
      projectRoot: path.dirname(file),
      history: [], // Ensure history is always initialized
    };
  }
}

export async function writeBrewLast(update: Partial<BrewLastState>) {
  const file = getBrewLastPath();
  const current = await readBrewLast();
  const next: BrewLastState = {
    ...current,
    ...update,
    lastUpdated: new Date().toISOString(),
  };

  await fs.promises.writeFile(file, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export async function logToolRun(run: BrewLastToolRun) {
  const current = await readBrewLast();
  const history = current.history ?? [];
  const nextHistory = [...history, run].slice(-50); // cap at last 50

  return writeBrewLast({
    lastToolRun: run,
    history: nextHistory,
  });
}

export async function logPersonaEvent(event: {
  personaId: string;
  mode: 'rb' | 'calm' | 'strict';
  userPrompt: string;
  reply: string;
}) {
  const now = new Date().toISOString();
  const id = `${Date.now()}-persona-${event.personaId}`;

  const current = await readBrewLast();

  const personaEvent: BrewLastPersonaEvent = {
    id,
    type: 'persona',
    personaId: event.personaId,
    mode: event.mode,
    timestamp: now,
    userPrompt: event.userPrompt,
    replySummary: event.reply.slice(0, 240),
  };

  const history = [...(current.history ?? []), personaEvent].slice(-100); // cap history

  return writeBrewLast({
    lastPersonaEvent: personaEvent,
    history,
  });
}

export async function logSandboxRun(meta: {
  runId: string;
  type: 'maintenance' | 'upgrade' | 'debug';
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  truthScore?: number;
  patchPath?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  const id = `${Date.now()}-sandbox-${meta.runId}`;

  const current = await readBrewLast();

  const sandboxRun: BrewLastSandboxRun = {
    id,
    type: 'sandbox_run',
    runId: meta.runId,
    mode: meta.type,
    timestamp: now,
    summary: meta.summary,
    riskLevel: meta.riskLevel,
    truthScore: meta.truthScore,
    patchPath: meta.patchPath,
  };

  const history = [...(current.history ?? []), sandboxRun].slice(-100); // cap history

  await writeBrewLast({
    lastSandboxRun: sandboxRun,
    history: history,
  });
}

export async function logIdentityEvent(event: {
  event: string;
  personaId: string;
  details?: any;
}): Promise<void> {
  const now = new Date().toISOString();
  const id = `${Date.now()}-identity-${event.event}`;

  const current = await readBrewLast();

  const identityEvent: BrewLastIdentityEvent = {
    id,
    type: 'identity_event',
    event: event.event,
    personaId: event.personaId,
    timestamp: now,
    details: event.details,
  };

  const history = [...(current.history ?? []), identityEvent].slice(-100);

  await writeBrewLast({
    lastIdentityEvent: identityEvent,
    history: history,
  });
}

export async function logHRMRun(run: {
  personaId: string;
  emotionTier: number;
  steps: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  truthScore?: number;
  summary: string;
  ok: boolean;
  raw?: any;
}): Promise<void> {
  const now = new Date().toISOString();
  const id = `${Date.now()}-hrm-${run.personaId}`;

  const current = await readBrewLast();

  const hrmRun: BrewLastHRMRun = {
    id,
    type: 'hrm_run',
    personaId: run.personaId,
    emotionTier: run.emotionTier,
    steps: run.steps,
    riskLevel: run.riskLevel,
    truthScore: run.truthScore,
    timestamp: now,
    summary: run.summary,
    ok: run.ok,
    raw: run.raw,
  };

  const history = [...(current.history ?? []), hrmRun].slice(-100);

  await writeBrewLast({
    lastHRMRun: hrmRun,
    history: history,
  });
}

export async function updateHRMStatus(
  update: Partial<{
    enabled: boolean;
    model: string;
    lastRunAt: string | null;
    lastOk: boolean;
    lastError?: string | null;
    lastInputSummary?: string | null;
    lastOutputSummary?: string | null;
  }>
): Promise<{
  enabled: boolean;
  model: string;
  lastRunAt: string | null;
  lastOk: boolean;
  lastError?: string | null;
  lastInputSummary?: string | null;
  lastOutputSummary?: string | null;
}> {
  const state = await readBrewLast();

  const existing: {
    enabled: boolean;
    model: string;
    lastRunAt: string | null;
    lastOk: boolean;
    lastError?: string | null;
    lastInputSummary?: string | null;
    lastOutputSummary?: string | null;
  } = state.hrmStatus ?? {
    enabled: true,
    model: 'hrm_chain_v2',
    lastRunAt: null,
    lastOk: true,
    lastError: null,
    lastInputSummary: null,
    lastOutputSummary: null,
  };

  const next: {
    enabled: boolean;
    model: string;
    lastRunAt: string | null;
    lastOk: boolean;
    lastError?: string | null;
    lastInputSummary?: string | null;
    lastOutputSummary?: string | null;
  } = {
    ...existing,
    ...update,
    // If caller doesn't override lastRunAt, and this is a “real” update,
    // stamp now:
    lastRunAt: update.lastRunAt ?? new Date().toISOString(),
  };

  const nextState: BrewLastState = {
    ...state,
    hrmStatus: next,
    lastUpdated: new Date().toISOString(),
  };

  await writeBrewLast(nextState);

  return next;
}

export async function getHRMStatus(): Promise<
  | {
      enabled: boolean;
      model: string;
      lastRunAt: string | null;
      lastOk: boolean;
      lastError?: string | null;
      lastInputSummary?: string | null;
      lastOutputSummary?: string | null;
    }
  | undefined
> {
  const state = await readBrewLast();
  return state.hrmStatus;
}

export async function getMemoryStatus() {
  const brewLast = await readBrewLast();
  return {
    enabled: true,
    backend: 'file',
    path: path.join(process.env.HOME || '/home/brewexec', '.brewlast.json'),
    lastUpdated: brewLast?.lastUpdated ?? null,
    hasHistory: !!brewLast?.history?.length,
  };
}
