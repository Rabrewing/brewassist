// lib/model-router.ts

import { pickNimsModel } from '../lib/nims-utils';

export type BrewModelRole = 'llm' | 'hrm' | 'agent' | 'loop';

export type BrewProviderId =
  | 'gemini'
  | 'openai'
  | 'mistral'
  | 'nims'
  | 'tinyllm'
  | 'system';

export type BrewRouteType =
  | 'primary'
  | 'fallback'
  | 'research'
  | 'preferred'
  | 'system-block';

export interface BrewRoute {
  provider: BrewProviderId;
  model: string;
  routeType: BrewRouteType;
}

export interface BrewProviderConfig {
  provider: BrewProviderId;
  model: string;
  routeType?: BrewRouteType; // Updated to use BrewRouteType
}

export interface ProviderConfigDetails {
  enabled: boolean;
  baseUrl: string;
  apiKey?: string; // Optional, as tinyllm doesn't have one
  primaryModel?: string;
  secondaryModel?: string;
  preferredModel?: string; // For NIMs
  fallback1Model?: string; // For NIMs
  fallback2Model?: string; // For NIMs
}

// BrewRouteConfig is no longer needed as getModelRoutes now returns BrewRoute[]

import { envBool, envStr } from './env'; // Import new helpers

export function getModelProviders(): Record<
  BrewProviderId,
  ProviderConfigDetails
> {
  const OPENAI_ENABLED =
    envBool(process.env.USE_OPENAI) && !!envStr(process.env.OPENAI_API_KEY);
  const GEMINI_ENABLED =
    envBool(process.env.USE_GEMINI) && !!envStr(process.env.GEMINI_API_KEY);
  const MISTRAL_ENABLED =
    envBool(process.env.USE_MISTRAL) && !!envStr(process.env.MISTRAL_API_KEY);
  const NIMS_ENABLED =
    envBool(process.env.NIMS_ENABLED) && !!envStr(process.env.NIMS_API_KEY);

  const providers = {
    openai: {
      enabled: OPENAI_ENABLED,
      baseUrl:
        envStr(process.env.OPENAI_BASE_URL) ?? 'https://api.openai.com/v1',
      apiKey: envStr(process.env.OPENAI_API_KEY),
      primaryModel: envStr(process.env.LLM_PRIMARY_MODEL) ?? 'gpt-4o-mini', // Added explicit default
      secondaryModel: envStr(process.env.OPENAI_MODEL) ?? 'gpt-4o', // Added explicit default
    },
    gemini: {
      enabled: GEMINI_ENABLED,
      baseUrl:
        envStr(process.env.GEMINI_BASE_URL) ??
        'https://generativelanguage.googleapis.com/v1beta/models',
      apiKey: envStr(process.env.GEMINI_API_KEY),
      primaryModel:
        envStr(process.env.GEMINI_MODEL_PRIMARY) ?? 'gemini-1.5-flash', // Added explicit default
      secondaryModel:
        envStr(process.env.GEMINI_MODEL_SECONDARY) ?? 'gemini-1.5-pro', // Added explicit default
    },
    mistral: {
      enabled: MISTRAL_ENABLED,
      baseUrl:
        envStr(process.env.MISTRAL_BASE_URL) ?? 'https://api.mistral.ai/v1',
      apiKey: envStr(process.env.MISTRAL_API_KEY),
      primaryModel:
        envStr(process.env.MISTRAL_MODEL_PRIMARY) ?? 'mistral-small-latest', // Added explicit default
      secondaryModel:
        envStr(process.env.MISTRAL_MODEL_SECONDARY) ?? 'mistral-large-latest', // Added explicit default
    },
    nims: {
      enabled: NIMS_ENABLED,
      baseUrl:
        envStr(process.env.NIMS_BASE_URL) ??
        'https://integrate.api.nvidia.com/v1',
      apiKey: envStr(process.env.NIMS_API_KEY),
      preferredModel:
        envStr(process.env.NIMS_MODEL_PREFERRED) ?? 'nemotron-3-8b-instruct', // Added explicit default
      fallback1Model:
        envStr(process.env.NIMS_MODEL_FALLBACK_1) ?? 'llama-3.1-8b-instruct', // Added explicit default
      fallback2Model:
        envStr(process.env.NIMS_MODEL_FALLBACK_2) ?? 'mistral-7b-instruct', // Added explicit default
    },
    tinyllm: {
      enabled: true, // Local only, always enabled
      baseUrl:
        envStr(process.env.TINYLLM_BASE_URL) ??
        'http://localhost:8000/chat/completions',
      apiKey: undefined, // No API key for local
      primaryModel: 'tiny-llm-local',
    },
    system: {
      // Added system provider
      enabled: true,
      baseUrl: 'system',
      primaryModel: 'toolbelt-guard',
    },
  };

  return providers;
}

function isEnabled(cfg?: ProviderConfigDetails) {
  return !!cfg?.enabled;
}

