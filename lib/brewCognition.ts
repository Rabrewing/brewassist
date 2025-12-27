import { Persona, PersonaId } from "./brewIdentityEngine"; // Import Persona and PersonaId from brewIdentityEngine
import { CockpitMode } from "@/lib/brewTypes";
import { BrewTier } from "@/lib/commands/types"; // Import BrewTier from registry
import { UnifiedPolicyEnvelope } from "./toolbelt/handshake"; // Use UnifiedPolicyEnvelope
import { BrewTruthReport } from "./brewtruth"; // Import BrewTruthReport

export type ReasoningMode = "LLM" | "HRM" | "Agent" | "Loop";
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";
export type EmotionalState = "Neutral" | "Cautious" | "Uncertain" | "Confident";
export type Intent = string; // This could be more structured later

export type TruthValidationStatus = "Validated" | "Uncertain" | "Failed";

export interface CognitionState {
  persona: PersonaId;
  emotionalState: EmotionalState;
  userRole: CockpitMode;
  toolbeltTier: BrewTier; // Use BrewTier
  intent: Intent;
  reasoningMode: ReasoningMode;
  riskLevel: RiskLevel;
  executionPermission: UnifiedPolicyEnvelope; // Use UnifiedPolicyEnvelope
  truthValidationStatus: TruthValidationStatus;
}

/**
 * Assembles the current cognition state of BrewAssist.
 * This function gathers relevant information from various systems to form a comprehensive
 * snapshot of BrewAssist's current "thinking" for display purposes.
 *
 * @param persona The currently active BrewAssist persona ID.
 * @param cockpitMode The current cockpit mode (admin, customer, etc.) which implies user role.
 * @param toolbeltTier The active toolbelt tier.
 * @param inferredIntent The inferred intent of the user's request.
 * @param currentReasoningMode The current reasoning strategy being employed.
 * @param brewTruthReport The latest BrewTruth report.
 * @param handshakeDecision The decision from the S4.10c handshake policy.
 * @returns A CognitionState object representing BrewAssist's current cognition.
 */
export function assembleCognitionState(
  persona: Persona['id'], // Use Persona['id'] for persona
  cockpitMode: CockpitMode,
  toolbeltTier: BrewTier,
  inferredIntent: Intent,
  currentReasoningMode: ReasoningMode,
  brewTruthReport: BrewTruthReport | null,
  handshakeDecision: UnifiedPolicyEnvelope,
): CognitionState {
  let emotionalState: EmotionalState = "Neutral";
  let riskLevel: RiskLevel = "Low";
  let truthValidationStatus: TruthValidationStatus = "Validated";
  if (brewTruthReport) {
    if (brewTruthReport.overallScore < 0.5) {
      emotionalState = "Uncertain";
      riskLevel = "Critical";
      truthValidationStatus = "Failed";
    } else if (brewTruthReport.overallScore < 0.8) {
      emotionalState = "Cautious";
      riskLevel = "Moderate";
      truthValidationStatus = "Uncertain";
    }

    if (brewTruthReport.flags.length > 0) {
      emotionalState = "Cautious";
      if (brewTruthReport.flags.includes("safety_concern")) {
        riskLevel = "Critical";
      } else if (brewTruthReport.flags.includes("possible_hallucination")) {
        riskLevel = "High";
      }
    }
  } else {
    // If no truth report, it's uncertain
    emotionalState = "Uncertain";
    riskLevel = "Moderate";
    truthValidationStatus = "Uncertain";
  }

  // Adjust emotional state based on handshake decision
  if (!handshakeDecision.ok || handshakeDecision.requiresConfirm) {
    emotionalState = "Cautious";
    if (riskLevel === "Low") riskLevel = "Moderate"; // Elevate risk if not already high
  }

  return {
    persona,
    emotionalState,
    userRole: cockpitMode,
    toolbeltTier,
    intent: inferredIntent,
    reasoningMode: currentReasoningMode,
    riskLevel,
    executionPermission: handshakeDecision,
    truthValidationStatus,
  };
}
