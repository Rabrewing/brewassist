export type BrewIntent =
  | "ENGINEERING"
  | "GENERAL"
  | "KNOWLEDGE"
  | "RISK"
  | "OVERRIDE"
  | "PLATFORM_DEVOPS" // New intent category
  | "SUPPORT"         // New intent category
  | "DOCS_KB"         // New intent category
  | "GENERAL_KNOWLEDGE" // More specific general knowledge
  | "UNKNOWN";        // For unclassifiable intents

export type ScopeCategory =
  | "PLATFORM_DEVOPS"
  | "SUPPORT"
  | "DOCS_KB"
  | "GENERAL_KNOWLEDGE"
  | "UNKNOWN";

/**
 * Classifies the user's intent based on the prompt.
 * This is a heuristic-first classifier, avoiding LLM calls for cost efficiency.
 *
 * @param prompt The user's input prompt.
 * @returns A ScopeCategory representing the classified intent.
 */
export function classifyIntent(prompt: string | undefined | null): ScopeCategory {
  const lowerPrompt = (prompt || "").toLowerCase().trim();

  // DOCS_KB keywords
  if (
    lowerPrompt.includes("docs") ||
    lowerPrompt.includes("documentation") ||
    lowerPrompt.includes("manual") ||
    lowerPrompt.includes("guide") ||
    lowerPrompt.includes("how to") ||
    lowerPrompt.includes("how do") ||
    lowerPrompt.includes("explain") ||
    lowerPrompt.includes("reference")
  ) {
    return "DOCS_KB";
  }

  // Greetings check
  const greetings = ["hello", "hi", "hey", "yo", "good morning", "good afternoon", "good evening"];
  if (greetings.includes(lowerPrompt)) {
    return "PLATFORM_DEVOPS";
  }

  // PLATFORM_DEVOPS keywords
  if (
    lowerPrompt.includes("build") ||
    lowerPrompt.includes("deploy") ||
    lowerPrompt.includes("code") ||
    lowerPrompt.includes("test") ||
    lowerPrompt.includes("git") ||
    lowerPrompt.includes("repo") ||
    lowerPrompt.includes("pipeline") ||
    lowerPrompt.includes("server") ||
    lowerPrompt.includes("config") ||
    lowerPrompt.includes("environment") ||
    lowerPrompt.includes("error") ||
    lowerPrompt.includes("debug") ||
    lowerPrompt.includes("fix") ||
    lowerPrompt.includes("feature") ||
    lowerPrompt.includes("bug") ||
    lowerPrompt.includes("toolbelt") ||
    lowerPrompt.includes("sandbox") ||
    lowerPrompt.includes("mcp") ||
    lowerPrompt.includes("brewassist")
  ) {
    return "PLATFORM_DEVOPS";
  }

  // SUPPORT keywords
  if (
    lowerPrompt.includes("help") ||
    lowerPrompt.includes("support") ||
    lowerPrompt.includes("issue") ||
    lowerPrompt.includes("problem") ||
    lowerPrompt.includes("contact") ||
    lowerPrompt.includes("ticket")
  ) {
    return "SUPPORT";
  }

  // GENERAL_KNOWLEDGE (catch-all for non-platform specific questions)
  // This should be broad enough to catch anything not covered above.
  // Examples: "what is the meaning of life?", "tell me a joke", "weather", "history"
  // For now, anything not classified as platform, support, or docs is general.
  // This can be refined with a negative keyword list if needed.
  if (
    lowerPrompt.includes("world") ||
    lowerPrompt.includes("future") ||
    lowerPrompt.includes("joke") ||
    lowerPrompt.includes("weather") ||
    lowerPrompt.includes("history") ||
    lowerPrompt.includes("meaning of life") ||
    lowerPrompt.includes("tell me about") ||
    lowerPrompt.includes("who is") ||
    lowerPrompt.includes("what is") // if not caught by DOCS_KB
  ) {
    return "GENERAL_KNOWLEDGE";
  }


  // If none of the above, default to UNKNOWN or a more general category
  return "GENERAL_KNOWLEDGE";
}
