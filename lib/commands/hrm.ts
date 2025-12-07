// lib/commands/hrm.ts
import { BrewContext, BrewResult } from "./types";

export async function handleHrmCommand(
  input: string,
  ctx: BrewContext
): Promise<BrewResult> {
  if (!ctx.rbMode) {
    return {
      kind: "narration",
      summary: "HRM command blocked: RB Mode is disabled.",
      rawText:
        "HRM strategy responses are only available when RB Mode is explicitly enabled.",
    };
  }

  return {
    kind: "narration",
    summary: "Stub HRM response.",
    rawText:
      "This is a placeholder HRM response. Replace with a real strategy-minded LLM call.",
  };
}
