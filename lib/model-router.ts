// lib/model-router.ts

export type BrewModelRole = 'llm' | 'hrm' | 'agent' | 'loop';

export type BrewProviderId = 'gemini' | 'openai' | 'mistral' | 'nims' | 'tinyllm' | 'system';

export type BrewRouteType = "primary" | "fallback" | "research" | "preferred" | "system-block";

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

export function getModelProviders(): Record<BrewProviderId, ProviderConfigDetails> {
  return {
    openai: {
      enabled: !!process.env.OPENAI_API_KEY, // Enabled if API key is present
      baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
      apiKey: process.env.OPENAI_API_KEY,
      primaryModel: process.env.LLM_PRIMARY_MODEL ?? "gpt-4.1-mini",
      secondaryModel: process.env.OPENAI_MODEL ?? "gpt-4.1",
    },
    gemini: {
      enabled: !!process.env.GEMINI_API_KEY, // Enabled if API key is present
      baseUrl: process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/models",
      apiKey: process.env.GEMINI_API_KEY,
      primaryModel: process.env.GEMINI_MODEL_PRIMARY ?? "gemini-2.0-flash",
      secondaryModel: process.env.GEMINI_MODEL_SECONDARY ?? "gemini-2.0-pro",
    },
    mistral: {
      enabled: process.env.MISTRAL_ENABLED === "true" && !!process.env.MISTRAL_API_KEY,
      baseUrl: process.env.MISTRAL_BASE_URL ?? "https://api.mistral.ai/v1",
      apiKey: process.env.MISTRAL_API_KEY,
      primaryModel: process.env.MISTRAL_MODEL_PRIMARY ?? "mistral-small-latest",
      secondaryModel: process.env.MISTRAL_MODEL_SECONDARY ?? "mistral-large-latest",
    },
    nims: {
      enabled: process.env.NIMS_ENABLED === "true" && !!process.env.NIMS_API_KEY,
      baseUrl: process.env.NIMS_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NIMS_API_KEY,
      preferredModel: process.env.NIMS_MODEL_PREFERRED ?? "nemotron-3-8b-instruct",
      fallback1Model: process.env.NIMS_MODEL_FALLBACK_1 ?? "llama-3.1-8b-instruct",
      fallback2Model: process.env.NIMS_MODEL_FALLBACK_2 ?? "mistral-7b-instruct",
    },
    tinyllm: {
      enabled: true, // Local only, always enabled
      baseUrl: process.env.TINYLLM_BASE_URL ?? "http://localhost:8000/chat/completions",
      apiKey: undefined, // No API key for local
      primaryModel: "tiny-llm-local",
    },
    system: { // Added system provider
      enabled: true,
      baseUrl: "system",
      primaryModel: "toolbelt-guard",
    },
  };
}

export function getModelRoutes(role: BrewModelRole): BrewRoute[] {
  const providers = getModelProviders(); // Get dynamic providers

  switch (role) {
    case "llm":
      return [
        {
          provider: "openai",
          model: providers.openai.primaryModel!,
          routeType: "primary",
        },
        {
          provider: "gemini",
          model: providers.gemini.primaryModel!,
          routeType: "fallback",
        },
        {
          provider: "mistral", // Added Mistral as a fallback for LLM role
          model: providers.mistral.primaryModel!,
          routeType: "fallback",
        },
      ];
    case "hrm":
      return [
        {
          provider: "gemini",
          model: providers.gemini.primaryModel!,
          routeType: "primary",
        },
        {
          provider: "openai",
          model: providers.openai.secondaryModel!,
          routeType: "fallback",
        },
      ];
    case "agent":
      return [
        {
          provider: "openai",
          model: providers.openai.primaryModel!,
          routeType: "primary",
        },
        {
          provider: "mistral",
          model: providers.mistral.primaryModel!,
          routeType: "fallback",
        },
      ];
    case "loop":
      return [
        {
          provider: "openai",
          model: providers.openai.primaryModel!,
          routeType: "primary",
        },
        {
          provider: "tinyllm",
          model: providers.tinyllm.primaryModel!,
          routeType: "fallback",
        },
      ];
    default:
      return [];
  }
}

import { pickNimsModel } from './brewassist-engine';

export function resolveRoute(

  role: BrewModelRole,

  opts: { preferredProvider?: BrewProviderId; useResearchModel?: boolean } = {}

): BrewRoute {

  const providers = getModelProviders();

  const routes = getModelRoutes(role);



  // 1) Preferred provider, if enabled + has key

  if (opts.preferredProvider) {

    const cfg = providers[opts.preferredProvider];

    if (cfg?.enabled && cfg.primaryModel) {

      return {

        provider: opts.preferredProvider,

        model: cfg.primaryModel,

        routeType: "preferred",

      };

    }

  }



    // 2) Handle Research Model (NIMs)



    if (opts?.useResearchModel) {



      const providers = getModelProviders();



      const nimsConfig = providers.nims;



      if (nimsConfig.enabled) {



        // We need to find the best NIMs model here.



        // The pickNimsModel function is in brewassist-engine.ts, so we can't call it directly here.



        // resolveRoute should return the *intent* to use NIMs, and runBrewAssistEngine will pick the model.



        // So, we return a generic NIMs route here.



        return {



          provider: 'nims',



          model: nimsConfig.preferredModel || 'nemotron-3-8b-instruct', // Use preferred or a default



          routeType: 'research',



        };



      }



    }



  



    // 3) Default to Primary Route



    const primary = routes.find((r) => r.routeType === "primary");



    if (!primary) {



      throw new Error(`No primary route found for role: ${role}`);



    }



    return primary;



  }
