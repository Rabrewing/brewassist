import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistEngine } from '@/lib/brewassist-engine';
import { BrewModelRole } from '@/lib/model-router';
import { BrewTruthReport } from '@/lib/brewtruth';

type BrewAssistApiResponse =
  | {
      ok: true;
      message: { role: 'assistant'; content: string };
      text: string;
      provider: string;
      model: string;
      routeType: 'primary' | 'fallback' | 'research' | 'preferred';
      truthReport: BrewTruthReport | null;
    }
  | {
      ok: false;
      error: string;
      details?: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<BrewAssistApiResponse>) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { input, mode = 'llm', useResearchModel = false, preferredProvider } = req.body ?? {}; // Added preferredProvider

    if (!input) {
      return res.status(400).json({ ok: false, error: "Missing `input` in request body." });
    }

    const engineResult = await runBrewAssistEngine({
      input,
      mode,
      useResearchModel,
      preferredProvider, // Pass preferredProvider
      systemPrompt: "You are BrewAssist, a helpful AI assistant.", // Example system prompt
    });

    res.status(200).json({
      ok: true,
      message: {
        role: 'assistant',
        content: engineResult.content,
      },
      text: engineResult.content,
      provider: engineResult.provider,
      model: engineResult.model,
      routeType: engineResult.routeType,
      truthReport: engineResult.truthReport ?? null,
    });
  } catch (error: any) {
    console.error('BrewAssist API Error:', error);
    res.status(500).json({
      ok: false,
      error: 'BrewAssist internal failure.',
      details: error?.message ?? String(error),
    });
  }
}