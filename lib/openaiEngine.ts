import type { BrewMode } from './brewModes';
import type { BrewTruthReport } from './brewtruth';

// lib/openaiEngine.ts

/**
 * OpenAI (ChatGPT) engine wrapper for BrewAssist.
 * Uses the Chat Completions API.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL =
  process.env.OPENAI_MODEL ||
  process.env.NEXT_PUBLIC_OPENAI_MODEL ||
  'gpt-4.1-mini';

export type OpenAIResult = {
  output: string;
  engine: 'chatgpt';
  emoji: '🟦';
  raw?: any;
  mode?: BrewMode;
  truth?: BrewTruthReport;
  autoProceeded?: boolean;
};

export async function callOpenAI(
  prompt: string,
  options?: {
    mode?: BrewMode;
    truth?: BrewTruthReport;
    autoProceeded?: boolean;
  }
): Promise<OpenAIResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const trimmed = `${prompt ?? ''}`.trim();
  if (!trimmed) {
    return {
      output: 'Please enter a prompt for BrewAssist / ChatGPT to respond to.',
      engine: 'chatgpt',
      emoji: '🟦',
    };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are ChatG, the OpenAI layer inside the BrewAssist DevOps Cockpit. ' +
            'Respond concisely, keep a professional but friendly tone, and respect that ' +
            'the user is an advanced architect; no basic tutorials unless asked.',
        },
        { role: 'user', content: trimmed },
      ],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `OpenAI HTTP ${res.status}: ${res.statusText || ''}${
        text ? ` - ${text}` : ''
      }`.trim()
    );
  }

  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content?.trim?.() ??
    '⚠️ ChatGPT returned an empty response.';

  return {
    output: content,
    engine: 'chatgpt',
    emoji: '🟦',
    raw: data,
    ...options,
  };
}
