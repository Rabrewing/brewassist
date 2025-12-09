export interface BrewTruthReport {
  truthScore: number;
  contradictions: string[];
  suggestions: string[];
  modelRole: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; // Added
  flags: string[]; // Added
  summary: string; // Added
}

export interface BrewTruthRequest {
  statement: string;
  contextHint?: string;
  mode?: string;
}

export async function runBrewTruthGrader({
  mode,
  messages,
  response,
  modelRole
}: {
  mode: string;
  messages: any[];
  response: string;
  modelRole: string;
}): Promise<BrewTruthReport> {

  // Simple stub for now — later replace with real deep scoring
  try {
    // Send to whichever provider you want (OpenAI is fine)
    const graderPrompt = `
Grade the assistant's response for correctness, clarity, contradictions, and usefulness.
Return JSON with: truthScore (0-100), contradictions[], suggestions[].
Do NOT include reasoning or explanation outside JSON.

Assistant response:
${response}
    `.trim();

    // Call your Mini model for speed:
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL_MINI ?? "gpt-4.1-mini",
        messages: [{ role: "user", content: graderPrompt }],
        temperature: 0
      })
    });

    const json = await res.json();

    let parsed = null;
    try {
      parsed = JSON.parse(json.choices?.[0]?.message?.content || "{}");
    } catch {
      parsed = { truthScore: 70, contradictions: [], suggestions: [] };
    }

    return {
      truthScore: parsed.truthScore ?? 70,
      contradictions: parsed.contradictions ?? [],
      suggestions: parsed.suggestions ?? [],
      modelRole,
      riskLevel: 'LOW', // Default for stub
      flags: [], // Default for stub
      summary: 'Stubbed truth report', // Default for stub
    };

  } catch (err) {
    return {
      truthScore: 60,
      contradictions: ["Truth grader failed"],
      suggestions: ["Retry"],
      modelRole,
      riskLevel: 'MEDIUM', // Default for stub
      flags: ['error'], // Default for stub
      summary: 'Truth grader failed', // Default for stub
    };
  }
}

export function getTruthEngineStatus() {
  return {
    status: "operational",
    engine: "BrewTruth",
    version: "v1.0.0",
  };
}

export function toTruthPromptFromToolRun(toolRun: any): string {
  // Placeholder for now
  return `Review the tool run: ${JSON.stringify(toolRun)}`;
}

export async function runTruthCheckForToolRun(toolRun: any): Promise<BrewTruthReport> {
  // Placeholder for now
  return {
    truthScore: 80,
    contradictions: [],
    suggestions: [],
    modelRole: "system",
    riskLevel: 'LOW', // Default for stub
    flags: [], // Default for stub
    summary: 'Stubbed truth check', // Default for stub
  };
}