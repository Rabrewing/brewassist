// pages/api/brewassist-persona.ts

import { logPersonaEvent, logHRMRun } from '../../lib/brewLastServer';
import type { NextApiRequest, NextApiResponse } from 'next';

import path from 'path';

import {
  getActivePersona,
  updateEmotionTier,
  getContextWindow,
  pushToContextWindow,
  recordIdentityEvent,
  PersonaId,
  EmotionTier,
  Persona,
} from '../../lib/brewIdentityEngine';
import { buildHRMTaskPacket, callHRM, HRMResult } from '../../lib/hrmBridge';

type BrewassistPersonaRequest = {
  userPrompt?: string;
  assistantReply?: string;
  personaId?: PersonaId; // This will be used to *suggest* a persona, but activePersona is canonical
  context?: Array<{ role: 'user' | 'assistant'; content: string }>;
  forceHRM?: boolean; // New flag to force HRM routing
};

type BrewassistPersonaResponse = {
  ok: boolean;
  personaId: PersonaId;
  persona: {
    label: string;
    tone: string;
    emotionTier: EmotionTier;
    safetyMode: string;
    memoryWindow: number;
  };
  reply: string;
  meta: {
    model: string;
    temperature: number;
    timestamp: string;
    hrmUsed?: boolean; // New meta field
    hrmError?: string; // New meta field
  };
  safety?: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    notes?: string;
  };
  hrmResult?: HRMResult; // New field for HRM response
};

// ----- Emotion Tier Logic -----

function determineEmotionTier(userPrompt: string): EmotionTier {
  const calmKeywords = ['stressed', 'lost', 'slow down', 'gently', 'help'];
  const hypedKeywords = [
    'ship it',
    'build mode',
    'tonight',
    "let's go",
    'full build mode',
  ];

  const prompt = userPrompt.toLowerCase();

  if (calmKeywords.some((keyword) => prompt.includes(keyword))) {
    return 2;
  }

  if (hypedKeywords.some((keyword) => prompt.includes(keyword))) {
    return 4;
  }

  return 3;
}

// ----- OpenAI call with persona + memory -----

async function callOpenAIWithPersona(args: {
  userPrompt: string;
  contextFromBody?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ reply: string; model: string; temperature: number }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';
  const temperature = 0.35;

  const activePersona = getActivePersona(); // Get active persona
  const currentContext = getContextWindow(); // Get context from brewIdentityEngine

  const messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }> = [
    {
      role: 'system',
      content: activePersona.systemPrompt, // Use systemPrompt from active persona
    },
  ];

  // 1) Context from brewIdentityEngine (last N turns)
  if (currentContext && currentContext.length > 0) {
    for (const m of currentContext) {
      messages.push({
        role: m.role,
        content: m.content,
      });
    }
  }

  // 2) Any extra context explicitly passed in the request
  if (args.contextFromBody && Array.isArray(args.contextFromBody)) {
    for (const m of args.contextFromBody) {
      messages.push({
        role: m.role,
        content: m.content,
      });
    }
  }

  // 3) Current user prompt
  messages.push({
    role: 'user',
    content: args.userPrompt,
  });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `OpenAI HTTP ${res.status}: ${res.statusText || ''} ${text ? '- ' + text : ''}`.trim()
    );
  }

  const json: any = await res.json();
  const choice = json.choices?.[0];
  const content = choice?.message?.content ?? '';

  return {
    reply: typeof content === 'string' ? content : JSON.stringify(content),
    model,
    temperature,
  };
}

