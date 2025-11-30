# BrewAssist_Stabilization_Roadmap.md – Phase S1 → S4

*Last updated: 2025-11-24 (ET)*
*Scope: BrewExec repo – BrewAssist Engine v2, Toolbelt, BrewLast, UI, Python core*

---

## S1 – Repo Stabilization & Safety Fence

**Goal:** Freeze a clean, known-good baseline after the “BrewAssist Engine v2” commit and prevent new noise from entering git while we iterate.

### S1.1 – Confirm Clean Engine v2 Baseline

* [ ] Verify latest commit:

  * `git log -1` → should show: `BrewAssist Engine v2: Toolbelt tiers 1–3 + lint system overhaul + docs`
* [ ] Confirm no staged changes:

  * `git status` → ensure “no changes added to commit” is true after we reset/clean.

### S1.2 – Protect Against New Noise (Git Ignore + Local Only)

Create/patch project-level ignore to keep temporary artifacts out of git:

**Update `.gitignore` to include:**

* [ ] `sandbox/`
* [ ] `home/`
* [ ] `task_complete.ts`
* [ ] `brewpulse` (symlink or stray folder under `/home/brewexec`)
* [ ] `.brewshell`
* [ ] `brewdocs/reference/.brewlast.json` (generated state)

> Intent: keep experimental files and sandboxes fully local so future git status runs stay readable.

### S1.3 – Separate “Stable” vs “Experimental” Areas

* [ ] Treat **Next.js BrewExec app** as the primary, production-tracked surface:

  * `pages/`, `components/`, `lib/`, `contexts/`, `styles/`, `pages/api/`, `brewdocs/`, `overlays/`.
* [ ] Treat everything under `brewassist_core/` as **Engine Lab** (Python layer) until we finalize design:

  * Changes here will be grouped and committed with explicit messages later (e.g., “BrewAssist Python core v1.1 – chain + planner refactor”).
* [ ] Mark sandbox-related API routes as **experimental**:

  * `pages/api/brewlast.ts`
  * `pages/api/brewlast-apply.ts`
  * `pages/api/edit-file.ts`

---

## S2 – BrewAssist Engine Chain & Toolbelt Hardening

**Goal:** Ensure that BrewAssist Engine v2 (JS/TS side) is fully stable, predictable, and clearly documented.

### S2.1 – Lock Engine Chain Behavior

Core JS/TS files:

* `lib/brewassistChain.ts`
* `lib/openaiEngine.ts`
* `lib/openaiToolbelt.ts`
* `lib/openaiEngineWrapper.ts`
* `lib/geminiCli.ts`
* (future) `lib/geminiFallback.ts`

Tasks:

* [ ] Confirm engine order:

  1. Toolbelt (`/api/llm-tool-call` via `openaiToolbelt`)
  2. OpenAI chat (no tools)
  3. (Later) Local Mistral
  4. Gemini CLI (reason-only, no tools)
* [ ] Ensure all OpenAI calls use `messages[]` correctly and no `role: "tool"` messages are sent unless responding to `tool_calls`.
* [ ] Log engine selection in BrewAssist response metadata (e.g., `engine: "openai+toolbelt" | "openai" | "mistral-local" | "gemini-cli"`).

### S2.2 – Toolbelt API (`/api/llm-tool-call`) Validation

File: `pages/api/llm-tool-call.ts`

* [ ] Confirm mapping of tools → overlays:

  * `write_file` → `overlays/write_file.sh`
  * `read_file` → `overlays/read_file.sh`
  * `list_dir` → `overlays/list_dir.sh`
  * `search_code` → `overlays/search_code.sh`
  * `run_shell` → `overlays/run_shell.sh`
  * `git_status` → `overlays/git_status.sh`
  * `run_tests` → `overlays/run_tests.sh`
  * `run_lint` → `overlays/run_lint.sh`
  * `run_typecheck` → `overlays/run_typecheck.sh`
  * `brew_status_snapshot` → `overlays/brew_status_snapshot.sh`
  * `brew_open_last_action` → `overlays/brew_open_last_action.sh`
  * `brew_log_update` → `overlays/brew_log_update.sh`
* [ ] Confirm argument serialization:

  * Arrays remain arrays.
  * `stdin` → text only, not accidentally stringified objects (`[object Object]`).
