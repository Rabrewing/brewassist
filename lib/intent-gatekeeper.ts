export type BrewIntent =
  | "ENGINEERING"
  | "GENERAL"
  | "KNOWLEDGE"
  | "RISK"
  | "OVERRIDE";

export function classifyIntent(prompt: string): BrewIntent {
  return "ENGINEERING"; // placeholder for S4.10b
}
