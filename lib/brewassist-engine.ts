import { getModelProviders, BrewProviderId, BrewRoute, getModelRoutes, resolveRoute, BrewRouteType } from "../lib/model-router";
import { BrewTier } from '@/lib/commands/types'; // Import BrewTier from commands/types
import type { CockpitMode } from "./brewTypes";
import type { ScopeCategory } from "./intent-gatekeeper"; // Import ScopeCategory

export type EngineBrewAssistMode = "hrm" | "llm" | "agent" | "loop";

export interface BrewAssistEngineOptions {
  prompt: string;
  mode: EngineBrewAssistMode;
  cockpitMode: CockpitMode;
  tier: BrewTier;
  intent: ScopeCategory; // Add intent here
  preferredProvider?: BrewProviderId;
  useResearchModel?: boolean;
}

async function callProviderStream(
  provider: BrewProviderId,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, // Note: 'system' role is not supported by all providers
  onChunk: (chunk: string) => void
): Promise<void> {
  const providers = getModelProviders();
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
      if (!apiKey) {
        throw new Error(`API key not set for provider: ${provider}`);
      }
      const base = (providerConfig.baseUrl?.replace(/\/+$/, "") || "https://api.openai.com/v1");
      url = `${base}/chat/completions`;
      headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };
      requestBody = { model, messages, temperature: 0.7, stream: true };
      break;
    }
    case 'gemini': {
      apiKey = providerConfig.apiKey;
      if (!apiKey) {
        throw new Error(`API key not set for provider: ${provider}`);
      }
      const base = (providerConfig.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models").replace(/\/+$/, "");
      url = `${base}/${model}:streamGenerateContent?key=${apiKey}`; // Use streamGenerateContent for streaming
      headers = { "Content-Type": "application/json" };
      requestBody = { contents: messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, parts: [{ text: m.content }] })) };
      break;
    }
    default: { // Added curly braces
      // For non-streaming providers, simulate a single chunk
      const response = await callProvider(provider, model, messages);
      onChunk(response);
      return;
    } // Added curly braces
  }



  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Provider ${provider} returned status ${res.status}: ${text}`);
  }

  if (res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = ""; // Buffer to accumulate partial JSON data
    let jsonBuffer = ""; // Buffer for partial JSON objects

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      buffer += chunk;

      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);

        if (line.startsWith('data: ')) {
          const data = line.substring(6);
          if (data.trim() === '[DONE]') {
            return;
          }
          jsonBuffer += data; // Accumulate data

          // Attempt to parse only if it looks like a complete JSON object
          if (jsonBuffer.startsWith('{') && jsonBuffer.endsWith('}')) {
            try {
              const json = JSON.parse(jsonBuffer); // Try parsing the accumulated data
              jsonBuffer = ""; // Clear buffer on successful parse
              let content;

              if (provider === 'openai') {
                content = json.choices?.[0]?.delta?.content;
              } else if (provider === 'gemini') {
                content = json.candidates?.[0]?.content?.parts?.[0]?.text;
              }
              // Fallback for generic SSE chunk events (like those from mocks)
              if (!content && typeof json.text === 'string') {
                content = json.text;
              }
              // Add other providers here if they have different streaming formats

              let chunkText = "";
              if (typeof content === "string") {
                chunkText = content;
              } else if (content && typeof content === "object") {
                if (typeof (content as any).text === "string") chunkText = (content as any).text;
                else if (typeof (content as any).content === "string") chunkText = (content as any).content;
                else if (typeof (content as any).message?.content === "string") chunkText = (content as any).message.content;
                else chunkText = JSON.stringify(content);
              }

              if (chunkText) {
                onChunk(chunkText);
              }
            } catch (e) {
              // If parsing fails, it means we have a partial JSON object, continue accumulating
              // console.error('Partial JSON, accumulating:', e); // For debugging
            }
          }
        } else if (line.length > 0) {
          // If it's not a data: line, but it's not empty, treat it as a raw chunk
          onChunk(line);
        }
      }
    }
  }
}

// A simplified non-streaming callProvider for fallback
async function callProvider(
  provider: BrewProviderId,
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
): Promise<string> {
    const providers = getModelProviders();
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
            const base = (providerConfig.baseUrl?.replace(/\/+$/, "") || "https://api.openai.com/v1");
            url = `${base}/chat/completions`;
            headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
            requestBody = { model, messages, temperature: 0.7 };
            break;
        }

        case 'gemini': {
            apiKey = providerConfig.apiKey;
            const base = (providerConfig.baseUrl || "https://generativelanguage.googleapis.com/v1beta/models").replace(/\/+$/, "");
            url = `${base}/${model}:generateContent?key=${apiKey}`; // Use generateContent for non-streaming
            headers = { "Content-Type": "application/json" };
            requestBody = { contents: messages.map(m => ({ role: m.role === 'system' ? 'user' : m.role, parts: [{ text: m.content }] })) };
            break;
        }

        case 'mistral': {
            apiKey = providerConfig.apiKey;
            const mistralBase = (providerConfig.baseUrl?.replace(/\/+$/, "") || "https://api.mistral.ai/v1");
            url = `${mistralBase}/chat/completions`;
            headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
            requestBody = { model, messages, temperature: 0.7 };
            break;
        }
        case 'tinyllm':
            url = providerConfig.baseUrl || "http://localhost:8000/chat/completions";
            headers = { "Content-Type": "application/json" };
            requestBody = { model, messages, temperature: 0.7 };
            break;
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!apiKey && provider !== 'tinyllm') {
        throw new Error(`API key not set for provider: ${provider}`);
    }

    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(requestBody) });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Provider ${provider} returned status ${res.status}: ${text}`);
    }

    const data: any = await res.json();
    let rawContent: string | undefined;

    switch (provider) {
      case 'gemini':
        rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
        break;
      case 'openai':
      case 'mistral':
      case 'tinyllm':
        rawContent = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;
        break;
      default:
        throw new Error(`Unsupported provider for content extraction: ${provider}`);
    }

    if (!rawContent) {
        throw new Error(`Response from ${provider} missing content`);
    }

    return rawContent;
}


