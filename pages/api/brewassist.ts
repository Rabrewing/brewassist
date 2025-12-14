import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistEngine, BrewTruthAttachment, shouldBlockActionFromTruth, BrewAssistEngineResult } from '@/lib/brewassist-engine';
import { BrewModelRole } from '@/lib/model-router';
import { computeToolbeltRules, ToolbeltTier, getToolRule, ToolRule, McpToolId } from '@/lib/toolbeltConfig';
import { getPermissionForRisk, RiskLevel } from '@/lib/toolbeltGuard';

export type BrewAssistApiResponse =
  | ({
      ok: true;
      message: { role: 'assistant'; content: string };
      text: string;
      truth: BrewTruthAttachment | null;
      modelRole: BrewModelRole;
      blockedByTruth?: boolean;
    } & Omit<BrewAssistEngineResult, 'result' | 'truth'>)
  | {
      ok: false;
      error:
        | 'Method not allowed'
        | 'Missing input'
        | 'TOOLBELT_FORBIDDEN'
        | 'TOOLBELT_CONFIRM_REQUIRED'
        | 'TOOLBELT_GEP_REQUIRED'
        | 'TOOLBELT_READ_ONLY'
        | 'BrewAssist internal failure.';
      details?: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<BrewAssistApiResponse>) {

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      input,
      mode = 'llm',
      cockpitMode = 'admin',
      tier = 'T2_GUIDED',
      useResearchModel = false,
      preferredProvider,
      mcpToolId,
      mcpAction,
      confirmApply = false,
      gepHeaderPresent = false,
    } = req.body ?? {};

    if (!input) {
      return res.status(400).json({ ok: false, error: "Missing input" });
    }

    const effectiveRules = computeToolbeltRules(mode, tier as ToolbeltTier);

    let dangerousAction = false;
    let riskLevel: RiskLevel | undefined;
    let toolRule: ToolRule | undefined;

    if (mcpToolId && mcpAction) {
      toolRule = getToolRule(mcpToolId as McpToolId, mcpAction);

      if (toolRule) {
        const isWriteAction = mcpAction.includes('write') || mcpAction.includes('delete') || mcpAction.includes('commit') || mcpAction.includes('migrate') || mcpAction.includes('exec');

        if (toolRule.safety === 'read-only' && isWriteAction) {
          return res.status(403).json({ ok: false, error: 'TOOLBELT_READ_ONLY', details: 'This tool is in read-only mode.' });
        }

        if (!toolRule.enabled) {
          return res.status(403).json({ ok: false, error: 'TOOLBELT_FORBIDDEN', details: `Tool ${mcpToolId} is disabled for this mode/tier.` });
        }

        if (isWriteAction) {
          dangerousAction = true;
          if (mcpAction.includes('multi')) {
            riskLevel = 'write_multi';
          }
          else {
            riskLevel = 'write_single';
          }
        }
        else {
          riskLevel = 'read';
        }

        const permission = getPermissionForRisk(effectiveRules, riskLevel);

        if (permission === 'blocked' || permission === 'admin_only') {
          return res.status(403).json({ ok: false, error: 'TOOLBELT_FORBIDDEN', details: `Action blocked by Toolbelt Tier ${tier} in ${mode} mode.` });
        }

        if (permission === 'needs_confirm' && !confirmApply) {
          return res.status(409).json({ ok: false, error: 'TOOLBELT_CONFIRM_REQUIRED', details: `Action requires confirmation for Toolbelt Tier ${tier} in ${mode} mode.` });
        }

        if (toolRule.requireGepHeader && !gepHeaderPresent) {
          return res.status(412).json({ ok: false, error: 'TOOLBELT_GEP_REQUIRED', details: 'GEP header required for this action.' });
        }
      }
    }

    const engineResult = await runBrewAssistEngine({
      input,
      mode,
      cockpitMode,
      tier: tier as ToolbeltTier,
      useResearchModel,
      preferredProvider,
      systemPrompt: "You are BrewAssist, a helpful AI assistant.",
      dangerousAction: dangerousAction,
    });

    const { result, provider, model, routeType, modelRoleUsed, truth, blockedByTruth, latencyMs } = engineResult;

    res.status(200).json({
      ok: true,
      message: result,
      text: result.content,
      truth: truth ?? null,
      modelRole: mode,
      modelRoleUsed,
      provider,
      model,
      routeType,
      latencyMs,
      blockedByTruth,
    });
  } catch (error: any) {
    console.error('BrewAssist API Error:', error);

    res.status(500).json({
      ok: false,
      error: 'BrewAssist internal failure.',
      details: error?.message ?? String(error),
      // Temporarily add lastError for debugging

    });
  }
}
