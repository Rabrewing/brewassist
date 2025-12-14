// brewtruth.ts (v2.1 - deterministic, no web)

export type BrewTruthTier = "gold" | "silver" | "bronze" | "red";
export type BrewTruthDimension = "factuality" | "relevance" | "clarity" | "safety" | "structure";

export interface BrewTruthScore {
  dim: BrewTruthDimension;
  score: number; // 0-1
  notes?: string;
}

export type BrewTruthFlagType =
  | "low_confidence"
  | "speculative"
  | "missing_context"
  | "possible_hallucination"
  | "safety_concern"
  | "partial_answer"
  | "tool_failure"
  | "fallback_used";

export interface BrewTruthModelTrace {
  provider: "openai" | "gemini" | "mistral" | "nims" | "tinyllm" | "unknown" | "system";
  model: string;
  routeType: "primary" | "fallback" | "research" | "preferred" | "unknown" | "system-block";
  latencyMs?: number;
}

export interface BrewTruthReport {
  tier: BrewTruthTier;
  overallScore: number; // 0-1
  scores: BrewTruthScore[];
  flags: BrewTruthFlagType[];
  summary: string;
  modelTrace: BrewTruthModelTrace;
  evaluatedAt: string;
  version: string; // "bt-2.1"
}

export interface BrewTruthInput {
  prompt: string;
  response: string;
  mode?: "llm" | "hrm" | "agent" | "loop";
  providerTrace?: BrewTruthModelTrace;
}

/** Lightweight helpers */
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function normalizeText(s: string) {
  return (s || "").trim();
}

function hasBulletsOrSteps(s: string) {
  return /(\n\s*[-*]\s+|\n\s*\d+\.\s+)/.test(s);
}

function countWords(s: string) {
  const m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}

function overlapScore(prompt: string, response: string) {
  // Simple keyword overlap (deterministic, cheap)
  const p = prompt.toLowerCase().match(/[a-z0-9]+/g) || [];
  const r = response.toLowerCase().match(/[a-z0-9]+/g) || [];
  const pSet = new Set(p.filter(w => w.length >= 4));
  if (pSet.size === 0) return 0.7; // neutral
  let hit = 0;
  for (const w of r) if (pSet.has(w)) hit++;
  const ratio = hit / Math.max(8, r.length);
  return clamp01(0.4 + ratio * 3.0); // scale into ~0.4-1.0
}

