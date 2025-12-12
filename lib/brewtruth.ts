// BrewTruth grading tier – how "trustworthy / production-ready" a reply is.
export type BrewTruthTier =
  | "gold"        // Safe to trust in most cases
  | "silver"      // Good, but may need quick review
  | "bronze"      // Usable draft, needs editing
  | "red";        // High risk / likely wrong / incomplete

// Dimensions we care about for Tier-2.
export type BrewTruthDimension =
  | "factuality"
  | "relevance"
  | "clarity"
  | "safety"
  | "structure";

// One dimension’s score.
export interface BrewTruthScore {
  dim: BrewTruthDimension;
  score: number;      // 0–1 (or 0–100, see note below)
  notes?: string;     // short human explanation
}

// Flags for quick UI badges and logs.
export type BrewTruthFlagType =
  | "low_confidence"
  | "speculative"
  | "missing_context"
  | "possible_hallucination"
  | "safety_concern"
  | "partial_answer"
  | "tool_failure"
  | "fallback_used";

// Lightweight trace of which model / provider answered.
export interface BrewTruthModelTrace {
  provider: "openai" | "gemini" | "mistral" | "nims" | "tinyllm" | "unknown" | "system";
  model: string;              // e.g. "gpt-4.1-mini", "gemini-2.5-flash"
  routeType: "primary" | "fallback" | "research" | "preferred" | "unknown" | "system-block";
  latencyMs?: number;
}

// The main BrewTruth object we expose everywhere.
export interface BrewTruthReport {
  tier: BrewTruthTier;
  overallScore: number;        // 0–1 (Tier-2) or 0–100 (if you prefer)
  scores: BrewTruthScore[];    // one per dim
  flags: BrewTruthFlagType[];
  summary: string;             // 1–2 sentence recap, UI-ready
  modelTrace: BrewTruthModelTrace;
  evaluatedAt: string;         // ISO timestamp
  version: string;             // e.g. "bt-2.0"
}

export interface BrewTruthInput {
  prompt: string;          // what user asked
  response: string;        // what BrewAssist answered
  mode?: 'llm' | 'hrm' | 'agent' | 'loop';         // "llm" | "hrm" | "agent" | "loop"
  providerTrace?: BrewTruthModelTrace; // optional input if engine already knows
}

export async function runBrewTruth(
  input: BrewTruthInput
): Promise<BrewTruthReport> {
  // implementation uses OpenAI (or other) internally
  // For now, return a stubbed report
  return {
    tier: 'silver',
    overallScore: 0.8,
    scores: [
      { dim: 'factuality', score: 0.8, notes: 'Stubbed' },
      { dim: 'relevance', score: 0.9, notes: 'Stubbed' },
      { dim: 'clarity', score: 0.85, notes: 'Stubbed' },
      { dim: 'safety', score: 0.95, notes: 'Stubbed' },
      { dim: 'structure', score: 0.7, notes: 'Stubbed' },
    ],
    flags: [],
    summary: 'This is a stubbed BrewTruth report.',
    modelTrace: input.providerTrace || {
      provider: 'unknown',
      model: 'unknown',
      routeType: 'unknown',
    },
    evaluatedAt: new Date().toISOString(),
    version: '2',
  };
}

export function getTruthEngineStatus() {
  return {
    status: "operational",
    engine: "BrewTruth",
    version: "v2.0.0", // Updated version
  };
}

export function toTruthPromptFromToolRun(toolRun: any): string {
  // Placeholder for now
  return `Review the tool run: ${JSON.stringify(toolRun)}`;
}

export async function runTruthCheckForToolRun(toolRun: any): Promise<BrewTruthReport> {
  // Placeholder for now
  return {
    tier: 'silver',
    overallScore: 0.8,
    scores: [
      { dim: 'factuality', score: 0.8, notes: 'Stubbed' },
      { dim: 'relevance', score: 0.9, notes: 'Stubbed' },
      { dim: 'clarity', score: 0.85, notes: 'Stubbed' },
      { dim: 'safety', score: 0.95, notes: 'Stubbed' },
      { dim: 'structure', score: 0.7, notes: 'Stubbed' },
    ],
    flags: [],
    summary: 'Stubbed truth check',
    modelTrace: {
      provider: 'unknown',
      model: 'unknown',
      routeType: 'unknown',
    },
    evaluatedAt: new Date().toISOString(),
    version: 'bt-2.0-stub',
  };
}