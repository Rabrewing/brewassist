import { DEFAULT_PERSONA } from "../lib/brewConfig";
import { resolveRoute, BrewModelRole, BrewProviderId, getModelRoutes, getModelProviders, BrewRoute, BrewRouteType } from "../lib/model-router";
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

// --- S4.8f NIMs Auto-Discovery Logic ---

// 1-token health check for NIMs models
async function probeNimsModel(model: string): Promise<boolean> {
  const NIMS_API_KEY = process.env.NIMS_API_KEY;
  const NIMS_BASE_URL = process.env.NIMS_BASE_URL?.replace(/\/+$/, "") || "https://integrate.api.nvidia.com/v1";

  if (!NIMS_API_KEY) {
    console.warn("NIMs API key not set for probe.");
    return false;
  }

  try {
    const res = await fetch(`${NIMS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NIMS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1
      }),
      signal: AbortSignal.timeout(Number(process.env.NIMS_TIMEOUT_MS ?? 5000)) // 5 second timeout for probe
    });

    // We only care if it's OK (200-299). 400s, 401s, 404s all mean it's not working for us.
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`NIMs probe failed for model ${model}: ${res.status} ${text.substring(0, 100)}...`);
    }
    return res.ok;
  } catch (error) {
    console.warn(`NIMs probe network error for model ${model}:`, (error as Error).message);
    return false;
  }
}

// Finds the first working NIMs model from a list of env keys
export async function pickNimsModel(modelEnvKeys: string[]): Promise<string | null> {
  if (process.env.NIMS_ENABLED !== "true") {
    console.log("NIMs is disabled via NIMS_ENABLED env var.");
    return null;
  }

  const modelsToProbe = modelEnvKeys
    .map(key => process.env[key])
    .filter(Boolean) as string[];

  for (const model of modelsToProbe) {
    console.log(`Probing NIMs model: ${model}`);
    const ok = await probeNimsModel(model);
    if (ok) {
      console.log(`NIMs model ${model} is active.`);
      return model;
    }
  }

  console.warn("No active NIMs model found from configured list.");
  return null; // No working NIMs model found
}

// --- End S4.8f NIMs Auto-Discovery Logic ---

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
      url = providerConfig.baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
  const initialRoute = resolveRoute(mode, { preferredProvider, useResearchModel });

  // Build the fallback chain. If a preferred provider is used, it's the first in the chain.
  // Otherwise, the primary route for the role is first, followed by its fallbacks.
  const routesToTry: BrewRoute[] = [];

  if (initialRoute.routeType === 'preferred') {
    routesToTry.push(initialRoute);
    // Add the role's primary and fallback routes as subsequent fallbacks
    const roleRoutes = getModelRoutes(mode);
    const primaryRoleRoute = roleRoutes.find(r => r.routeType === 'primary');
    if (primaryRoleRoute && primaryRoleRoute.provider !== initialRoute.provider) {
      routesToTry.push(primaryRoleRoute);
    }
    roleRoutes.filter(r => r.routeType === 'fallback' && r.provider !== initialRoute.provider).forEach(r => routesToTry.push(r));
  } else if (initialRoute.routeType === 'research') {
    // For research routes, we need to dynamically pick the best NIMs model.
    // The initialRoute from resolveRoute is just a placeholder for NIMs.
    const providers = getModelProviders();
    const nimsConfig = providers.nims;

    if (nimsConfig.enabled) {
      const selectedNimsModel = await pickNimsModel([
        "NIMS_MODEL_PREFERRED",
        "NIMS_MODEL_FALLBACK_1",
        "NIMS_MODEL_FALLBACK_2",
      ]);

      if (selectedNimsModel) {
        routesToTry.push({
          provider: 'nims',
          model: selectedNimsModel,
          routeType: 'research',
        });
      }
    }

    // If NIMs is not enabled, or no NIMs model is found, fall back to the role's primary route.
    const roleRoutes = getModelRoutes(mode);
    const primaryRoleRoute = roleRoutes.find(r => r.routeType === 'primary');
    if (primaryRoleRoute) {
      routesToTry.push(primaryRoleRoute);
    }
  } else {
    // Default case: initialRoute is primary, add all role routes
    routesToTry.push(...getModelRoutes(mode));
  }

        let lastError: unknown;
    let providerUsed: BrewProviderId = 'openai'; // Default to avoid undefined
    let modelUsed: string = 'unknown';
    let routeType: BrewRouteType = 'primary';
    let latencyMs: number = 0;
    const modelRoleUsed: string = mode; // Assuming mode is the modelRoleUsed
  
    for (let i = 0; i < routesToTry.length; i++) {
      const route = routesToTry[i];
      const startTime = Date.now(); // Capture start time
      try {
        let content: string;
        if (route.routeType === 'research' && route.provider === 'nims') {
          // Special call for NIMs
          content = await callNimsProvider(route.model, messages);
        } else {
          content = await callProvider(route.provider, route.model, messages);
        }
        latencyMs = Date.now() - startTime; // Calculate latency
  
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
        };    } catch (err) {
      lastError = err;
      console.error(
        `Provider ${route.provider} failed for role ${mode}, trying next fallback…`,
        err
      );
      // Continue to next route
    }
  }

  // If we get here, all providers failed
  throw lastError ?? new Error("All providers failed for BrewAssistEngine.");
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
