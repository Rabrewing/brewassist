// lib/commands/registry.ts
import { BrewCommandId, BrewTier, BrewContext, BrewResult } from "./types";
import { handleTaskCommand } from "./task";
import { handleDocCommand } from "./doc";
import { handlePatchCommand } from "./patch";
import { handleHrmCommand } from "./hrm";

export interface BrewCommand {
  id: BrewCommandId;
  label: string;
  description: string;
  tier: BrewTier;
  handler: (input: string, ctx: BrewContext) => Promise<BrewResult>;
}

export const COMMANDS: BrewCommand[] = [
  {
    id: "/task",
    label: "Create Task",
    description: "Turn a request into a structured dev task.",
    tier: "basic",
    handler: handleTaskCommand,
  },
  {
    id: "/doc",
    label: "Generate Doc",
    description: "Create or update documentation in Markdown.",
    tier: "basic",
    handler: handleDocCommand,
  },
  {
    id: "/patch",
    label: "Suggest Patch",
    description: "Suggest a code patch for a given file/snippet.",
    tier: "pro",
    handler: handlePatchCommand,
  },
  {
    id: "/hrm",
    label: "HRM Strategy",
    description: "High-level strategy / risk analysis (RB mode only).",
    tier: "rb",
    handler: handleHrmCommand,
  },
];

export function findCommand(id: string): BrewCommand | undefined {
  return COMMANDS.find((cmd) => cmd.id === id);
}