function pickPrimaryModel(
  pid: BrewProviderId,
  cfg: ProviderConfigDetails
): string | undefined {
  if (pid === 'nims') return cfg.preferredModel; // NIMs uses preferredModel
  return cfg.primaryModel;
}

export function getModelRoutes(opts: {
  mode: BrewModelRole;
  cockpitMode?: string;
  tier?: string;
}): BrewRoute[] {
  const providers = getModelProviders();
  const reasons: string[] = [];
  const routes: BrewRoute[] = [];

  const rawMode = (opts?.mode ?? '').toString();
  const mode = rawMode.trim().toLowerCase(); // "LLM" -> "llm"

  const safe = (
    provider: BrewProviderId,
    model: string | undefined,
    routeType: BrewRouteType
  ): BrewRoute | null => {
    if (!model) {
      reasons.push(`${provider}_model_undefined`);
      return null;
    }
    return { provider, model, routeType };
  };

  const isChatLane =
    mode === 'llm' || mode === 'chat' || mode === 'hrm' || mode === 'assist';

  const isToolLane = mode === 'tool' || mode === 'toolbelt' || mode === 'mcp';

  if (!isChatLane && !isToolLane) {
    reasons.push(`mode_not_recognized:${rawMode}`);
  }

  if (isChatLane) {
    if (providers.openai.enabled) {
      const route = safe('openai', providers.openai.primaryModel, 'primary');
      if (route) routes.push(route);
    } else {
      reasons.push('openai_disabled_for_chat');
    }

    if (providers.gemini.enabled) {
      const route = safe('gemini', providers.gemini.primaryModel, 'fallback');
      if (route) routes.push(route);
    } else {
      reasons.push('gemini_disabled_for_chat');
    }

    if (providers.mistral.enabled) {
      const route = safe('mistral', providers.mistral.primaryModel, 'fallback');
      if (route) routes.push(route);
    } else {
      reasons.push('mistral_disabled_for_chat');
    }

    // TinyLLM is always enabled as a local fallback
    const tinyLlmRoute = safe(
      'tinyllm',
      providers.tinyllm.primaryModel,
      'fallback'
    );
    if (tinyLlmRoute) routes.push(tinyLlmRoute);
  } else if (mode === 'agent' || mode === 'loop') {
    // If agent/loop modes are active, and no specific routes have been added yet,
    // fallback to primary LLM providers.
    if (providers.openai.enabled) {
      const route = safe('openai', providers.openai.primaryModel, 'fallback');
      if (route) routes.push(route);
    } else {
      reasons.push('openai_disabled_for_agent_loop');
    }

    if (providers.gemini.enabled) {
      const route = safe('gemini', providers.gemini.primaryModel, 'fallback');
      if (route) routes.push(route);
    } else {
      reasons.push('gemini_disabled_for_agent_loop');
    }

    if (providers.mistral.enabled) {
      const route = safe('mistral', providers.mistral.primaryModel, 'fallback');
      if (route) routes.push(route);
    } else {
      reasons.push('mistral_disabled_for_agent_loop');
    }

    const tinyLlmRoute = safe(
      'tinyllm',
      providers.tinyllm.primaryModel,
      'fallback'
    );
    if (tinyLlmRoute) routes.push(tinyLlmRoute);
  }

  if (isToolLane) {
    // tool policy checks… (add specific tool routes here)
    reasons.push('tool_lane_not_fully_implemented'); // Placeholder
  }

  if (process.env.BREW_DEBUG_ROUTER === '1') {
    console.log('[ModelRouter] route build result', {
      rawMode,
      mode,
      cockpitMode: opts?.cockpitMode,
      tier: opts?.tier,
      routesLen: routes.length,
      reasons,
    });
  }

  return routes;
}

export function resolveRoute(
  role: BrewModelRole,
  opts: {
    preferredProvider?: BrewProviderId;
    useResearchModel?: boolean;
    cockpitMode?: string;
    tier?: string;
  } = {}
): BrewRoute {
  const providers = getModelProviders();
  const routes = getModelRoutes({ mode: role, ...opts });

  // 1) Preferred provider (must be enabled + have a model)
  if (opts.preferredProvider) {
    const cfg = providers[opts.preferredProvider];
    if (cfg?.enabled) {
      const model = pickPrimaryModel(opts.preferredProvider, cfg);
      if (model) {
        return {
          provider: opts.preferredProvider,
          model,
          routeType: 'preferred',
        };
      }
    }
  }

  // 2) Research route (NIMs)
  if (opts.useResearchModel) {
    const nims = providers.nims;
    if (nims?.enabled && nims.preferredModel) {
      return {
        provider: 'nims',
        model: nims.preferredModel,
        routeType: 'research',
      };
    }
  }

  // 3) Default primary route (or first available)
  const primary = routes.find((r) => r.routeType === 'primary');
  if (primary) return primary;

  const first = routes[0];
  if (first) return first;

  // 4) If nothing exists, hard stop with system-block
  return {
    provider: 'system',
    model: 'toolbelt-guard',
    routeType: 'system-block',
  };
}
