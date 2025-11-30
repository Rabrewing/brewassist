# BrewAssist DevOps Cockpit – Help & Toolbelt Guide

Last updated: 2025-11-24  
Scope: **BrewExec Next.js app + BrewAssist Toolbelt (Tiers 1–3)**

---

## 1. What BrewAssist Is

BrewAssist is your **DevOps copilot** wired directly into the BrewExec codebase.

- Frontend: BrewAssist DevOps Cockpit (Next.js 16, Turbopack)
- Brain: OpenAI (primary), local TinyLLaMA (fallback), Gemini CLI (external)
- Toolbelt: Secure shell + file operations exposed via `/api/llm-tool-call`
- Context: Project-aware via `.env.local`, BrewVerse env helpers, and BrewLast logs

You talk in natural language.  
BrewAssist translates that into **concrete actions** using the Toolbelt.

---

## 2. How to Start BrewAssist

From Ubuntu (WSL):

```bash
cd ~/brewexec
pnpm dev
```

Then open:

Cockpit UI: http://localhost:3000


Optional jump via BrewJump:

`brewjump`  # choose BrewExec

Once the cockpit loads, type into the input:

`> “/assist help”`
`“/task suggest”`
`“Run lint and tell me what passed or failed.”`



---

## 3. Toolbelt Overview – How It Works

The Toolbelt is exposed through the API:

Endpoint: `POST /api/llm-tool-call`

Body: `{ "tool": "<name>", "args": [...], "stdin": "optional text" }`


BrewAssist calls this endpoint internally when it decides a tool is needed.

Security rules:

All paths are resolved under `/home/brewexec`.

Tools refuse anything that escapes the project root.

Every action is logged through stdout, stderr, and exit codes.



---

## 4. Tier 1 – Core Toolbelt (Fully Implemented)

These are the primitives that make BrewAssist feel like a real DevOps operator.

### 4.1 write_file

Overlay: `overlays/write_file.sh`

Purpose: Create/overwrite a text file.

Args: `[path]`, `stdin` as file content.

Example (curl):


```bash
curl -s -X POST http://localhost:3000/api/llm-tool-call \
  -H "Content-Type: application/json" \
  -d '{"tool":"write_file","args":["sandbox/demo.txt"],"stdin":"hello BrewAssist"}'
```

What success looks like:

`{"ok":true,"stdout":"OK: wrote sandbox/demo.txt","exitCode":0}`


---


### 4.2 read_file

Overlay: `overlays/read_file.sh`

Purpose: Read file contents.

Args: `[path]`


```bash
curl -s -X POST http://localhost:3000/api/llm-tool-call \
  -H "Content-Type: application/json" \
  -d '{"tool":"read_file","args":["sandbox/demo.txt"]}'
```


---


### 4.3 list_dir

Overlay: `overlays/list_dir.sh`

Purpose: List directory contents.

Args: `[path]` – `.` for project root


> ✅ Security fix: root path (`.` → `/home/brewexec`) is now allowed.



```bash
curl -s -X POST http://localhost:3000/api/llm-tool-call \
  -H "Content-Type: application/json" \
  -d '{"tool":"list_dir","args":["."]}'
```


---


### 4.4 search_code

Overlay: `overlays/search_code.sh`

Purpose: Grep-style code search.

Args: `[query, path]`


Example:

```bash
curl -s -X POST http://localhost:3000/api/llm-tool-call \
  -H "Content-Type: application/json" \
  -d '{"tool":"search_code","args":["brewassistChain","lib"]}'
```


---


### 4.5 run_shell

Overlay: `overlays/run_shell.sh`

Purpose: Run whitelisted shell commands.

Args: `[command]`


Example (safe):

```bash
curl -s -X POST http://localhost:3000/api/llm-tool-call \
  -H "Content-Type: application/json" \
  -d '{"tool":"run_shell","args":["pnpm -v"]}'
```

If the command isn’t in the allowlist, the tool will refuse it.


---


## 5. Tier 2 – DevOps & Git Operations

These tools are for day-to-day developer workflows.

### 5.1 git_status

Overlay: `overlays/git_status.sh`

Purpose: Show branch + short status.

Args: none


Example BrewAssist prompt:

`> “/task run git_status and summarize what’s changed since last commit.”`




---


### 5.2 run_tests

Overlay: `overlays/run_tests.sh`

Purpose: Run project tests (currently `pnpm test`).

Args: optional scope (future: `unit | e2e`)


Note: Right now this surfaces real test failures; the tool itself is healthy.


---


### 5.3 run_lint

Overlay: `overlays/run_lint.sh`

Purpose: Run ESLint with the narrowed BrewExec scope.

Script (in `package.json`):


```json
"scripts": {
  "lint": "eslint pages components lib contexts --ext .ts,.tsx,.js,.jsx"
}
```

What changed:

- Stopped using `next lint` (buggy + unclear errors).
- Stopped linting the entire `/home/brewexec` monorepo.
- Migrated ignore rules into `eslint.config.js` → `ignores: [...]`.
- Resolved `no-fallthrough` in `lib/openaiToolbelt.ts`.



Example:

`> “/task run_lint and tell me if BrewExec passes.”`




---


### 5.4 run_typecheck

Overlay: `overlays/run_typecheck.sh`

