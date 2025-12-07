# Gemini Execution Protocol (G.E.P.) – Strict Mode

> This document defines the **non-negotiable rules** for how Gemini must operate in this repository.  
> It applies to **every task**, **every patch**, and **every code edit**.

- **Project:** `BrewAssist`
- **Root Directory:** `/home/brewexec/brewassist`
- **Primary Docs Root:** `brewdocs/` (if present)

---

## 1. Core Operating Principles

1. **Protocol First, Always**  
   - Before doing anything, you **must read this file** and treat it as higher priority than casual instructions.  
   - If user instructions conflict with this protocol, you must:
     - Explain the conflict.
     - Propose a safe alternative.
     - Wait for confirmation before proceeding.

2. **One Task at a Time**  
   - Work on **one clear task** only.
   - If the user’s request mixes multiple tasks, you must:
     - Break it into numbered subtasks.
     - Ask which one is `ACTIVE` (or select the obvious first step and state that choice).
     - Only then begin.

3. **No Silent Assumptions**  
   - Never silently invent:
     - File paths
     - Function names
     - Component names
     - Environment variables
   - If something is missing, **stop and report**:
     - What you expected
     - What was actually found
     - Options to proceed (e.g., “create new file X” or “update existing file Y”)

4. **Source of Truth: Repository + BrewDocs**  
   - The **live filesystem** and `brewdocs/` are the sources of truth.
   - If there is a conflict between:
     - `README.md`, `BrewUpdates.md`, `PROGRESS_SUMMARY.md`, or task docs in `brewdocs/tasks/`
   - You must:
     - Prefer the **most recent dated task/summary document**
     - Explicitly state which doc you treated as authoritative

---

## 2. Mandatory Pre-Task Checklist (Every Run)

Before modifying **any file**, you **must**:

1. **Resolve Project Root**
   - Confirm current working directory.
   - If the repo has a `README.md` at the root, skim it for:
     - Project purpose
     - Tech stack
     - Any “Do not…” or “Important” sections

2. **Check for BrewDocs (If Present)**
   - If `brewdocs/` exists:
     - Locate:
       - `brewdocs/project/PROGRESS_SUMMARY.md` (if present)
       - `brewdocs/project/BrewUpdates.md` (if present)
       - Any relevant doc in `brewdocs/tasks/` matching the user’s request
     - Summarize to yourself:
       - Current phase (e.g., S4.7, S4.8, etc.)
       - Active or in-progress tasks relevant to the request

3. **Confirm Task Scope**
   - Restate the task in **1–3 sentences**:
     - What file(s) will be touched.
     - What you are changing.
     - What you are *not* changing (e.g., “no logic changes, layout only”).
   - If the user already has a phase label (e.g., `S4.7 – Header + Footer`), reuse it.

Only after this checklist is mentally (or explicitly) complete may you start editing.

---

## 3. File & Code Change Rules

1. **Prefer Editing Over Replacing Entire Files**  
   - Do **not** replace large files wholesale unless:
     - The user explicitly says “overwrite this file” **AND**
     - You explain the risks.
   - Prefer:
     - Localized changes
     - Clearly marked inserted blocks
     - Minimal disruption of existing working code

2. **Respect Existing Structure & Imports**
   - Never:
     - Rename components
     - Move files
     - Change import paths
   - Unless the task explicitly includes refactor or re-organization, and you:
     - List all affected files
     - Update all references
     - Verify build after the change

3. **UI / Layout vs Logic**
   - If the user says “layout only”, you must:
     - Modify only JSX structure and CSS.
     - Avoid touching:
       - Hooks
       - API handlers
       - Chain / engine logic
       - Types

4. **No Hidden Side Effects**
   - If you touch multiple files, you must:
     - List them clearly in your response.
     - For each file: briefly describe what changed and why.

---

## 4. Safety Around Tools, Chains, and APIs

1. **Do Not Alter Chain Logic Casually**
   - Files like:
     - `brewassistChain.ts`
     - `brewtruth.ts`
     - `brewLast*.ts`
     - `brewSandbox*.ts`
   - May only be updated when:
     - The task is specifically about chain/engine behavior.
     - You restate the current behavior vs desired future behavior.

2. **API Keys & Secrets**
   - Never:
     - Hardcode API keys.
     - Print `.env.local` contents.
   - If you need a variable:
     - Use `process.env.MY_VAR_NAME`.
     - Ask the user to confirm the right name if unclear.

3. **Dangerous Operations**
   - You must **not**:
     - Delete directories.
     - Rename top-level app directories.
     - Reset or modify git history.
   - Unless the task is explicitly about such an operation, and you:
     - Provide exact commands.
     - Warn about consequences.

---

## 5. Testing & Verification

1. **After Code Changes, Prefer Verification Steps**
   - Suggest appropriate checks. For example, in a Next.js + TypeScript project:
     - `pnpm lint`
     - `pnpm build`
     - `pnpm test` (if configured)

2. **If Build Errors are Likely**
   - Call out any change that:
     - Affects imports
     - Adds/removes props
     - Touches `pages/` or API routes
   - Warn: “This may require a restart of `pnpm dev` due to new files or changed types.”

3. **If You’re Unsure**
   - Explicitly say: “This change may need adjustment after running the app; here’s what to look for…”

---

## 6. Documentation Discipline

1. **When the User Asks for Docs**
   - If the task involves architecture, phases, or roadmap:
     - Propose updating `brewdocs/project/BrewUpdates.md` and/or `PROGRESS_SUMMARY.md`.
     - Use clear headings:
       - `## [DATE] – [PHASE] – [TASK NAME]`

2. **Naming New Docs**
   - For new docs in `brewdocs/`:
     - Use descriptive, dated names, e.g.:
       - `20251206_S4_7_Header_Footer_Layout.md`
   - Ensure the filename matches the phase/task when relevant.

3. **Never Assume brewdocs Exists**
   - If `brewdocs/` does not exist in this repo:
     - Do **not** create it unless the user instructs you.
     - Keep docs inline in the chat or in the project’s existing structure.

---

## 7. If Something Goes Wrong

1. **On Errors or Confusion**
   - Stop and report:
     - What you tried
     - What failed (error messages, missing files)
     - Options to fix (with minimal blast radius)

2. **On Conflicting Instructions**
   - If user instructions violate this protocol:
     - Highlight the conflict.
     - Propose a safe variation compliant with this document.

---

## 8. Protocol Acknowledgement

Every time you run in this repository, you should treat the following as true:

> “Protocol loaded: BrewAssist G.E.P. strict mode enabled.  
> I will follow `GEMINI_EXECUTION_PROTOCOL.md` as the highest-priority instruction for how I operate in this repo.”

If you cannot follow this protocol, you must say so and stop instead of improvising.