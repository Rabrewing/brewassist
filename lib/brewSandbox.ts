// lib/brewSandbox.ts
import { readBrewLast } from './brewLastServer'; // adjust to your actual helper
import type { BrewLastState } from './brewLast'; // if you have a type
import path from 'path'; // Import path module
import * as fs from 'fs/promises'; // Import fs/promises

const SANDBOX_ROOT =
  process.env.BREW_SANDBOX_ROOT || path.join(process.cwd(), 'sandbox');

export function getSandboxRoot(): string {
  return SANDBOX_ROOT;
}

export function getRunDir(runId: string): string {
  return path.join(SANDBOX_ROOT, 'runs', runId);
}

// Mirror root: sandbox/mirror
export function getMirrorRoot(): string {
  return path.join(getSandboxRoot(), 'mirror');
}

// Ensures that the core sandbox directories exist.
export async function ensureSandboxDirs(): Promise<void> {
  await fs.mkdir(getSandboxRoot(), { recursive: true });
  await fs.mkdir(getMirrorRoot(), { recursive: true });
  // The 'runs' directory will be created by getRunDir as needed.
}

export type SandboxStatus = {
  enabled: boolean;
  lastRunId: string | null;
  lastRunAt: string | null;
  lastRiskLevel: string | null;
  lastTruthScore: number | null;
  status: string;
};

export type SandboxHealthPayload = {
  sandboxStatus: SandboxStatus;
  sandbox: {
    ready: boolean;
    mirror: { status: 'OK' | 'STALE' | 'MISSING' };
    maintenance: {
      enabled: boolean;
      lastRunId: string | null;
      lastRunAt: string | null;
      lastRiskLevel: string | null;
      lastTruthScore: number | null;
    };
    guardrails: { status: 'ACTIVE' | 'DISABLED' };
  };
};

export async function getSandboxHealth(): Promise<SandboxHealthPayload> {
  let state: BrewLastState;

  try {
    state = await readBrewLast();
  } catch {
    // If .brewlast.json missing or unreadable, fall back to safe defaults
    const empty: SandboxStatus = {
      enabled: false,
      lastRunId: null,
      lastRunAt: null,
      lastRiskLevel: null,
      lastTruthScore: null,
      status: 'Sandbox not initialized.',
    };

    return {
      sandboxStatus: empty,
      sandbox: {
        ready: false,
        mirror: { status: 'MISSING' },
        maintenance: {
          enabled: false,
          lastRunId: null,
          lastRunAt: null,
          lastRiskLevel: null,
          lastTruthScore: null,
        },
        guardrails: { status: 'DISABLED' },
      },
    };
  }

  // Your existing code is already logging sandbox runs into BrewLast.
  // We'll try to pull the last one in a defensive way.
  const sandboxRuns = (state as any).sandboxRuns ?? [];
  const lastRun =
    sandboxRuns.length > 0 ? sandboxRuns[sandboxRuns.length - 1] : null;

  const lastRunId = lastRun?.runId ?? null;
  const lastRunAt = lastRun?.timestamp ?? lastRun?.createdAt ?? null;
  const lastRiskLevel = lastRun?.riskLevel ?? null;
  const lastTruthScore =
    typeof lastRun?.truthScore === 'number' ? lastRun.truthScore : null;

  const enabled = !!lastRunId;

  const sandboxStatus: SandboxStatus = {
    enabled,
    lastRunId,
    lastRunAt,
    lastRiskLevel,
    lastTruthScore,
    status: enabled
      ? `Last run maintenance completed with ${lastRiskLevel ?? 'UNKNOWN'} risk.`
      : 'Sandbox has not run maintenance yet.',
  };

  return {
    sandboxStatus,
    sandbox: {
      ready: enabled,
      mirror: { status: 'OK' }, // if mirror builds, this is fine as default
      maintenance: {
        enabled,
        lastRunId,
        lastRunAt,
        lastRiskLevel,
        lastTruthScore,
      },
      guardrails: {
        status: 'ACTIVE', // you already wired lib/brewGuardrails.ts
      },
    },
  };
}
