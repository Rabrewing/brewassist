// pages/api/brewassist.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistChain, BrewAssistResult } from '@/lib/brewassistChain';
import { getUserMode } from '@/lib/brewModeServer';
import { decideFromTruth, BrewTruthDecision } from '@/lib/brewTruthGateway';
import { runBrewTruth, BrewTruthResult } from '@/lib/brewtruth';
import {
  recordHighRiskWarning,
  shouldAutoProceedAfterWarning,
} from '@/lib/brewRiskMemory';
import { BREW_MODE_PROFILES } from '@/lib/brewModes';
import type { BrewMode } from '@/lib/brewModes';

export interface BrewAssistApiResponse extends Partial<BrewAssistResult> {
  ok: boolean;
  mode: BrewMode;
  gated?: boolean;
  decision?: BrewTruthDecision;
  truth?: BrewTruthResult;
  autoProceeded?: boolean;
  narrative?: string;
  plan?: { llm?: string };
  error?: string;
}

// Simple heuristic for potentially risky actions
function isPotentiallyRisky(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  const riskyKeywords = [
    'delete',
    'rm',
    'format',
    'shutdown',
    'overwrite',
    'modify system',
    'shell',
    'execute',
    'sudo',
    'kill',
    'destroy',
    'wipe',
    'erase',
    'production',
    'deploy',
    'migrate',
    'database',
    'credentials',
    'secret',
    'env',
    'environment variable',
    'api key',
    'token',
  ];
  return riskyKeywords.some((keyword) => lowerPrompt.includes(keyword));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const prompt = req.body?.prompt || req.body?.text || '';
  // For now, userId can be a placeholder. Later, it will come from auth.
  const userId = req.body?.userId || 'default_user';

  const mode = getUserMode(userId);
  const profile = BREW_MODE_PROFILES[mode];

  let truth: BrewTruthResult | undefined;
  let decision: BrewTruthDecision | undefined;
  let autoProceeded = false;

  try {
    if (isPotentiallyRisky(prompt)) {
      truth = await runBrewTruth({ statement: prompt });
      decision = decideFromTruth(
        mode,
        truth.truthScore,
        truth.riskLevel,
        truth.summary
      );

      if (decision.action === 'block') {
        return res.status(200).json({
          ok: false,
          mode,
          gated: true,
          decision,
          truth,
        });
      }

      if (decision.action === 'confirm') {
        if (mode === 'rb' && shouldAutoProceedAfterWarning(userId, prompt)) {
          autoProceeded = true;
          // Clear memory after auto-proceeding
          recordHighRiskWarning(userId, ''); // Clear the last prompt hash
        } else {
          recordHighRiskWarning(userId, prompt);
          return res.status(200).json({
            ok: true,
            mode,
            gated: true,
            decision,
            truth,
          });
        }
      }
    }

    // If not risky, or decision is 'proceed', or 'rb' mode auto-proceeded
    const result = await runBrewAssistChain(prompt, {
      mode,
      truth,
      autoProceeded,
    });
    return res.status(200).json({ ...result, mode, truth, autoProceeded });
  } catch (err: any) {
    console.error('brewassist error:', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