Purpose: TypeScript validation (e.g. `pnpm typecheck` or `tsc --noEmit`).

Behavior: If TS errors exist, the tool still “works” but returns non-zero exit code and surfaces the problems.



---


## 6. Tier 3 – BrewVerse-Native Tools

These tools make BrewAssist aware of the BrewVerse, not just files.

### 6.1 brew_status_snapshot

Overlay: `overlays/brew_status_snapshot.sh`

Purpose: Quick snapshot of environment:

- Current project
- Root + CWD
- Last loaded `.env.local`
- Quick git status summary



Example prompt:

`> “Show me a Brew status snapshot and tell me which project I’m in.”`




---


### 6.2 brew_open_last_action

Overlay: `overlays/brew_open_last_action.sh`

Purpose: Read `.brewlast.json` (or equivalent) and surface your last toolbelt action.


Current state:

- Reads the file correctly.
- Depends on other parts of the system writing `.brewlast.json`.
- If nothing is updating that file, the tool will expose that as a gap (this is by design).



---


### 6.3 brew_log_update

Overlay: `overlays/brew_log_update.sh`

Purpose: Append messages to your running log file (e.g. `brewdocs/BrewUpdates.md`).


Example:

`> “Log an update that Tier 2 tooling is fully tested and stable.”`



---


## 7. Linting System Overhaul – Quick Summary

- Migrated from `next lint` to direct ESLint.
- Fixed “Invalid project directory” and heap out-of-memory crashes.
- ESLint now:
  - Targets only `pages`, `components`, `lib`, `contexts`.
  - Uses `eslint.config.js` with `ignores: [...]` instead of `.eslintignore`.
  - Passes cleanly: 0 errors, 0 warnings for BrewExec app.



Toolbelt integration:

- `run_lint` calls `pnpm lint`.
- `/api/llm-tool-call` → `tool: "run_lint"` gives BrewAssist a structured view of success/failure.



---


## 8. BrewAssist Help UI – Planned Enhancements

These are the UI/UX upgrades that will sit on top of this guide.

### 8.1 Project Switcher Panel (Left Side)

Dedicated tab: “Switch Project / Environment”

Shows:

- Current project (BrewExec, BrewSearch, BrewLotto, etc.)
- Available targets (mirrors `brewjump` options).
- One-click buttons to:
  - Switch context
  - Load the right `.env.local`
  - Confirm new path in the file tree



Visuals:

- BrewGold frame, BrewTeal hover.
- Active project glows in LED white with subtle pulse.




---


### 8.2 Researcher Panel

New tab: “Researcher”

Purpose: Bring in an external research brain without leaving the cockpit.


Modes:

1. Highlight → Research

- You highlight text in the chat.
- Click “Send to Researcher”.
- Researcher calls web tools / NIM (future) and returns a short brief.


2. Context-Aware Questions

- “Compare this error to known Next.js issues.”
- “Find docs for this API and summarize risks.”



Output goes to a right-side pane, not mixed into the main BrewAssist log.


---


### 8.3 Suggest Edits v2

Current behavior: button = long blurb.
Future behavior:

Button runs a focused “refactor or patch” flow:

1. User selects file + lines in preview.


2. Click “Suggest Edits”.


3. BrewAssist returns:

- A summary of what’s wrong.
- A diff-style patch.
- Optional “Apply Patch” (MCP) hook.



This will make the button feel actionable, not just explanatory.


---


### 8.4 File Tree Cosmetics

Planned improvements:

- Vertical scroll dedicated to the file tree (no more whole-pane scrolling).
- Selected directory/file:
  - BrewGold outline.
  - Subtle BrewTeal glow.


Tree connectors with a faint circuit-board pulse animation on hover.

Sandbox, Preview, and Pop-out controls remain anchored even when tree is tall.



---


## 9. BrewTruth – Using the Sandbox for Honest Audits

“BrewTruth” is the mode where you ask a second model to double-check BrewAssist.

Sandbox prompt template:

`> Role: BrewTruth – brutally honest reviewer`
`Task: Read this BrewAssist summary or code and:`

`1. Tell me what looks correct.`


`2. Call out anything that sounds hand-wavy or suspicious.`


`3. Suggest what tests or commands I should run to verify the claims.`




Use the AI Sandbox panel (bottom-right) with a neutral model (e.g. TinyLLaMA or raw OpenAI) and paste:

`You are BrewTruth, a critical reviewer. I will paste BrewAssist output or docs.`
`Your job:`

`1. Identify claims that are clearly supported by the text.`
`2. Identify any claims that might be wrong, incomplete, or overconfident.`
`3. Suggest concrete commands I should run (pnpm lint, run_lint, git_status, etc.) to verify.`

`Be direct. No ego stroking. Just truth.`

Then paste whatever you want it to audit.


---


## 10. Current Status

Tier 1: Verified via curl + BrewAssist – ✅

Tier 2: `git_status`, `run_tests`, `run_lint`, `run_typecheck` wired and tested – ✅
(tests/typecheck may still fail on real issues, which is expected.)

Tier 3: `brew_status_snapshot`, `brew_log_update` working, `brew_open_last_action` depends on `.brewlast.json` writer – ✅ (with known limitation)


BrewAssist is now a stable v2 engine with a real, tested Toolbelt.


---

