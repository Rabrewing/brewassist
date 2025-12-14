import { DEFAULT_PERSONA } from "../lib/brewConfig";
import { resolveRoute, BrewModelRole, BrewProviderId, getModelRoutes, getModelProviders, BrewRoute, BrewRouteType } from "../lib/model-router";
import { pickNimsModel } from "../lib/nims-utils";
import { runBrewTruth, BrewTruthReport, BrewTruthModelTrace, BrewTruthTier, BrewTruthFlagType } from "./brewtruth";
import { getPermissionForRisk } from './toolbeltGuard'; // Import toolbeltGuard
import { computeToolbeltRules, ToolbeltBrewMode, ToolbeltTier, ToolbeltRulesSnapshot, ToolPermission } from './toolbeltConfig'; // Import ToolbeltConfig types
import type { CockpitMode } from "./brewTypes";

export type EngineBrewAssistMode = "hrm" | "llm" | "agent" | "loop"; // Renamed to avoid conflict

export type BrewMessageRole =
  | "user"
  | "assistant"
  | "system"
  | "hrm"
  | "llm"
  | "agent"
  | "loop";

export interface BrewMessage {
  id: string;
  role: BrewMessageRole;
  content: string;
  createdAt: string;
  model?: string;
  mode?: EngineBrewAssistMode; // Use EngineBrewAssistMode
  truthScore?: number;
}

// S4.9c: New types for BrewTruth attachment
export type RiskLevel = "low" | "medium" | "high";

function mapBrewTruthTierToRiskLevel(tier: BrewTruthTier): RiskLevel {
  switch (tier) {
    case "gold":
    case "silver":
    case "bronze":
      return "low";
    case "red":
      return "high";
    default:
      return "medium"; // Default to medium for unknown or new tiers
  }
}

export type BrewTruthAttachment = {
  version: string;
  truthScore: number;           // 0–1
  riskLevel: RiskLevel;
  flags: BrewTruthFlagType[];   // Use BrewTruthFlagType from brewtruth.ts
  notes?: string;               // short summary for UI
};

export interface BrewAssistPersona {
  name: string;            // "BrewAssist"
  version: string;         // "S4.8c"
  role: "devops_copilot";
  tone: "direct_supportive";
  audience: "dev_or_vibe_coder";
  ownerName?: string;      // "Randy Brewington"
  orgName?: string;        // "Brewington Exec Group Inc."
}

export interface BrewAssistSessionContext {
  persona: BrewAssistPersona;
  mode: EngineBrewAssistMode; // Use EngineBrewAssistMode
  skillLevel?: "vibe" | "intermediate" | "senior" | "enterprise";
  projectName?: string;
  repoSummary?: string;
  lastTasks: string[];   // short text summaries
}

export interface RunBrewAssistOptions {
  input: string;
  mode: EngineBrewAssistMode; // Use EngineBrewAssistMode
  cockpitMode: CockpitMode;
  tier: ToolbeltTier; // Add tier to options
  sessionContext?: BrewAssistSessionContext;
  modelRole?: BrewModelRole;         // optional override
  useResearchModel?: boolean;        // for explicit research calls
  dangerousAction?: boolean; // S4.9d: Flag for actions that need confirmation
}

// Map tab mode → logical role
export function modeToRole(mode: EngineBrewAssistMode): BrewMessageRole { // Use EngineBrewAssistMode
  switch (mode) {
    case "hrm":
      return "hrm";
    case "agent":
      return "agent";
    case "loop":
      return "loop";
    case "llm":
    default:
      return "llm";
  }
}

const BREW_OWNER_NAME =
  process.env.BREW_OWNER_NAME ?? "Randy Brewington";

const BREW_OWNER_ALIASES = [
  "RB",
  "Randy",
  "MasterBrew RB Jr Full Stack Dev",
  "MasterBrew RB",
];

function buildSystemPrompt(ctx: BrewAssistSessionContext): string {
  const { persona, mode } = ctx;

  return [
    `You are ${persona.name}, a ${persona.role} for ${persona.orgName}.`,
    `You are helping ${persona.ownerName}, a full-stack dev and Recruitment Architect, work on BrewVerse projects.`,
    `Current cockpit mode: ${mode.toUpperCase()}.`,
    mode === "hrm"
      ? "Focus on plans, roadmaps, teaching, and step-by-step reasoning."
      : mode === "llm"
      ? "Focus on direct answers, code help, and tight responses."
      : mode === "agent"
      ? "Focus on multi-step operations, tool usage, and proposing commands."
      : "Focus on recap, narration, and summarizing what just happened.",
    `Keep tone: supportive, clear, precise. Avoid acting like a generic chatbot.`,
  ].join("\n");
}