* [ ] Confirm error surfaces cleanly to BrewAssist:

  * On overlay non-zero exit → include `stderr` + `exitCode` in BrewAssist response.

### S2.3 – Overlay Shell Scripts (Tier 1–3 Sanity)

Scripts to keep under **strict guard**:

* `overlays/write_file.sh`
* `overlays/read_file.sh`
* `overlays/list_dir.sh`
* `overlays/search_code.sh`
* `overlays/run_shell.sh`
* `overlays/git_status.sh`
* `overlays/run_tests.sh`
* `overlays/run_lint.sh`
* `overlays/run_typecheck.sh`
* `overlays/brew_status_snapshot.sh`
* `overlays/brew_open_last_action.sh`
* `overlays/brew_log_update.sh`

Tasks:

* [ ] Confirm all use `$BREW_PROJECT_ROOT` correctly and fall back to safe `PROJECT_ROOT` when needed.
* [ ] Confirm `write_file.sh` path security (no escape outside root, uses `realpath`).
* [ ] Confirm each script prints JSON-parseable or clearly parseable text for the API.

---

## S3 – BrewLast, BrewLog, and State Surfaces

**Goal:** Stabilize and formalize the BrewLast / BrewLog system so BrewAssist has a reliable “last action” memory for the UI and future BrewTruth Engine.

### S3.1 – Library Layer

Files:

* `lib/brewLast.ts`
* `lib/brewLastServer.ts`

Tasks:

* [ ] Define a **single, canonical** BrewLast shape, e.g.:

  ```ts
  export type BrewLastEntry = {
    id: string;              // UUID
    ts: string;              // ISO timestamp
    tool?: string;           // e.g. "write_file"
    args?: unknown;          // original args
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    summary?: string;        // human description
  };
  ```
* [ ] Implement helper to **append** latest toolbelt call into `.brewlast.json` under `brewdocs/reference/` or project root (but keep out of git via ignore).
* [ ] Add safe read helpers for server APIs and UI components.

### S3.2 – API Routes

Files:

* `pages/api/brewlast.ts`
* `pages/api/brewlast-apply.ts`
* `pages/api/edit-file.ts`

Tasks:

* [ ] `/api/brewlast`:

  * [ ] Return latest BrewLast entry or list of recent entries.
* [ ] `/api/brewlast-apply`:

  * [ ] (Optional V1) Apply a specific BrewLast action (e.g., re-open file in preview, not re-run shell commands).
* [ ] `/api/edit-file`:

  * [ ] Secure endpoint for structured edits (e.g., patch by range, for future BrewTruth + review flows).

### S3.3 – Integration with BrewStatus Snapshot

* [ ] Ensure `brew_status_snapshot` uses BrewLast server helper instead of re-implementing JSON parsing.
* [ ] Ensure `brew_open_last_action` simply shells out to a helper that uses `brewLast` library.
* [ ] Confirm BrewAssist can:

  * [ ] Ask for the **last action summary**.
  * [ ] Ask to open last file in preview pane.

---

## S4 – Cockpit UI, Project Switcher, and Researcher Panel

**Goal:** Align the BrewAssist DevOps Cockpit UI with the new Toolbelt + BrewLast capabilities and prep for future BrewTruth + Research modes.

### S4.1 – File Tree & Scroll Behavior

Files:

* `components/WorkspaceSidebarRight.tsx`
* `components/BrewCockpitCenter.tsx`

Tasks:

* [ ] Fix file tree scroll:

  * Use a container with `overflow-y: auto; max-height: 100%` so only the tree scrolls, not the whole page.
* [ ] Add **active folder highlight**:

  * Visually mark the selected folder with BrewGold/BrewTeal border or background.
* [ ] Optionally add subtle “circuit board” / pulse styling:

  * Use soft border lines and hover states only (no heavy animations yet).

### S4.2 – Preview Pane Behavior

* [ ] Ensure preview pane shows:

  * Syntax-highlighted code (TS/TSX/JS/JSX).
  * Text-only for logs/markdown.
* [ ] Ensure the **text chat pane** and the preview pane are not duplicating content.
* [ ] Add affordances for:

  * Download as `.md` / `.txt` (future phase).
  * “Open in editor” placeholder action.

### S4.3 – Left Command Tabs: Rethink Layout

