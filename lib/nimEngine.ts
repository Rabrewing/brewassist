/**
 * NVIDIA NIM engine wrapper for BrewAssist.
 * Uses an OpenAI-compatible /v1/chat/completions endpoint.
 *
 * Role: research persona (deep reasoning, docs, R&D).
 */

const NIM_API_URL =
  process.env.NIM_API_URL || 'http://127.0.0.1:8000/v1/chat/completions';

const NIM_API_KEY = process.env.NIM_API_KEY || '';
const NIM_MODEL =
  process.env.NIM_MODEL ||
  process.env.NEXT_PUBLIC_NIM_MODEL ||
  'nim-research-1';

export type NIMResult = {
  output: string;
  engine: 'nim';
  emoji: '🧪';
  raw?: any;
};

function asCleanString(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input == null) return '';
  return String(input);
}

export async function callNIM(prompt: string): Promise<NIMResult> {
  const trimmed = asCleanString(prompt).trim();

  if (!trimmed) {
    return {
      output:
        'Please enter a prompt for the NIM research engine to respond to.',
      engine: 'nim',
      emoji: '🧪',
    };
  }

  if (!NIM_API_URL) {
    throw new Error('NIM_API_URL is not set');
  }

  // Build request payload (OpenAI-style)
  const body = {
    model: NIM_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are the NIM Researcher inside BrewAssist. ' +
          'You focus on deep research, comparisons, and technical breakdowns. ' +
          'Keep answers structured and helpful for an advanced architect.',
      },
      { role: 'user', content: trimmed },
    ],
    temperature: 0.4,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (NIM_API_KEY) {
    headers['Authorization'] = `Bearer ${NIM_API_KEY}`;
  }

  const res = await fetch(NIM_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `NIM HTTP ${res.status}: ${res.statusText || ''}${
        text ? ` - ${text}` : ''
      }`.trim()
    );
  }

  const data = await res.json();

  const content =
    data?.choices?.[0]?.message?.content?.trim?.() ??
    '⚠️ NIM returned an empty response.';

  return {
    output: content,
    engine: 'nim',
    emoji: '🧪',
    raw: data,
  };
}
