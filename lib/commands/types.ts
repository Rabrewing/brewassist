// lib/commands/types.ts
export type BrewCommandId = "/task" | "/doc" | "/patch" | "/hrm";
export type BrewTier = "basic" | "pro" | "rb";
export type BrewResultKind = "task" | "doc" | "patch" | "narration";

export interface BrewContext {
  tenantId?: string;
  userId?: string;
  projectId?: string;
  activeEnv: "dev" | "prod" | "sandbox";
  rbMode: boolean;
  models: {
    primary: string; // e.g. "openai:gpt-4.1-mini"
    local?: string; // e.g. "tinyllama"
    research?: string; // later: "nims:..."
  };
}

export interface BrewResultBase {
  kind: BrewResultKind;
  summary: string;
  rawText?: string;
}

export interface BrewTaskResult extends BrewResultBase {
  kind: "task";
  task: {
    title: string;
    description: string;
    estimate?: string;
    tags?: string[];
    riskLevel?: "low" | "medium" | "high";
  };
}

export interface BrewDocResult extends BrewResultBase {
  kind: "doc";
  doc: {
    title: string;
    bodyMarkdown: string;
    suggestedPath?: string;
  };
}

export interface BrewPatchResult extends BrewResultBase {
  kind: "patch";
  patch: {
    filePath: string;
    beforeSnippet?: string;
    afterSnippet: string;
    notes?: string;
  };
}

export type BrewResult =
  | BrewTaskResult
  | BrewDocResult
  | BrewPatchResult
  | BrewResultBase;
