// lib/commands/doc.ts
import { BrewContext, BrewDocResult, BrewResult } from "./types";

export async function handleDocCommand(
  input: string,
  ctx: BrewContext
): Promise<BrewResult> {
  const title = input.trim() || "Untitled Doc";

  const result: BrewDocResult = {
    kind: "doc",
    summary: `Drafted doc: ${title}`,
    doc: {
      title,
      bodyMarkdown: `# ${title}\n\nThis is a stub doc body from BrewAssist.\n\nReplace with LLM-generated Markdown.`, 
    },
  };

  return result;
}