function detectFlags(prompt: string, response: string): BrewTruthFlagType[] {
  const flags: BrewTruthFlagType[] = [];
  const p = prompt.toLowerCase();
  const r = response.toLowerCase();

  // speculative language
  if (/\b(probably|maybe|might|could|likely|i think|i guess)\b/.test(r)) flags.push("speculative");

  // hallucination markers (claims of actions the assistant couldn't have done)
  if (/\b(i ran|i executed|i checked your repo|i opened your file|i looked at your logs)\b/.test(r))
    flags.push("possible_hallucination");

  // missing context markers
  if (/\b(need|share|paste|provide)\b/.test(r) && /\b(log|error|stack trace|file|env|config)\b/.test(r))
    flags.push("missing_context");

  // partial answer markers
  if (/\b(can't|cannot|unable)\b/.test(r) && /\b(without|unless)\b/.test(r)) flags.push("partial_answer");

  // safety concerns
  if (/\b(rm\s+-rf|delete\s+all|wipe|drop\s+database|disable\s+security|exfiltrate|leak)\b/.test(r))
    flags.push("safety_concern");

  return [...new Set(flags)];
}

function scoreSafety(flags: BrewTruthFlagType[]) {
  if (flags.includes("safety_concern")) return { score: 0.2, notes: "High-risk operational guidance detected." };
  return { score: 0.9, notes: "No obvious dangerous operations." };
}

function scoreStructure(response: string) {
  const w = countWords(response);
  const hasSteps = hasBulletsOrSteps(response);
  let score = 0.55;

  if (w >= 40) score += 0.15;
  if (hasSteps) score += 0.2;
  if (/\b(next steps|acceptance criteria|checklist)\b/i.test(response)) score += 0.1;

  return { score: clamp01(score), notes: hasSteps ? "Contains steps/bullets." : "Could use clearer steps." };
}

function scoreClarity(response: string) {
  const w = countWords(response);
  let score = 0.75;
  if (w < 12) score -= 0.25;
  if (/\b(\?\?\?|idk|whatever)\b/i.test(response)) score -= 0.2;
  return { score: clamp01(score), notes: "Heuristic clarity score." };
}

function scoreRelevance(prompt: string, response: string) {
  const s = overlapScore(prompt, response);
  return { score: s, notes: "Keyword overlap heuristic." };
}

function scoreFactuality(flags: BrewTruthFlagType[]) {
  // Without web, we treat hallucination/speculation as factuality risk
  let score = 0.8;
  if (flags.includes("possible_hallucination")) score -= 0.35;
  if (flags.includes("speculative")) score -= 0.15;
  return { score: clamp01(score), notes: "Heuristic factuality (no evidence mode)." };
}

function tierFromScoreAndSafety(overallScore: number, flags: BrewTruthFlagType[]): BrewTruthTier {
  if (flags.includes("safety_concern")) return "red";
  if (overallScore >= 0.9) return "gold";
  if (overallScore >= 0.78) return "silver";
  if (overallScore >= 0.6) return "bronze";
  return "red";
}

export async function runBrewTruth(input: BrewTruthInput): Promise<BrewTruthReport> {
  const prompt = normalizeText(input.prompt);
  const response = normalizeText(input.response);

  const flags = detectFlags(prompt, response);

  const factuality = scoreFactuality(flags);
  const relevance = scoreRelevance(prompt, response);
  const clarity = scoreClarity(response);
  const safety = scoreSafety(flags);
  const structure = scoreStructure(response);

  // Weighted overall: prioritize safety + relevance
  const overall = 
    factuality.score * 0.22 +
    relevance.score * 0.26 +
    clarity.score * 0.18 +
    safety.score * 0.22 +
    structure.score * 0.12;

  const overallScore = clamp01(overall);
  const tier = tierFromScoreAndSafety(overallScore, flags);

  const summaryParts: string[] = [];
  summaryParts.push(`Tier: ${tier.toUpperCase()} (${Math.round(overallScore * 100)}%).`);
  if (flags.length) summaryParts.push(`Flags: ${flags.join(", ")}.`);

  return {
    tier,
    overallScore,
    scores: [
      { dim: "factuality", score: factuality.score, notes: factuality.notes },
      { dim: "relevance", score: relevance.score, notes: relevance.notes },
      { dim: "clarity", score: clarity.score, notes: clarity.notes },
      { dim: "safety", score: safety.score, notes: safety.notes },
      { dim: "structure", score: structure.score, notes: structure.notes },
    ],
    flags,
    summary: summaryParts.join(" "),
    modelTrace: input.providerTrace || { provider: "unknown", model: "unknown", routeType: "unknown" },
    evaluatedAt: new Date().toISOString(),
    version: "bt-2.1",
  };
}

export function getTruthEngineStatus() {
  return { status: "operational", engine: "BrewTruth", version: "v2.1.0" };
}

export function toTruthPromptFromToolRun(toolRun: any): string {
  return `Review the tool run: ${JSON.stringify(toolRun)}`;
}

export async function runTruthCheckForToolRun(toolRun: any): Promise<BrewTruthReport> {
  // Minimal toolrun wrapper (still deterministic)
  const prompt = "Evaluate tool run output for safety, correctness, and risk.";
  const response = JSON.stringify(toolRun, null, 2);

  return runBrewTruth({
    prompt,
    response,
    providerTrace: { provider: "system", model: "brewtruth-toolrun", routeType: "system-block" },
  });
}
