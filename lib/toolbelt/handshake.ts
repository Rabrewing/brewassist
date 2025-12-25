import { getToolRule, computeToolbeltRules } from "@/lib/toolbeltConfig";
import { getPermissionForRisk } from "@/lib/toolbeltGuard";

export type BrewIntent =
  | "GENERAL"
  | "KNOWLEDGE"
  | "ENGINEERING"
  | "TOOL_RUN"
  | "RISK"
  | "OVERRIDE";

export type ToolbeltTier = "T0_NONE" | "T1_SAFE" | "T2_PATCH" | "T3_DANGEROUS";

export type HandshakeDecisionType =
  | "ALLOW"
  | "ALLOW_WITH_WARNING"
  | "REQUIRE_CONFIRMATION"
  | "BLOCK";

export interface HandshakeDecision {
  decision: HandshakeDecisionType;
  reason: string;
  suggestedTier?: ToolbeltTier;
  requiredConfirmation?: boolean;
}

export function evaluateHandshake(args: {
  intent: BrewIntent;
  tier: ToolbeltTier;
  truthTier?: "gold" | "silver" | "bronze" | "red";
  truthScore?: number; // 0-1
  truthFlags?: string[];
  cockpitMode?: "admin" | "customer";
  mcpToolId?: string;
  mcpAction?: string;
  toolRequest?: any;
  confirmApply?: boolean;
  gepHeaderPresent?: boolean; // Add gepHeaderPresent
}): HandshakeDecision {
  const { intent, tier, truthTier, truthScore, truthFlags, cockpitMode, mcpToolId, mcpAction, toolRequest, confirmApply, gepHeaderPresent } = args;

  const isAdmin = cockpitMode === "admin";
  const hasSafetyConcern = (truthFlags || []).includes("safety_concern");

  // Toolbelt specific checks
  if (mcpToolId && mcpAction) {
    const toolRule = getToolRule(mcpToolId, mcpAction);

    if (!toolRule) {
      return { decision: "ALLOW", reason: "Tool rule not found, bypassing toolbelt." };
    }

    if (!toolRule.enabled) {
      return { decision: "BLOCK", reason: "TOOLBELT_FORBIDDEN" };
    }

    if (toolRule.safety === 'read-only' && (mcpAction.includes('write') || mcpAction.includes('commit') || mcpAction.includes('refactor'))) {
        return { decision: "BLOCK", reason: "TOOLBELT_READ_ONLY" };
    }

    if (toolRule.requireGepHeader && !gepHeaderPresent) {
      return { decision: "BLOCK", reason: "TOOLBELT_GEP_REQUIRED" };
    }

    if (toolRule.requireConfirmation && !confirmApply) {
      return { decision: "REQUIRE_CONFIRMATION", reason: "TOOLBELT_CONFIRM_REQUIRED" };
    }

    return { decision: "ALLOW", reason: "Toolbelt check passed." };
  }

  // Hard blocks
  if (!isAdmin && intent === "OVERRIDE") {
    return { decision: "BLOCK", reason: "Override intent requires admin mode." };
  }

  if (hasSafetyConcern && tier !== "T3_DANGEROUS") {
    return {
      decision: "BLOCK",
      reason: "Safety concern detected. Requires Tier 3 to proceed.",
      suggestedTier: "T3_DANGEROUS",
    };
  }

  // Intent ↔ Tier compatibility
  if (intent === "TOOL_RUN" && tier === "T0_NONE") {
    return { decision: "BLOCK", reason: "Tool runs require Tier 1+." };
  }

  if (intent === "ENGINEERING" && tier === "T0_NONE") {
    return {
      decision: "ALLOW_WITH_WARNING",
      reason: "Engineering guidance allowed, but no tools can be executed (Tier 0).",
      suggestedTier: "T1_SAFE",
    };
  }

  if (intent === "RISK") {
    // risky requests should require confirmation or higher tier
    if (tier === "T1_SAFE") {
      return { decision: "REQUIRE_CONFIRMATION", reason: "Risky intent requires confirmation.", requiredConfirmation: true };
    }
  }

  // Truth-based warnings
  if (truthTier === "red" || (truthScore !== undefined && truthScore < 0.6)) {
    return {
      decision: "REQUIRE_CONFIRMATION",
      reason: "Low BrewTruth score. Confirmation required before proceeding.",
      requiredConfirmation: true,
    };
  }

  return { decision: "ALLOW", reason: "Intent and tier are compatible." };
}
