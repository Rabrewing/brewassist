// pages/api/brewassist.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { runBrewAssistEngineStream } from "@/lib/brewassist-engine";
import { BrewTruthReport, runBrewTruth } from "@/lib/brewtruth";
import { PersonaId, getActivePersona } from "@/lib/brewIdentityEngine"; // Import PersonaId and getActivePersona
import { CAPABILITY_REGISTRY, RWX } from "@/lib/capabilities/registry"; // Import CAPABILITY_REGISTRY, RWX
import { BrewTier } from "@/lib/commands/types"; // Import BrewTier
import { evaluateHandshake, UnifiedPolicyEnvelope } from "@/lib/toolbelt/handshake"; // Import evaluateHandshake, UnifiedPolicyEnvelope
import { classifyIntent, ScopeCategory } from "@/lib/intent-gatekeeper";
import { BREWASSIST_CANONICAL_DEFINITION, BREWASSIST_IDENTITY_PROMPTS } from "@/lib/brand/brewassist.definition"; // Import brand definition
import { Persona } from "@/lib/brewIdentityEngine"; // Import Persona
import type { CockpitMode } from "@/lib/brewTypes"; // Import CockpitMode

export type BrewAssistApiRequest = {
  input: string;
  mode: "HRM" | "LLM" | "AGENT" | "LOOP" | "TOOL"; // Add "TOOL" mode
  tier?: BrewTier; // Use BrewTier
  persona?: Persona; // Add persona
  skillLevel?: "beginner" | "intermediate" | "expert";
  useDeepReasoning?: boolean;
  useResearchModel?: boolean;
  dangerousAction?: boolean;
  capabilityId?: string; // Use capabilityId
  action?: RWX; // Use action
  toolRequest?: any;
  confirmApply?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({
      ok: false,
      error: "Method Not Allowed",
      code: "METHOD_NOT_ALLOWED"
    });
    return;
  }

  const {
    input,
    mode,
    tier, // Use 'tier' directly
    persona: requestPersona, // Capture persona from body if provided
    skillLevel,
    useDeepReasoning,
    useResearchModel,
    dangerousAction,
    capabilityId, // Use capabilityId
    action, // Use action
    toolRequest,
    confirmApply,
    truthScore,
    truthFlags,
  }: BrewAssistApiRequest & { truthScore?: number; truthFlags?: string[] } = req.body;

  const cockpitMode = (req.headers["x-brewassist-mode"] as CockpitMode) || "customer";
  const currentPersona: PersonaId = requestPersona?.id || (cockpitMode === "admin" ? "admin" : "customer"); // Determine persona
  const normalizedTier: BrewTier = tier || "basic"; // Default to basic if not provided

  if (!input) {
    return res.status(400).json({
      ok: false,
      error: "Missing required field: input",
      code: "INVALID_REQUEST"
    });
  }

  let commandCapabilityId: string | undefined;

  // Check if input is a command
  if (input.startsWith('/')) {
    const command = input.split(' ')[0];
    if (CAPABILITY_REGISTRY[command] && CAPABILITY_REGISTRY[command].surfaces.includes("command")) {
      commandCapabilityId = command;
    }
  }

  const intent = classifyIntent(input, commandCapabilityId);

  // S4.10c.2 Patch: Brand Anchor - Detect identity/definition intents
  const lowerCaseInput = input.toLowerCase();
  const isIdentityIntent = BREWASSIST_IDENTITY_PROMPTS.some(p => lowerCaseInput.includes(p));

  if (isIdentityIntent) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ok: true,
      text: BREWASSIST_CANONICAL_DEFINITION,
      truth: null,
      blockedByTruth: false,
      policy: {
        ok: true,
        route: "brewassist",
        tier: normalizedTier,
        reason: "Brand Anchor response",
        capabilityId: "/identity", // Placeholder capability for identity
      },
      route: "brewassist",
      scopeCategory: "PLATFORM_DEVOPS", // Identity is always platform devops
    });
    return;
  }

  let policyEnvelope: UnifiedPolicyEnvelope;


  const resolvedPersona: Persona = {
    id: currentPersona,
    label: `Resolved Persona: ${currentPersona}`, // Placeholder label
    tone: 'Neutral', // Placeholder tone
    emotionTier: 1, // Placeholder tier
    safetyMode: 'soft-stop', // Placeholder safety mode
    memoryWindow: 1, // Placeholder memory window
    systemPrompt: `Persona derived from request: ${currentPersona}`, // Placeholder system prompt
  };

  // Evaluate Handshake for policy decision (for capabilities or general intent)
  policyEnvelope = evaluateHandshake({
    intent,
    tier: normalizedTier,
    persona: resolvedPersona,
    cockpitMode,
    capabilityId: capabilityId || commandCapabilityId, // Use capabilityId from body or derived command
    action,
    confirmApply,
    gepHeaderPresent: !!req.headers['x-gemini-execution-protocol'],
    truthScore,
    truthFlags,
  });

  // Handle policy decisions
  if (!policyEnvelope.ok) {
    let statusCode = 403; // Forbidden
    if (policyEnvelope.reason?.includes('TOOLBELT_GEP_REQUIRED')) {
      statusCode = 412; // Precondition Failed
    } else if (policyEnvelope.requiresConfirm) {
      statusCode = 409; // Conflict (requires user action)
    }

    return res.status(statusCode).json({
      ok: false,
      error: policyEnvelope.reason,
      policy: policyEnvelope,
      route: policyEnvelope.route,
    });
  }

  // If a command was identified and allowed by policy, execute it (mock for now)
  if (commandCapabilityId && policyEnvelope.ok) {
    // In a real scenario, this would trigger the actual command handler
    return res.status(200).json({
      ok: true,
      message: `Command '${commandCapabilityId}' mocked successfully.`,
      policy: policyEnvelope,
      route: "command_executed",
      commandResult: { status: "success", output: `Mocked output for ${commandCapabilityId}` },
    });
  }

  // If a tool was identified and allowed by policy, execute it (mock for now)
  if (capabilityId && policyEnvelope.ok) {
    // In a real scenario, this would trigger the actual tool handler
    return res.status(200).json({
      ok: true,
      message: `Tool '${capabilityId}' mocked successfully.`,
      policy: policyEnvelope,
      route: "tool_executed",
      toolResult: { status: "success", output: `Mocked output for ${capabilityId}` },
    });
  }

  if (cockpitMode === "customer" && intent === "GENERAL_KNOWLEDGE") {
    const redirectMessage =
      "This question seems to be outside of my scope as a DevOps assistant. For general knowledge questions, please use BrewChat or BrewCore.";
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ok: true,
      text: redirectMessage,
      truth: null,
      policy: {
        ok: false,
        route: "blocked",
        tier: normalizedTier,
        reason: "GENERAL_KNOWLEDGE_BLOCKED_CUSTOMER_MODE",
      },
      route: "blocked",
      scopeCategory: "GENERAL_KNOWLEDGE",
    });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  let accumulatedText = "";
  let providerUsed: string | undefined;
  let modelUsed: string | undefined;
  let brewTruthReport: BrewTruthReport | null = null;
  let debugInfo: any | undefined; // Declare debugInfo here

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Run BrewTruth if enabled
    if (process.env.BREWTRUTH_ENABLED === "true") {
      brewTruthReport = await runBrewTruth({ prompt: input, response: "" });
    }

    // Evaluate Handshake for policy decision (even if not TOOL mode, for reporting)
    // policyEnvelope is already determined above, so we just use it here.

    let hasEngineCompleted = false; // Moved inside handler

    const engineRunPromise = new Promise<any>((resolve, reject) => {
      runBrewAssistEngineStream(
        {
          prompt: input,
          mode: mode.toLowerCase() as "hrm" | "llm" | "agent" | "loop",
          preferredProvider: undefined,
          tier: normalizedTier,
          cockpitMode,
          intent, // Pass intent here
        },
        (chunk) => {
          const text = String(chunk ?? "");
          if (!text) return;
          accumulatedText += text;
          sendEvent({ type: "chunk", text });
        },
        (result) => { // onEnd callback
          providerUsed = result.provider;
          modelUsed = result.model;
          hasEngineCompleted = true;
          debugInfo = result.debugInfo; // Capture debugInfo
          resolve({ status: "completed" }); // Resolve here on successful completion
        }
      ).catch(err => {
        reject(err); // Reject if runBrewAssistEngineStream throws an error
      });
    });

    const timeoutPromise = new Promise<any>((resolve) => {
      setTimeout(() => {
        if (!hasEngineCompleted && (mode === "AGENT" || mode === "LOOP")) {
          resolve({ status: "timeout" });
        } else {
          resolve({ status: "no_timeout" }); // Resolve without timeout action if engine already completed or not agent/loop
        }
      }, 10000); // 10 seconds timeout
    });

    const raceResult = await Promise.race([engineRunPromise, timeoutPromise]);

    if (raceResult.status === "timeout") {
      const message = `Agent/Loop mode is not fully wired yet. Please use HRM or LLM mode.`;
      sendEvent({ type: "chunk", text: message });
      sendEvent({
        type: "end",
        payload: {
          provider: "BrewAssist",
          model: "Fallback",
          route: "brewassist",
          scopeCategory: intent,
          debugInfo: debugInfo, // Include debugInfo here
        },
        text: message,
        truth: brewTruthReport,
        policy: policyEnvelope, // Use policyEnvelope
      });
    } else if (raceResult.status === "completed") {
      sendEvent({
        type: "end",
        payload: {
          provider: providerUsed,
          model: modelUsed,
          route: "brewassist",
          scopeCategory: intent,
          debugInfo: debugInfo, // Include debugInfo here
        },
        text: accumulatedText,
        truth: brewTruthReport,
        policy: policyEnvelope, // Use policyEnvelope
      });
    }
  } catch (error) {
    console.error("Error in brewassist-stream:", error);
    sendEvent({ type: "error", payload: { message: (error as Error).message } });
    // Always send an end event on error to ensure client stream closes
    sendEvent({
      type: "end",
      payload: {
        provider: "BrewAssist",
        model: "ErrorFallback",
        route: "brewassist",
        scopeCategory: intent,
        debugInfo: debugInfo, // Include debugInfo here
      },
      text: "An error occurred during processing.",
      truth: brewTruthReport,
      policy: policyEnvelope, // Use policyEnvelope
    });
  } finally {
    res.end();
  }
}
