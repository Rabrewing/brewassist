// lib/brewRiskMemory.ts
type RiskState = {
  lastPromptHash: string;
  warnedAt: number;
};

const memory = new Map<string, RiskState>(); // key: userId/email

export function recordHighRiskWarning(userId: string, prompt: string) {
  memory.set(userId, {
    lastPromptHash: hashPrompt(prompt),
    warnedAt: Date.now(),
  });
}

export function shouldAutoProceedAfterWarning(
  userId: string,
  prompt: string
): boolean {
  const state = memory.get(userId);
  if (!state) return false;

  const samePrompt = state.lastPromptHash === hashPrompt(prompt);
  const withinWindow = Date.now() - state.warnedAt < 5 * 60 * 1000; // 5 min

  return samePrompt && withinWindow;
}

function hashPrompt(prompt: string): string {
  // super cheap hash, fine for now.
  return String(prompt.trim().toLowerCase().slice(0, 200));
}
