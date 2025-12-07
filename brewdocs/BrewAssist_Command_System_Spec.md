# BrewAssist Command System Spec (S4.x) Last updated: 2025-11-** Owner: RB + BrewAssist --- ## 1. Purpose BrewAssist is a **DevOps-first AI cockpit**. Instead of “just chat”, BrewAssist exposes a set of **structured commands** that: - Turn plain English into **tasks, docs, and patches**. - Route intelligently across **OpenAI, local TinyLLaMA, and (later) NIMs/Gemini**. - Log everything for **audit, safety, and RB Mode control**. Commands are invoked either: - As **slash commands** in the input bar (e.g. `/task`, `/doc`, `/patch`), or - Via **MCP Tools buttons** that pre-fill a command. --- ## 2. Command lifecycle Every BrewAssist command follows the same lifecycle: 1. **User input** - e.g. `/task Refactor login to use OTP` - or a MCP button that sends `{ command: "/task", input: "…" }`. 2. **HTTP call** - Frontend sends `POST /api/command` with: - `command` (string) - `input` (string) - `context` (optional: file path, diff, stack trace, etc.) - `session` (tenantId, userId, RB mode, etc.) 3. **Routing / execution** - `/api/command` looks up the command in the **registry** (`lib/commands/registry.ts`). - Calls the command **handler** with a `BrewContext`: - which models are allowed, - RB Mode flags, - tenant + project info. 4. **LLM + tools** - Handler calls the appropriate **LLM stack**: - e.g. OpenAI for reasoning, - TinyLLaMA for cheap expansions, - NIMs (later) for deep research. - It may optionally call **BrewTruth / BrewLast / sandbox** (internal tools). 5. **Result & log** - Handler returns a **typed result**: `{ kind, summary, data }`. - `/api/command`: - Streams narration into the **Workspace Log**. - Optionally returns a structured payload for UI overlays (task cards, diff viewers). --- ## 3. Types & payloads (MVP) ### 3.1 Core types ```ts // lib/commands/types.ts export type BrewCommandId = "/task" | "/doc" | "/patch" | "/hrm"; export type BrewTier = "basic" | "pro" | "rb"; export type BrewResultKind = "task" | "doc" | "patch" | "narration"; export interface BrewContext { tenantId?: string; userId?: string; projectId?: string; activeEnv: "dev" | "prod" | "sandbox"; rbMode: boolean; models: { primary: string; // e.g. "openai:gpt-4.1-mini" local?: string; // e.g. "tinyllama" research?: string; // later: "nims:..." }; } export interface BrewResultBase { kind: BrewResultKind; summary: string; rawText?: string; } export interface BrewTaskResult extends BrewResultBase { kind: "task"; task: { title: string; description: string; estimate?: string; tags?: string[]; riskLevel?: "low" | "medium" | "high"; }; } export interface BrewDocResult extends BrewResultBase { kind: "doc"; doc: { title: string; bodyMarkdown: string; suggestedPath?: string; }; } export interface BrewPatchResult extends BrewResultBase { kind: "patch"; patch: { filePath: string; beforeSnippet?: string; afterSnippet: string; notes?: string; }; } export type BrewResult = | BrewTaskResult | BrewDocResult | BrewPatchResult | BrewResultBase; 

4. MVP Commands

4.1 /task – Create a structured dev task

Tier: basic
Use cases:

Turn any free-text idea into a clear, scoped task.

Include estimate, risk, tags (e.g. ui, api, infra).

Input examples:

/task Clean up BrewCockpit CSS to use modular imports

MCP button “Create Task” opens a prompt → then calls /task.

Handler behavior:

Parse the input into: 

title (short),

description (3–7 bullet points),

risk level,

tags.

Return a BrewTaskResult.

4.2 /doc – Generate or update docs

Tier: basic → pro for multi-file context
Use cases:

Generate README sections, design notes, API docs.

Optionally attach a file path for suggested location.

Input examples:

/doc Write a section for BrewAssist_Command_System_Spec

From file context: “Explain this file for brewdocs”.

Handler behavior:

Ask the primary model to: 

summarize / explain,

produce Markdown doc body.

Return BrewDocResult with bodyMarkdown.

4.3 /patch – Suggest a code patch (no auto-apply yet)

Tier: pro
Use cases:

Suggest changes to a single file snippet.

Show “before/after” and commentary.

Input examples:

/patch Improve error handling in pages/api/fs-tree.ts

MCP button “Suggest Edits” sends file content + brief.

Handler behavior:

Require: 

filePath,

fileContent,

optional goal.

Ask LLM for minimal, well-scoped patch.

Return BrewPatchResult.

4.4 /hrm – Strategy mind narration (RB mode)

Tier: rb
Use cases:

High-level reasoning about roadmap / risk / architecture.

Handler behavior:

Only allowed when ctx.rbMode === true.

Use primary model to respond in HRM tone (strategy, risk-aware).

5. Command registry

Commands are defined centrally in lib/commands/registry.ts:

// lib/commands/registry.ts import { BrewCommandId, BrewTier, BrewContext, BrewResult, } from "./types"; import { handleTaskCommand } from "./task"; import { handleDocCommand } from "./doc"; import { handlePatchCommand } from "./patch"; import { handleHrmCommand } from "./hrm"; export interface BrewCommand { id: BrewCommandId; label: string; description: string; tier: BrewTier; handler: (input: string, ctx: BrewContext) => Promise<BrewResult>; } export const COMMANDS: BrewCommand[] = [ { id: "/task", label: "Create Task", description: "Turn a request into a structured dev task.", tier: "basic", handler: handleTaskCommand, }, { id: "/doc", label: "Generate Doc", description: "Create or update documentation in Markdown.", tier: "basic", handler: handleDocCommand, }, { id: "/patch", label: "Suggest Patch", description: "Suggest a code patch for a given file/snippet.", tier: "pro", handler: handlePatchCommand, }, { id: "/hrm", label: "HRM Strategy", description: "High-level strategy / risk analysis (RB mode only).", tier: "rb", handler: handleHrmCommand, }, ]; export function findCommand(id: string): BrewCommand | undefined { return COMMANDS.find((cmd) => cmd.id === id); } 

6. Frontend behavior (MVP)

Input bar:

If text starts with /: 

Treat first word as command.

Remainder as input.

Else: 

Treat as normal “chat” (e.g. /hrm default, or generic assistant).

MCP buttons:

Call runCommand("/task", "…"), etc.

Results:

Always append to Workspace Log as: 

user line,

BrewAssist narration line,

optional structured UI (task card, doc preview, patch diff) later.

7. SaaS Tiers (MVP)

Basic 

/task, /doc

Pro 

/patch, extended /doc with file context

RB 

/hrm, future high-risk actions (auto-patch, repo-wide scans)

RB Mode is never enabled by default in SaaS; it must be explicitly enabled and audited.