CommandBar tabs to refine:

* **Keep / strengthen:**

  * BrewAssist main chat
  * Toolbelt & Task summary views
* **Rework / replace:**

  * `/task create file` tab → convert to something higher-value:

    * e.g., **Project Switcher** or **Research Assist**.
  * Delete tab → rely on BrewAssist + Toolbelt instead of a dedicated tab.

### S4.4 – Future Slots (Design Only, Not Coded Yet)

Reserve space in the UI for:

* **Project Switcher Tab** (wired to BrewJump/Env awareness):

  * Show current project (BrewExec, BrewSearch, BrewLotto, etc.).
  * Buttons or list to switch context (informational in UI; actual cd handled by shell + BrewEnv).
* **Researcher Panel Tab**:

  * Long-term: tie into NIM / external research.
  * Highlight-to-research UX: select BrewAssist text → send to researcher → return summarized insight for BrewAssist to act on.
* **BrewTruth Panel Tab** (future):

  * Show Truth Index, Grump vs Sage commentary, risk / bias metrics.

---

## S5 – Commit Strategy After Stabilization

**Goal:** Avoid noisy, mixed-purpose commits. Keep history readable for you and any future collaborators.

### S5.1 – Grouped Commits (Once Each Block Is Stable)

Planned commit groups:

1. **BrewLast & State Surfaces**

   * `lib/brewLast*`, `/api/brewlast*`, `/api/edit-file`, overlays for BrewLast, `.gitignore` updates for `.brewlast.json`.
2. **Cockpit UI / File Tree / Preview Pane**

   * `BrewCockpitCenter`, `WorkspaceSidebarRight`, `CommandBar` tweaks.
3. **Python Core Adjustments (brewassist_core)**

   * Agent / planner / hrm_chain updates once design is locked.
4. **Future Features (BrewTruth, Researcher, Project Switcher)**

   * Each as its own labeled commit series.

### S5.2 – Stabilization Check Before Each Commit

Before each grouped commit:

* [ ] `pnpm lint`
* [ ] `pnpm test` (or scoped tests) – even if failing, document known failures.
* [ ] `pnpm typecheck`
* [ ] Manual UI smoke test in the Cockpit.

If all pass or failures are documented and expected → then stage & commit.

---

## Quick Summary for Future You

* **S1** – Fence noise out: `.gitignore` + clarify which files live in the repo vs local-only.
* **S2** – Harden BrewAssist Engine chain + Toolbelt: correct engine ordering, OpenAI format, and overlay security.
* **S3** – Make BrewLast/BrewLog a first-class, stable feature powering BrewStatus + UI.
*   **S4** – Fix and enhance Cockpit UI: file tree scroll, highlights, preview pane behavior, and prep slots for Project Switcher, Researcher, and BrewTruth.
*   **S5** – Use small, themed commits to keep your git history readable and confidently recoverable.

This roadmap should be updated as we complete each stabilization block and before introducing major new features like BrewTruth Engine or NIM-backed Researcher integration.

---

## S4.5 – Sandbox & Self-Maintenance

**Goal:** Isolate all AI-driven development, self-repair, and code generation to a safe, observable, and RB-gated environment. This is the "AI Evolution Layer."

### S4.5.1 – Sandbox-Only Development

*   [ ] All new code for the Self-Maintenance, Self-Debugging, Patch, and Guardrails engines MUST be created within the `/sandbox` directory or as `lib/brewSandbox*.ts` modules.
*   [ ] The AI (BrewAssist) is forbidden from directly writing to or modifying files in `pages/`, `components/`, `brewassist_core/`, or other production directories.
*   [ ] All AI-generated code modifications are written to a sandboxed mirror of the repository located at `sandbox/mirror/run-[id]/`.

### S4.5.2 – RB-Gated Patch Application

*   [ ] Changes from the sandbox mirror are only applied to the real repository via a formal patch-apply process, which requires explicit approval from RB.
*   [ ] Every sandbox run, including scans, diagnostics, and fix generations, is logged to `.brewlast.json` and stored in `sandbox/runs/` for full traceability.

> Intent: This two-tiered approach keeps the production application stable and safe, while empowering BrewAssist to autonomously identify, diagnose, and propose fixes for its own codebase within a controlled environment. It is the foundation for future automated CI/CD and self-healing capabilities.