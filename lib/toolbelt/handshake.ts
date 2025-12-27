import { CAPABILITY_REGISTRY, CapabilityId, RWX, BrewTruthPolicyType } from "@/lib/capabilities/registry";
import { BrewTier } from "@/lib/commands/types";
import { Persona } from "@/lib/brewIdentityEngine";
import { ScopeCategory } from "@/lib/intent-gatekeeper";

export type BrewIntent =
  | "GENERAL"
  | "KNOWLEDGE"
  | "ENGINEERING"
  | "TOOL_RUN"
  | "RISK"
  | "OVERRIDE"
  | ScopeCategory;

export type HandshakeDecisionType =
  | "ALLOW"
  | "ALLOW_WITH_WARNING"
  | "REQUIRE_CONFIRMATION"
  | "BLOCK";

export interface UnifiedPolicyEnvelope {
  ok: boolean;
  capabilityId?: CapabilityId;
  route: "brewassist" | "wizard" | "blocked";
  tier: BrewTier;
  reason?: string;
  requiresConfirm?: boolean;
  requiresSandbox?: boolean;
  auditId?: string;
  brewTruth?: { tier: "gold" | "silver" | "bronze" | "red"; flags?: string[] };
}

export function evaluateHandshake(args: {
  intent: BrewIntent;
  tier: BrewTier; // Use BrewTier from commands/types
  persona: Persona; // Add persona
  cockpitMode?: "admin" | "customer";
  capabilityId?: CapabilityId; // Use capabilityId instead of mcpToolId
  action?: RWX; // Use action instead of mcpAction
  confirmApply?: boolean;
  gepHeaderPresent?: boolean;
  // BrewTruth related args
  truthTier?: "gold" | "silver" | "bronze" | "red";
  truthScore?: number; // 0-1
  truthFlags?: string[];
}): UnifiedPolicyEnvelope {
  const {
    intent,
    tier,
    persona,
    cockpitMode,
    capabilityId,
    action,
    confirmApply,
    gepHeaderPresent,
    truthTier,
    truthScore,
    truthFlags,
  } = args;

  const isAdmin = cockpitMode === "admin";
  const hasSafetyConcern = (truthFlags || []).includes("safety_concern");

  // --- Capability-specific checks (MCP Tools and Commands) ---
  if (capabilityId) {
    const capability = CAPABILITY_REGISTRY[capabilityId];

    if (!capability) {
      return {
        ok: false,
        route: "blocked",
        tier,
        reason: `TOOLBELT_FORBIDDEN: Capability '${capabilityId}' not found.`,
      };
    }

    // 1. Persona check
    if (!capability.personaAllowed.includes(persona)) {
      return {
        ok: false,
        route: "blocked",
        tier,
        reason: `TOOLBELT_FORBIDDEN: Persona '${persona}' not allowed for '${capabilityId}'.`,
      };
    }

    // 2. Tier check
    const tierMap: Record<BrewTier, number> = { "basic": 1, "pro": 2, "rb": 3 };
    if (tierMap[tier] < capability.tierRequired) {
      return {
        ok: false,
        route: "blocked",
        tier,
        reason: `TOOLBELT_TIER_TOO_LOW: Capability '${capabilityId}' requires Tier ${capability.tierRequired}.`,
      };
    }

    // 3. Sandbox check
    if (capability.sandboxRequired && cockpitMode !== "admin") { // Assuming sandbox is only available in admin mode for now
      return {
        ok: false,
        route: "blocked",
        tier,
        reason: `TOOLBELT_SANDBOX_ONLY: Capability '${capabilityId}' requires sandbox environment.`,
      };
    }

    // 4. BrewTruth expectations
    if (capability.brewTruthExpectations.policyType !== "No") {
      if (capability.brewTruthExpectations.policyType === "Yes (strict)") {
        if (truthScore === undefined || truthScore < (capability.brewTruthExpectations.minScore || 0.8)) { // Default to 0.8 for strict
          return {
            ok: false,
            route: "blocked",
            tier,
            reason: `BREWTRUTH_LOW_CONFIDENCE: BrewTruth score (${(truthScore !== undefined ? truthScore * 100 : 0).toFixed(0)}%) below required minimum for '${capabilityId}'.`,
            requiresConfirm: true,
            brewTruth: { tier: truthTier || "red", flags: truthFlags },
          };
        }
        if (capability.brewTruthExpectations.flags && capability.brewTruthExpectations.flags.some(flag => !(truthFlags || []).includes(flag))) {
          return {
            ok: false,
            route: "blocked",
            tier,
            reason: `BREWTRUTH_MISSING_FLAGS: Required BrewTruth flags missing for '${capabilityId}'.`,
            requiresConfirm: true,
            brewTruth: { tier: truthTier || "red", flags: truthFlags },
          };
        }
      } else if (capability.brewTruthExpectations.policyType === "Yes (light)") {
        if (truthScore === undefined || truthScore < (capability.brewTruthExpectations.minScore || 0.5)) { // Default to 0.5 for light
          return {
            ok: false,
            route: "blocked",
            tier,
            reason: `BREWTRUTH_LOW_CONFIDENCE: BrewTruth score (${(truthScore !== undefined ? truthScore * 100 : 0).toFixed(0)}%) below required minimum for '${capabilityId}'.`,
            requiresConfirm: true,
            brewTruth: { tier: truthTier || "red", flags: truthFlags },
          };
        }
      }
    }

    // 5. Confirmation check
    if (capability.confirmApplyRequired && !confirmApply) {
      return {
        ok: false,
        route: "blocked",
        tier,
        reason: `TOOLBELT_CONFIRM_REQUIRED: Capability '${capabilityId}' requires confirmation.`,
        requiresConfirm: true,
      };
    }

    // 6. GEP Header check
    if (capability.gepRequired && !gepHeaderPresent) {
      return {
        ok: false,
        route: "blocked",
        tier,
        reason: `TOOLBELT_GEP_REQUIRED: Capability '${capabilityId}' requires GEP header.`,
      };
    }

    // 7. RWX check for MCP tools (if applicable)
    if (capability.rwx && action) {
      // For simplicity, assuming 'W' and 'X' imply 'R'
      if (action === "W" && capability.rwx === "R") {
        return {
          ok: false,
          route: "blocked",
          tier,
          reason: `TOOLBELT_READ_ONLY: Capability '${capabilityId}' is read-only.`,
        };
      }
      // More granular RWX checks can be added here if needed
    }

    return { ok: true, route: "brewassist", tier, capabilityId, reason: "Capability check passed." };
  }

  // --- General Intent ↔ Tier compatibility (legacy checks, to be phased out) ---
  if (!isAdmin && intent === "OVERRIDE") {
    return { ok: false, route: "blocked", tier, reason: "Override intent requires admin mode." };
  }

  if (hasSafetyConcern && tier !== "rb") { // Use "rb" for T3_DANGEROUS
    return {
      ok: false,
      route: "blocked",
      tier,
      reason: "Safety concern detected. Requires RB Tier to proceed.",
    };
  }

  if (intent === "TOOL_RUN" && tier === "basic") { // Use "basic" for T0_NONE
    return { ok: false, route: "blocked", tier, reason: "Tool runs require Pro Tier+." };
  }

  if (intent === "ENGINEERING" && tier === "basic") {
    return {
      ok: true, // Allow with warning
      route: "brewassist",
      tier,
      reason: "Engineering guidance allowed, but no tools can be executed (Basic Tier).",
    };
  }

  if (intent === "RISK") {
    if (tier === "basic") {
      return { ok: false, route: "blocked", tier, reason: "Risky intent requires Pro Tier+.", requiresConfirm: true };
    }
  }

  if (truthTier === "red" || (truthScore !== undefined && truthScore < 0.6)) {
    return {
      ok: false,
      route: "blocked",
      tier,
      reason: "Low BrewTruth score. Confirmation required before proceeding.",
      requiresConfirm: true,
      brewTruth: { tier: truthTier || "red", flags: truthFlags },
    };
  }

  return { ok: true, route: "brewassist", tier, reason: "Intent and tier are compatible." };
}