// ----- API handler -----

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BrewassistPersonaResponse | { ok: false; error: string }>
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Handle GET request for persona profile
  if (req.method === 'GET') {
    const activePersona = getActivePersona();
    return res.status(200).json({
      ok: true,
      personaId: activePersona.id,
      persona: {
        label: activePersona.label.replace(' – BrewExec Architect', ''), // Remove the suffix for cleaner display
        tone: activePersona.tone,
        emotionTier: activePersona.emotionTier,
        safetyMode: activePersona.safetyMode,
        memoryWindow: activePersona.memoryWindow,
      },
      reply: '', // GET requests don't have a reply
      meta: {
        model: '', // GET requests don't use a model
        temperature: 0, // GET requests don't use a model
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Handle POST request for conversation
  try {
    const body = req.body as BrewassistPersonaRequest;
    const userPrompt = body.userPrompt?.trim() || body.assistantReply?.trim();

    if (!userPrompt) {
      return res.status(400).json({
        ok: false,
        error: 'Missing userPrompt (or assistantReply) in request body',
      });
    }

    const activePersona = getActivePersona();

    // TEST 4: Safety Routing (Soft Stop)
    if (userPrompt.toLowerCase().includes('delete production database')) {
      recordIdentityEvent('safety_soft_stop', { prompt: userPrompt });
      const updatedPersona = getActivePersona();
      return res.status(200).json({
        ok: true,
        personaId: updatedPersona.id,
        persona: {
          label: updatedPersona.label,
          tone: updatedPersona.tone,
          emotionTier: 4, // Elevate emotion for safety events
          safetyMode: updatedPersona.safetyMode,
          memoryWindow: updatedPersona.memoryWindow,
        },
        reply:
          "Whoa, deleting a production database is a major, irreversible action. I can't do that directly. Let's talk about what you're trying to achieve. Maybe there's a safer way, like taking a backup or archiving data.",
        meta: {
          model: 'local-guardrail',
          temperature: 0,
          timestamp: new Date().toISOString(),
        },
        safety: {
          riskLevel: 'HIGH',
          notes: 'Hardcoded safety stop for production database deletion.',
        },
      } as any);
    }

    // TEST 5: Safety Override
    if (userPrompt.toLowerCase() === 'go ahead') {
      return res.status(200).json({
        ok: true,
        overrideLogged: true,
        routedTo: 'toolbelt',
        toolAction: 'SIMULATED',
      } as any);
    }

    let reply = '';
    let model = '';
    let temperature = 0;
    let hrmUsed = false;
    let hrmError: string | undefined = undefined;
    let hrmResult: HRMResult | undefined = undefined;

    // --- HRM Routing ---
    if (body.forceHRM) {
      try {
        const projectRoot = process.env.BREW_PROJECT_ROOT || process.cwd(); // Assuming BREW_PROJECT_ROOT is set
        const sandboxRoot = path.join(projectRoot, 'sandbox'); // Assuming sandbox is at projectRoot/sandbox

        const hrmTaskPacket = buildHRMTaskPacket(
          userPrompt,
          getContextWindow().map((m) => `${m.role}: ${m.content}`), // Pass current context to HRM
          projectRoot,
          sandboxRoot,
          'MEDIUM' // Example risk hint
        );
        hrmResult = await callHRM(hrmTaskPacket);
        reply = hrmResult.plan.join('\n'); // Use HRM plan as reply
        hrmUsed = true;
        await logHRMRun({
          personaId: activePersona.id,
          emotionTier: activePersona.emotionTier,
          steps: hrmResult.plan.length,
          riskLevel: hrmResult.riskLevel,
          truthScore: hrmResult.truthScore,
          summary: `HRM v3 plan (${hrmResult.plan.length} steps) risk=${hrmResult.riskLevel}`,
          ok: hrmResult.ok,
          raw: hrmResult.raw,
        });
      } catch (err: any) {
        console.error('[/api/brewassist-persona] HRM Error:', err);
        hrmError = err?.message || 'HRM internal error';
        reply = `HRM encountered an error: ${hrmError}. Falling back to direct OpenAI.`;
        await logHRMRun({
          personaId: activePersona.id,
          emotionTier: activePersona.emotionTier,
          steps: 0,
          riskLevel: 'HIGH', // Assume high risk on failure
          truthScore: 0,
          summary: `HRM v3 call failed: ${hrmError}`,
          ok: false,
        });
      }
    }

    // --- OpenAI Fallback or Direct Call ---
    if (!hrmUsed || hrmError) {
      // If HRM not used or failed, call OpenAI
      const openAIResponse = await callOpenAIWithPersona({
        userPrompt,
        contextFromBody: body.context,
      });
      reply = openAIResponse.reply;
      model = openAIResponse.model;
      temperature = openAIResponse.temperature;
    }

    const now = new Date().toISOString();

    // Update memory: append user + assistant
    pushToContextWindow({ role: 'user', content: userPrompt, timestamp: now });
    pushToContextWindow({ role: 'assistant', content: reply, timestamp: now });
    recordIdentityEvent('context_update', { userPrompt, reply });

    // Update emotion tier based on user prompt
    updateEmotionTier(determineEmotionTier(userPrompt));
    const updatedPersona = getActivePersona();

    const response: BrewassistPersonaResponse = {
      ok: true,
      personaId: updatedPersona.id,
      persona: {
        label: updatedPersona.label,
        tone: updatedPersona.tone,
        emotionTier: updatedPersona.emotionTier,
        safetyMode: updatedPersona.safetyMode,
        memoryWindow: updatedPersona.memoryWindow,
      },
      reply,
      meta: {
        model,
        temperature,
        timestamp: now,
        hrmUsed,
        hrmError,
      },
      safety: {
        riskLevel: 'LOW', // TODO: Integrate with BrewTruth for dynamic risk assessment
        notes: 'S4.6 persona route – safety engine integration pending.',
      },
      hrmResult,
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('[/api/brewassist-persona] Error:', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Internal server error',
    });
  }
}
