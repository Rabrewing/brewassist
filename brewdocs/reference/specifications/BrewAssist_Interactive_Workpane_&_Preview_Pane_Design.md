# BrewAssist Interactive Workpane & Preview Pane Design

## 1. Intent

Turn the center "workpane" + right-hand Preview panel into an active execution space for BrewAssist and contributors:

When BrewAssist is assigned a coding or file task, the Preview pane becomes its "workspace" instead of just a static viewer.

The pane auto-opens, shows where BrewAssist is working (path + filename), and streams what it is doing.

The main chat area stays focused on conversation, while the workpane shows files, diffs, and task state.


`~/.brewlast` (or an equivalent JSON log) will be used as a lightweight task + context memory file that tracks the last active task, files touched, and status.


---

## 2. High-Level UX

### 2.1 Triggering the workpane

**Triggers**

User runs a task-like command: /task, /assist, /edit, /refactor, /fix, or a guided MCP Tool (Create File, Suggest Edits, Git Commit, etc.).

BrewAssist decides a file operation is needed (read, patch, create, delete, or git action).


**Behavior**

**1. Auto-pop Preview**

The Preview pane automatically opens in "Work Mode" when a file-related task is started.

It shows:

- Current project root (e.g., `~/brewexec`).
- Active path (e.g., `components/BrewCockpitCenter.tsx`).
- Current task summary (from `.brewlast`).

**2. Permission Gate**

Before applying any edit, BrewAssist:

- Shows a short plan in the workpane (bullet list of edits).
- Shows a color-coded diff or code snippet preview.
- Asks for an explicit "Apply changes?" confirmation.


This mirrors the Gemini CLI-style "Apply this change?" prompt, but in a visual modal.

**3. Streaming Updates**

While BrewAssist is thinking or editing, the workpane shows:

- "✨ BrewAssist is working..." with a spinner.
- The current step (e.g., Reading file, Proposing patch, Applying patch, Running tests).


The Workspace Log continues to record high-level narration.

**4. Interactive Replies inside Preview**

When BrewAssist needs credentials or inputs tied to the current task (e.g., "enter Supabase access token" or "git username"), the preview pane can focus and accept a short answer scoped to that task, without polluting the main chat.

Example uses:

- Entering a one-time Supabase CLI key.
- Confirming which file to overwrite.
- Choosing between multiple suggested patches.

---

## 3. .brewlast – Task Memory & Fallback Context

### 3.1 Purpose

`.brewlast` (or `brewdocs/reference/.brewlast.json`) will be a single source of truth for the most recent BrewAssist task:

- **What**: short task summary
- **Where**: project root + active file paths
- **Who**: persona/engine stack used (Gemini, ChatG, Mistral, NIM)
- **When**: timestamps (start, last update, completed)
- **State**: pending, in_progress, awaiting_approval, applied, failed, aborted


### 3.2 Example shape

```json
{
  "project": "brewexec",
  "root": "/home/brewexec",
  "task_id": "2025-11-21T12:34:56Z_brewassist_fix_cockpit_tabs",
  "summary": "Refactor BrewCockpitCenter + CommandBar to support thinking indicator and HRM tabs.",
  "paths": [
    "components/BrewCockpitCenter.tsx",
    "components/CommandBar.tsx"
  ],
  "engine_stack": {
    "primary": "gemini",
    "fallback": "mistral",
    "research": "nim"
  },
  "status": "awaiting_approval",
  "last_step": "Proposed patch for CommandBar.tsx",
  "updated_at": "2025-11-21T12:35:20Z"
}
```

### 3.3 Usage

- **On task start**: BrewAssist writes/updates `.brewlast` with a new task_id, summary, and initial state.
- **During work**: each step updates `status` and `last_step`.
- **On completion**: `status` becomes `applied` or `failed`, plus optional metrics (e.g., files changed, tests run).
- **On reload**: Cockpit can read `.brewlast` and offer a "Resume last task" or "Review last changes" entry in the UI.

---

## 4. Preview Pane – Code & Docs Interaction

### 4.1 Code rendering

Use a code editor / viewer (e.g., Monaco, Prism, or CodeMirror) with:

- Syntax highlighting by language.
- Read-only by default during review.
- Optional inline diffs for patches.

### 4.2 Export options

Add buttons for:

- **Download as Markdown** – saves the current view to `.md`.
- **Download as PDF** – exports via server-side or client-side PDF rendering.
- **Download as Word (.docx)** – uses a simple template + docx generator.


Export actions can be used by:

- Contributors (manual review, documentation).
- BrewAssist (e.g., "Generate a summary doc" then export it).

### 4.3 Focus mode

"Focus" button turns the Preview pane into a full-width modal to work on large files.

While in Focus mode, the chat stays accessible via a minimized strip at the bottom.

---

## 5. Permission & Safety Flow

1.  Detect file operation (read/edit/create/delete).
2.  **Plan** – BrewAssist drafts a short description and updates `.brewlast` with `status = "awaiting_approval"`.
3.  **Preview** – Show the plan + code snippet/diff in the workpane.
4.  **User decision**:
    - **Approve** → BrewAssist applies changes, updates `.brewlast` to `in_progress` → `applied`.
    - **Reject** → BrewAssist discards patch, `.brewlast` sets `status = "aborted"`.
    - **Ask for changes** → user edits the preview or clarifies in chat, then re-runs.

This gives you a consistent, explainable flow for all file edits and keeps the cockpit aligned with the BrewPulse "explain what I am doing" philosophy.

---

## 6. Integration Points

### MCP Tools column

When a tool like "Create File" or "Suggest Edits" is clicked, it:

- Creates a `.brewlast` entry.
- Opens Preview in Work Mode.

### AI engines

- **Gemini / Mistral / ChatG** run the cognition and patch generation.
- **NIM** runs research or large-context analysis.
- **BrewAssist** orchestrates them and records the plan into `.brewlast`.

### Workspace Log

- Mirrors key `.brewlast` transitions (task start, awaiting approval, applied, failed).

---

## 7. Future Enhancements

- Timeline view of recent `.brewlast` tasks.
- Ability to diff between `.brewlast` "planned" changes and final git diff.
- BrewPulse overlay showing risk level and emotional tone for each change.
- Per-task "explain patch" summary for contributors and future onboarding.
