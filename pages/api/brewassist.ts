// pages/api/brewassist.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { runBrewAssistEngineStream } from "@/lib/brewassist-engine";
import { BrewTruthReport, runBrewTruth } from "@/lib/brewtruth";
import { computeToolbeltRules, ToolbeltTier, CockpitMode, getToolRule } from "@/lib/toolbeltConfig";
import { evaluateHandshake, HandshakeDecision } from "@/lib/toolbelt/handshake";
import { classifyIntent, ScopeCategory } from "@/lib/intent-gatekeeper";
import { getPermissionForRisk } from "@/lib/toolbeltGuard";

export type BrewAssistApiRequest = {
  input: string;
  mode: "HRM" | "LLM" | "AGENT" | "LOOP" | "TOOL"; // Add "TOOL" mode
  tier?: ToolbeltTier; // Make tier optional as it might come as toolbeltTier
  skillLevel?: "beginner" | "intermediate" | "expert";
  useDeepReasoning?: boolean;
  useResearchModel?: boolean;
  dangerousAction?: boolean;
  mcpToolId?: string; // Add toolbelt related fields
  mcpAction?: string;
  toolRequest?: any;
  confirmApply?: boolean;
  toolbeltTier?: ToolbeltTier; // Add toolbeltTier for mapping
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
    skillLevel,
    useDeepReasoning,
    useResearchModel,
    dangerousAction,
    mcpToolId,
    mcpAction,
    toolRequest,
    confirmApply,
    tier: bodyTier, // Rename 'tier' from body to avoid conflict
    toolbeltTier, // Capture toolbeltTier from body
  }: BrewAssistApiRequest = req.body;

  const normalizedTier = (bodyTier ?? toolbeltTier) as ToolbeltTier;

  const cockpitMode = (req.headers["x-brewassist-mode"] as CockpitMode) || "customer";

  if (!input) {
    return res.status(400).json({
      ok: false,
      error: "Missing required field: input",
      code: "INVALID_REQUEST"
    });
  }

  const intent = classifyIntent(input);

  // Toolbelt enforcement applies if any tool-related field is present
  if (mcpToolId || mcpAction || toolRequest) {
    const handshakeDecision = evaluateHandshake({
      intent,
      tier: normalizedTier,
      cockpitMode,
      mcpToolId,
      mcpAction,
      toolRequest,
      confirmApply,
      gepHeaderPresent: !!req.headers['x-gemini-execution-protocol'],
      // truthTier, truthScore, truthFlags are not available here yet, will be added later
    });

    if (handshakeDecision.decision === "BLOCK") {
      if (handshakeDecision.reason === 'TOOLBELT_GEP_REQUIRED') {
        return res.status(412).json({
          ok: false,
          error: handshakeDecision.reason,
          policy: "BLOCK",
          route: "blocked",
        });
      }
      return res.status(403).json({
        ok: false,
        error: handshakeDecision.reason,
        policy: "BLOCK",
        route: "blocked",
      });
    } else if (handshakeDecision.decision === "REQUIRE_CONFIRMATION") {
      return res.status(409).json({
        ok: false,
        error: handshakeDecision.reason,
        policy: "REQUIRE_CONFIRMATION",
        route: "blocked",
      });
    } else if (handshakeDecision.decision === "ALLOWED") {
      // For now, we'll mock a successful tool execution.
      // In a real scenario, this would trigger the actual tool.
      return res.status(200).json({
        ok: true,
        message: "Tool execution mocked successfully.",
        policy: "ALLOWED",
        route: "tool_executed",
        toolResult: { status: "success", output: "Mocked tool output" },
      });
    }
    return;
  }

  if (cockpitMode === "customer" && intent === "GENERAL_KNOWLEDGE") {
    const redirectMessage =
      "This question seems to be outside of my scope as a DevOps assistant. For general knowledge questions, please use BrewChat or BrewCore.";
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ok: true,
      text: redirectMessage,
      truth: null,
      blockedByTruth: false,
      policy: "BLOCK",
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
  let policyDecisionReport: HandshakeDecision | null = null;
  let debugInfo: any | undefined; // Declare debugInfo here

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Run BrewTruth if enabled
    if (process.env.BREWTRUTH_ENABLED === "true") {
      brewTruthReport = await runBrewTruth(input);
    }

    // Evaluate Handshake for policy decision (even if not TOOL mode, for reporting)
    policyDecisionReport = evaluateHandshake({
      intent,
      tier: normalizedTier,
      cockpitMode,
      mcpToolId,
      mcpAction,
      toolRequest,
      confirmApply,
      gepHeaderPresent: !!req.headers['x-gemini-execution-protocol'],
      truthTier: brewTruthReport?.tier,
      truthScore: brewTruthReport?.score,
      truthFlags: brewTruthReport?.flags,
    });

    let hasEngineCompleted = false; // Moved inside handler

    const engineRunPromise = new Promise<any>(async (resolve, reject) => {
      try {
        await runBrewAssistEngineStream(
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
          }
        );
        resolve({ status: "completed" });
      } catch (err) {
        reject(err);
      }
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
        policy: policyDecisionReport,
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
        policy: policyDecisionReport,
      });
    }
  } catch (error) {
    console.error("Error in brewassist-stream:", error);
    sendEvent({ type: "error", payload: { message: (error as Error).message } });
    // Ensure an end event is sent even on error if not already sent by timeout
    if (!hasEngineCompleted) { // If engineRunPromise didn't complete successfully
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
        policy: policyDecisionReport,
      });
    }
  } finally {
    res.end();
  }
}