interface BrewAssistEngineOptions {
  input: string;
  mode: BrewModelRole;
  cockpitMode: CockpitMode;
  tier: ToolbeltTier; // Add tier to options
  useResearchModel?: boolean;
  systemPrompt?: string;
  dangerousAction?: boolean; // S4.9d: Flag for actions that need confirmation
}

export class ToolbeltBlockedError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ToolbeltBlockedError';
    this.statusCode = statusCode;
  }
}

export interface BrewAssistEngineResult {
  result: {
    role: "assistant";
    content: string;
  };
  provider: BrewProviderId;
  model: string;
  routeType: BrewRouteType;
  latencyMs: number; // NEW
  modelRoleUsed: string; // NEW
  truth?: BrewTruthAttachment | null; // Updated to BrewTruthAttachment
  blockedByTruth?: boolean; // S4.9d: Add blockedByTruth to result
}

// --- S4.8f NIMs Auto-Discovery Logic (Moved to lib/nims-utils.ts) ---

// Encapsulates NIMs API call logic
async function callNimsProvider(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const NIMS_API_KEY = process.env.NIMS_API_KEY;
  const NIMS_BASE_URL = process.env.NIMS_BASE_URL?.replace(/\/+$/, "") || "https://integrate.api.nvidia.com/v1";

  if (!NIMS_API_KEY) {
    throw new Error("NIMs API key not set.");
  }

  const res = await fetch(`${NIMS_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NIMS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: Number(process.env.NIMS_MAX_TOKENS ?? 1536),
      temperature: Number(process.env.NIMS_TEMPERATURE ?? 0.2),
      // Add timeout for actual calls
      signal: AbortSignal.timeout(Number(process.env.NIMS_TIMEOUT_MS ?? 20000))
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`API chat error from nims:`, res.status, text);
    throw new Error(`Provider nims returned status ${res.status}: ${text}`);
  }

  const data: any = await res.json();
  const firstChoice = data?.choices?.[0];
  const text =
    firstChoice?.message?.content ??
    firstChoice?.content ??
    "";

  if (!text) {
    console.error(
      "NIMs response missing content:",
      JSON.stringify(data, null, 2)
    );
    throw new Error("NIMs response missing content");
  }

  return text;
}



// ... (rest of the file)

async function callProvider(
  provider: BrewProviderId,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
  const providers = getModelProviders(); // Get dynamic providers
  const providerConfig = providers[provider];
  if (!providerConfig || !providerConfig.enabled) {
    throw new Error(`Provider ${provider} is not enabled or configured.`);
  }

  let url: string;
  let headers: Record<string, string>;
  let requestBody: any;
  let apiKey: string | undefined;

  switch (provider) {
    case 'openai': {
      apiKey = providerConfig.apiKey;
      const base =
        providerConfig.baseUrl?.replace(/\/+$/, "") ||
        "https://api.openai.com/v1";
      url = `${base}/chat/completions`;
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      requestBody = { model, messages, temperature: 0.7 };
      break;
    }
    case 'gemini': {
      apiKey = providerConfig.apiKey;
      const base = (providerConfig.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models").replace(/\/+$/, "");
      url = `${base}/${model}:generateContent?key=${apiKey}`;
      headers = {
        "Content-Type": "application/json",
      };
      requestBody = { contents: messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, parts: [{ text: m.content }] })) };
      break;
    }
    case 'mistral': {
      apiKey = providerConfig.apiKey;
      const mistralBase =
        providerConfig.baseUrl?.replace(/\/+$/, "") ||
        "https://api.mistral.ai/v1";
      url = `${mistralBase}/chat/completions`;
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      requestBody = { model, messages, temperature: 0.7 };
      break;
    }
    case 'tinyllm':
      url = providerConfig.baseUrl || "http://localhost:8000/chat/completions";
      headers = {
        "Content-Type": "application/json",
      };
      requestBody = { model, messages, temperature: 0.7 };
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  if (!apiKey && provider !== 'tinyllm') {
    throw new Error(`API key not set for provider: ${provider}`);
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`API chat error from ${provider}:`, res.status, text);
    throw new Error(`Provider ${provider} returned status ${res.status}: ${text}`);
  }

  const data: any = await res.json();
  console.log(`Raw response from ${provider}:`, JSON.stringify(data, null, 2));

  let rawContent: string | undefined;

  if (provider === 'gemini') {
    rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  } else {
    rawContent = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;
  }

  if (!rawContent) {
    console.error(`Response from ${provider} missing content:`, JSON.stringify(data, null, 2));
    throw new Error(`Response from ${provider} missing content`);
  }

  return rawContent;
}

export async function runBrewAssistEngine(
  opts: BrewAssistEngineOptions & { preferredProvider?: BrewProviderId } // Added preferredProvider to opts
): Promise<BrewAssistEngineResult> {
  const { input, mode, cockpitMode, tier, useResearchModel, systemPrompt, preferredProvider, dangerousAction } = opts; // Destructure tier and dangerousAction

  // Compute effective rules based on current mode and tier
  const effectiveRules = computeToolbeltRules(mode as ToolbeltBrewMode, tier);

  // S4.9d: Implement Toolbelt Guard for dangerous actions
  let blockedByToolbelt = false;
  let toolbeltBlockReason: string | undefined;

  if (dangerousAction) {
    const permission = getPermissionForRisk(effectiveRules, 'write_single'); // Assuming dangerousAction implies single write for now
    if (permission === 'blocked') {
      blockedByToolbelt = true;
      toolbeltBlockReason = `Action blocked by Toolbelt Tier ${tier} in ${mode} mode.`;
    } else if (permission === 'admin_only') {
      blockedByToolbelt = true;
      toolbeltBlockReason = `Action requires Admin privileges in Toolbelt Tier ${tier} in ${mode} mode.`;
    }
    // 'needs_confirm' is handled by the UI, so no block here
  }

  if (blockedByToolbelt) {
    return {
      result: {
        role: "assistant",
        content: toolbeltBlockReason || "Action blocked by Toolbelt rules.",
      },
      provider: 'system', // Indicate system block
      model: 'toolbelt-guard',
      routeType: 'system-block',
      latencyMs: 0,
      modelRoleUsed: mode,
      blockedByTruth: true, // Use this flag to indicate a block, even if not by truth
    };
  }

  const messages = [
    ...(systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }]
      : []),
    { role: 'user' as const, content: input },
  ];

  // Determine the initial route based on preferences
  const initialRoute = resolveRoute(mode, { preferredProvider, useResearchModel, cockpitMode, tier });

  // Get all possible routes for the given mode, cockpitMode, and tier
  const allPossibleRoutes = getModelRoutes({ mode, cockpitMode, tier });

  // Build the fallback chain.
  // Start with the initialRoute, then add other routes from allPossibleRoutes
  // that are not the initialRoute, prioritizing primary then fallback.
  const routesToTry: BrewRoute[] = [];
  if (initialRoute) {
    routesToTry.push(initialRoute);
  }

  // Add other routes, ensuring no duplicates and respecting primary/fallback order
  for (const route of allPossibleRoutes) {
    if (route.provider === initialRoute.provider && route.model === initialRoute.model) {
      continue; // Skip if it's the initial route
    }
    routesToTry.push(route);
  }

  // S3A: Add "no routes" guard (critical)
  if (!routesToTry || routesToTry.length === 0) {
    console.error("[BrewAssistEngine] No routesToTry. This indicates a routing configuration issue where no valid routes could be determined.", {
      USE_OPENAI: process.env.USE_OPENAI,
      USE_GEMINI: process.env.USE_GEMINI,
      USE_MISTRAL: process.env.USE_MISTRAL,
      OPENAI_KEY: !!process.env.OPENAI_API_KEY,
      GEMINI_KEY: !!process.env.GEMINI_API_KEY,
      MISTRAL_KEY: !!process.env.MISTRAL_API_KEY,
    });

    throw new Error(
      "BrewAssistEngine has zero routesToTry (router returned empty). This is filtering/branching logic, not provider auth."
    );
  }

  const failureLog: Array<{ provider: string; error: string }> = [];
  let lastError: unknown = undefined;

  function firstLine(e: unknown) {
    const msg =
      e instanceof Error ? e.message :
      typeof e === "string" ? e :
      (() => { try { return JSON.stringify(e); } catch { return String(e); } })();
    return String(msg).split("\n")[0];
  }
  
  let providerUsed: BrewProviderId = 'openai'; // Default to avoid undefined
  let modelUsed: string = 'unknown';
  let routeType: BrewRouteType = 'primary';
  let latencyMs: number = 0;
  const modelRoleUsed: string = mode; // Assuming mode is the modelRoleUsed
  
  for (let i = 0; i < routesToTry.length; i++) {
    const route = routesToTry[i];
    const startTime = Date.now(); // Capture start time
    console.log(`[BrewAssistEngine] Attempting route ${i + 1}/${routesToTry.length}: ${route.provider} -> ${route.model}`);
    try {
      let content: string | undefined; // Allow undefined for content
      let rawResult: any; // To capture raw result for ok:false check

      if (route.provider === "nims") { // Check provider directly
        console.log(`[BrewAssistEngine] Calling NIMs provider with model: ${route.model}`);
        content = await callNimsProvider(route.model, messages);
      } else {
        console.log(`[BrewAssistEngine] Calling provider: ${route.provider} with model: ${route.model}`);
        rawResult = await callProvider(route.provider, route.model, messages); // Assuming callProvider returns string
        content = rawResult; // If callProvider returns string
      }

      // If callProvider returns an object with ok:false, treat as failure
      if (rawResult && typeof rawResult === 'object' && (rawResult as any).ok === false) {
        const msg = (rawResult as any).error ?? "ok:false without error";
        failureLog.push({ provider: route.provider, error: firstLine(msg) });
        lastError = msg;
        continue;
      }

      if (!content) {
        const msg = `Provider returned empty result`;
        failureLog.push({ provider: route.provider, error: msg });
        lastError = msg;
        continue;
      }

      latencyMs = Date.now() - startTime; // Calculate latency
      console.log(`[BrewAssistEngine] Route ${i + 1} succeeded in ${latencyMs}ms.`);

      providerUsed = route.provider;
      modelUsed = route.model;
      routeType = i === 0 ? route.routeType : 'fallback'; // Mark as fallback if not the first attempt

      // 🔎 BrewTruth grading hook (works for any provider, including NIMs)
      let truth: BrewTruthAttachment | null = null; // Initialize to null
      console.log("BREWTRUTH_ENABLED:", process.env.BREWTRUTH_ENABLED); // Debug log
      const BREWTRUTH_ENABLED = process.env.BREWTRUTH_ENABLED === "true";

      if (BREWTRUTH_ENABLED) {
        console.log("BrewTruth grading block entered."); // Debug log
        try {
          const providerTrace: BrewTruthModelTrace = {
            provider: providerUsed,
            model: modelUsed,
            routeType: routeType,
            latencyMs: latencyMs, // Pass latency
          };
          const report = await runBrewTruth({
            prompt: input,
            response: content,
            mode: mode,
            providerTrace: providerTrace,
          });

          truth = {
            version: report.version,
            truthScore: report.overallScore,
            riskLevel: mapBrewTruthTierToRiskLevel(report.tier),
            flags: report.flags,
            notes: report.summary,
          };
          // S4.9c Logging: Add a console log on the server when BrewTruth is present
          console.log("BrewTruth verdict", {
            truthScore: truth.truthScore,
            riskLevel: truth.riskLevel,
            flags: truth.flags,
          });
          // TODO(S4.9c): Log into BrewLast once that engine is online.
        } catch (err) {
          console.warn('[BrewTruth] Grading failed in engine:', err);
          // Truth stays null; BrewAssist still returns normal answer.
        }
      }

      return {
        result: {
          role: "assistant",
          content: content,
        },
        provider: providerUsed,
        model: modelUsed,
        routeType,
        latencyMs,
        modelRoleUsed: mode, // Use mode directly
        truth,
        blockedByTruth: false, // Not blocked by truth if we reached here
      };
    } catch (e) {
      lastError = e;
      failureLog.push({ provider: route.provider, error: firstLine(e) });
      console.error(`[BrewAssistEngine] Provider failed: ${route.provider}`, firstLine(e));
      continue;
    }
  }

  // If we get here, all providers failed
  console.error("[BrewAssistEngine] All provider attempts failed.", { failureLog });
  throw new Error(
    "All providers failed for BrewAssistEngine. Failures:\n" +
    failureLog.map(f => `- ${f.provider}: ${f.error}`).join("\n")
  );
}

// S4.9c: Simple Guardrail Hook for MCP / “dangerous-ish” actions
export function shouldBlockActionFromTruth(
  truth?: BrewTruthAttachment | null
): boolean {
  if (!truth) return false;
  if (truth.riskLevel === "high") return true;
  if (truth.truthScore < 0.4) return true;
  return false;
}
