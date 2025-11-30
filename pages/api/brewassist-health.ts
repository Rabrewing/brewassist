// pages/api/brewassist-health.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getHRMStatus, getMemoryStatus } from '../../lib/brewLastServer';
import { getActivePersona } from '../../lib/brewIdentityEngine';
import fs from 'fs';
import path from 'path';
import { getSandboxHealth } from '../../lib/brewSandbox';
import { getTruthEngineStatus } from '../../lib/brewTruthStatus';
import { getToolbeltStatus } from '../../lib/openaiToolbeltStatus';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const hrmEngine = process.env.HRM_ENGINE || 'openai';
  const projectRoot = process.cwd();

  const engine = {
    model,
    hrmEngine,
    projectRoot,
  };

  const [
    identityStatus,
    memoryStatus,
    truthEngineStatus,
    toolbeltStatus,
    sandboxHealth,
    hrm,
  ] = await Promise.all([
    getActivePersona(),
    getMemoryStatus(),
    getTruthEngineStatus(),
    getToolbeltStatus(),
    getSandboxHealth(),
    getHRMStatus(), // ⬅️ new
  ]);

  const hrmStatusPayload = hrm ?? {
    enabled: false,
    model: null,
    lastRunAt: null,
    lastOk: null,
    lastError: null,
  };

  return res.status(200).json({
    ok: true,
    engine,
    identityStatus,
    memoryStatus,
    truthEngineStatus,
    toolbeltStatus,
    sandboxStatus: sandboxHealth.sandboxStatus,
    sandbox: sandboxHealth.sandbox,
    hrmStatus: hrmStatusPayload, // ⬅️ now comes from BrewLast
    timestamp: new Date().toISOString(),
  });
}
