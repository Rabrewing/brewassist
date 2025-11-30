// lib/brewassistChain.ts
/**
 * BrewAssist engine chain:
 * 1) OpenAI + Toolbelt (Tier 1)
 * 2) Plain OpenAI chat
 * 3) Gemini CLI (reasoning-only fallback)
 */

import { runWithToolbelt } from './openaiToolbelt';
import { callOpenAI } from './openaiEngine';
import { runGeminiCli } from './geminiCli';
import type { BrewMode } from './brewModes';
import type { BrewTruthResult } from './brewtruth';

export type BrewAssistResult = {
  output: string;
  engine: string;
  emoji: string;
  raw?: any;
  mode?: BrewMode;
  truth?: BrewTruthResult;
  autoProceeded?: boolean;
};

function asCleanString(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input == null) return '';
  return String(input);
}

export async function runBrewAssistChain(
  prompt: unknown,
  options?: {
    mode?: BrewMode;
    truth?: BrewTruthResult;
    autoProceeded?: boolean;
  }
): Promise<BrewAssistResult> {
  const text = asCleanString(prompt).trim();

  if (!text) {
    return {
      output: 'Please enter a prompt for BrewAssist to respond to.',
      engine: 'system',
      emoji: '⚠️',
    };
  }

  // 1) Toolbelt-first attempt
  try {
    const tb = await runWithToolbelt(text, options);

    if (tb.usedTools) {
      return {
        output: tb.output,
        engine: 'openai+toolbelt',
        emoji: '🛠️',
        raw: tb.raw,
        ...options,
      };
    }

    // No tools used, but we got a normal answer from ChatGPT
    if (tb.output) {
      return {
        output: tb.output,
        engine: 'chatgpt',
        emoji: '🟦',
        raw: tb.raw,
        ...options,
      };
    }
  } catch (err) {
    console.error('Toolbelt failed, falling back to plain OpenAI:', err);
  }

  // 2) Plain OpenAI chat fallback
  try {
    const res = await callOpenAI(text, options);
    return {
      output: res.output,
      engine: res.engine,
      emoji: res.emoji,
      raw: res.raw,
      ...options,
    };
  } catch (err) {
    console.error('OpenAI failed, falling back to Gemini CLI:', err);
  }

  // 3) Gemini CLI reasoning-only fallback
  try {
    const g = await runGeminiCli(text);
    return {
      output: g,
      engine: 'gemini-cli',
      emoji: '✨',
      ...options,
    };
  } catch (err) {
    console.error('Gemini CLI fallback also failed:', err);
  }

  return {
    output:
      'All engines failed (Toolbelt → OpenAI → Gemini). Please check server logs.',
    engine: 'system',
    emoji: '❌',
    ...options,
  };
}