export async function runBrewAssistEngineStream(
  opts: BrewAssistEngineOptions,
  onChunk: (chunk: string) => void,
  onEnd: (result: { provider: BrewProviderId, model: string, debugInfo?: any }) => void // Add onEnd callback
): Promise<void> {
  const { prompt, mode, cockpitMode, tier, useResearchModel, preferredProvider, intent } = opts; // Destructure intent

  const messages = [{ role: 'user' as const, content: prompt }];
  const initialRoute = resolveRoute(mode, { preferredProvider, useResearchModel, cockpitMode, tier });
  const allPossibleRoutes = getModelRoutes({ mode, cockpitMode, tier });

  const routesToTry: BrewRoute[] = [];
  if (initialRoute) {
    routesToTry.push(initialRoute);
  }
  for (const route of allPossibleRoutes) {
    if (route.provider === initialRoute?.provider && route.model === initialRoute?.model) {
      continue;
    }
    routesToTry.push(route);
  }

  if (routesToTry.length === 0) {
    // This case should ideally be caught by resolveRoute returning "system"
    throw new Error("No valid routes found for the given options.");
  }

  let lastError: unknown;

  for (const route of routesToTry) {
    if (route.provider === "system") {
      const providersConfig = getModelProviders();
      const enabledFlags = Object.entries(providersConfig).reduce((acc, [key, value]) => {
        acc[key as BrewProviderId] = value.enabled;
        return acc;
      }, {} as Record<BrewProviderId, boolean>);
      const candidateProviders = getModelRoutes({ mode, cockpitMode, tier }).map(r => ({ provider: r.provider, model: r.model }));

      onChunk("No active LLM providers found for this request, or the request was blocked by system policy.");
      onEnd({
        provider: "system",
        model: route.model,
        debugInfo: {
          mode,
          tier,
          intent,
          enabledFlags,
          candidateProviders,
        },
      });
      return;
    }
    try {
      await callProviderStream(route.provider, route.model, messages, onChunk);
      onEnd({ provider: route.provider, model: route.model, debugInfo: {} }); // Call onEnd with provider and model
      return; // Success
    } catch (e) {
      lastError = e;
      console.error(`Provider ${route.provider} failed:`, e);
    }
  }

  throw new Error(`All providers failed. Last error: ${lastError}`);
}
