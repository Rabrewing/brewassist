// pages/api/llm.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { runOpenAIChat } from '@/lib/openaiClient';

type LlmBody = {
  prompt?: string;
  // optional override for future (e.g. engine: 'openai')
  engine?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body as LlmBody;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Missing prompt for /llm' });
    }

    const output = await runOpenAIChat(prompt.trim());

    return res.status(200).json({
      engine: 'openai',
      emoji: '🧠',
      output,
    });
  } catch (err: any) {
    console.error('LLM / OpenAI error:', err);
    return res.status(500).json({
      error: `OpenAI error: ${String(err?.message || err)}`,
    });
  }
}
