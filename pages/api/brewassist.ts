import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistEngine, BrewAssistEngineResult } from '@/lib/brewassist-engine';
import { BrewModelRole } from '@/lib/model-router';
import { computeToolbeltRules, ToolbeltTier, getToolRule, ToolRule, McpToolId } from '@/lib/toolbeltConfig';
import { getPermissionForRisk, RiskLevel } from '@/lib/toolbeltGuard'; // Import RiskLevel
import { BrewTruthReport } from '@/lib/brewtruth'; // Import BrewTruthReport
import { evaluateHandshake, HandshakeDecision, BrewIntent } from '@/lib/toolbelt/handshake'; // Import handshake functions and types

export type BrewAssistApiResponse =
  | ({
      ok: true;
      message: { role: 'assistant'; content: string };
      text: string;
      truth: BrewTruthReport | null; // Changed to BrewTruthReport
      policy: HandshakeDecision; // Added policy field
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
        | 'BrewAssist internal failure.'
        | 'POLICY_BLOCK' // Added new error type
        | 'POLICY_CONFIRM_REQUIRED'; // Added new error type
      details?: string;
      policy?: HandshakeDecision; // Include policy for blocked/confirm responses
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<BrewAssistApiResponse>) {

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      input,
      mode = 'llm',
      tier = 'T1_SAFE', // Default to T1_SAFE for safety
      useResearchModel = false,
      preferredProvider,
      mcpToolId,
      mcpAction,
      confirmApply = false,
      gepHeaderPresent = false,
    } = req.body ?? {};

    const cockpitMode = (req.headers['x-brewassist-mode'] as string || req.body.cockpitMode || 'admin') as 'admin' | 'customer';

    if (!input) {
      return res.status(400).json({ ok: false, error: "Missing input" });
    }

    const effectiveRules = computeToolbeltRules(mode, tier as ToolbeltTier, cockpitMode);

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

    // Infer BrewIntent (simple heuristic for now)
    let intent: BrewIntent = "GENERAL";
    if (mcpToolId || mcpAction) {
      intent = "TOOL_RUN";
    } else if (input.toLowerCase().includes("risk") || input.toLowerCase().includes("safety")) {
      intent = "RISK";
    } else if (input.toLowerCase().includes("plan") || input.toLowerCase().includes("strategy")) {
      intent = "ENGINEERING";
    } else if (mode === 'hrm' || mode === 'agent') { // HRM and Agent modes often imply engineering/planning
      intent = "ENGINEERING";
    } else if (mode === 'llm' || mode === 'loop') { // LLM and Loop modes often imply knowledge/general chat
      intent = "KNOWLEDGE";
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

    // Evaluate Handshake Policy
    const handshakeDecision = evaluateHandshake({
      intent,
      tier: tier as ToolbeltTier,
      truthTier: truth?.tier,
      truthScore: truth?.overallScore,
      truthFlags: truth?.flags,
      cockpitMode,
    });

    // Enforce Handshake Decision
    if (handshakeDecision.decision === "BLOCK") {
      return res.status(403).json({
        ok: false,
        error: 'POLICY_BLOCK',
        details: handshakeDecision.reason,
        policy: handshakeDecision,
      });
    }

    if (handshakeDecision.decision === "REQUIRE_CONFIRMATION" && !confirmApply) {
      return res.status(409).json({
        ok: false,
        error: 'POLICY_CONFIRM_REQUIRED',
        details: handshakeDecision.reason,
        policy: handshakeDecision,
      });
    }

    res.status(200).json({
      ok: true,
      message: result,
      text: result.content,
      truth: truth ?? null,
      policy: handshakeDecision, // Include handshake decision
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
    });
  }
}
