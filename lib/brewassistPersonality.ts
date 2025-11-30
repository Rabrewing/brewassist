// lib/brewassistPersonality.ts
// S4.4 — BrewAssist Personality Layer
// Lightweight, stateless helpers that shape tone + RB-aware behavior.

export type BrewRiskMode = 'HARD' | 'SOFT' | 'RB';

export interface BrewAssistPersonalityConfig {
  devName: string; // e.g. "RB"
  mode: BrewRiskMode; // risk gating mode
  maxContextMessages: number; // how many recent turns to keep
}

export interface BrewAssistContextMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface BrewAssistPersonalityState {
  config: BrewAssistPersonalityConfig;
  recentMessages: BrewAssistContextMessage[];
}

export interface BrewAssistPersonalityInput {
  userPrompt: string;
  toolName?: string;
  lastToolSummary?: string;
  state: BrewAssistPersonalityState;
}

export interface BrewAssistPersonalityOutput {
  promptForModel: string;
  toneHint: 'neutral' | 'engaged' | 'high_stakes' | 'emergency';
  updatedState: BrewAssistPersonalityState;
  meta: {
    devName: string;
    mode: BrewRiskMode;
  };
}

const DEFAULT_CONFIG: BrewAssistPersonalityConfig = {
  devName: 'RB',
  mode: 'RB',
  maxContextMessages: 10,
};

/**
 * Initialize state if missing.
 */
export function initPersonalityState(
  partial?: Partial<BrewAssistPersonalityState>
): BrewAssistPersonalityState {
  return {
    config: { ...DEFAULT_CONFIG, ...(partial?.config ?? {}) },
    recentMessages: partial?.recentMessages ?? [],
  };
}

/**
 * Very small heuristic for tone based on prompt + last tool summary.
 * S4.4+ can evolve this into full emotional tiers.
 */
function inferTone(
  prompt: string,
  lastToolSummary?: string
): BrewAssistPersonalityOutput['toneHint'] {
  const lower = prompt.toLowerCase();

  if (
    lower.includes('urgent') ||
    lower.includes('prod') ||
    lower.includes('production')
  ) {
    return 'high_stakes';
  }
  if (lastToolSummary && /error|failed|crash|panic/i.test(lastToolSummary)) {
    return 'high_stakes';
  }
  if (lower.includes('help') || lower.includes('explain')) {
    return 'engaged';
  }
  return 'neutral';
}

/**
 * Core personality shaper.
 * - Injects RB-aware framing
 * - Adds short context banner
 * - Produces toneHint for downstream risk engine
 */
export function applyPersonalityLayer(
  input: BrewAssistPersonalityInput
): BrewAssistPersonalityOutput {
  const state = initPersonalityState(input.state);
  const toneHint = inferTone(input.userPrompt, input.lastToolSummary);

  const contextBannerParts: string[] = [];

  contextBannerParts.push(
    `You are BrewAssist, RB's DevOps co-pilot. Talk like a focused teammate, not a generic assistant.`
  );
  contextBannerParts.push(
    `RB prefers direct, decisive answers with clear next steps. Avoid over-apologizing or hedging.`
  );
  contextBannerParts.push(
    `Risk mode: ${state.config.mode}. If you see dangerous actions, surface them clearly for the risk engine.`
  );

  if (input.toolName) {
    contextBannerParts.push(`Tool in play: ${input.toolName}.`);
  }
  if (input.lastToolSummary) {
    contextBannerParts.push(`Last tool result: ${input.lastToolSummary}`);
  }

  const contextBanner = contextBannerParts.join(' ');

  const promptForModel = [
    contextBanner,
    '',
    `RB says: ${input.userPrompt}`,
  ].join('\n');

  // update rolling context
  const now = new Date().toISOString();
  const updatedMessages: BrewAssistContextMessage[] = [
    ...state.recentMessages,
    {
      role: 'user' as const,
      content: input.userPrompt,
      timestamp: now,
    },
  ].slice(-state.config.maxContextMessages);

  return {
    promptForModel,
    toneHint,
    updatedState: {
      ...state,
      recentMessages: updatedMessages,
    },
    meta: {
      devName: state.config.devName,
      mode: state.config.mode,
    },
  };
}
