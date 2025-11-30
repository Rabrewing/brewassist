# Phase S3 – BrewLast Bring‑Up & Logging Engine

**Project:** BrewExec / BrewAssist DevOps Cockpit
**Phase:** S3 – BrewLast Filesystem Logging
**Date:** 2025‑11‑25
**Owner:** RB + Production ChatG

---

## 1. Purpose

S3 establishes **BrewLast** as the canonical, filesystem‑based log of the most recent BrewAssist toolbelt actions. The goal is to:

* Track the *last* tool run (tool name, args, cwd, exit code, timestamps).
* Maintain a small rolling **history** array for quick inspection and audit.
* Expose a simple **API surface** so BrewAssist, BrewJump, and future UIs can read this state.
* Stay **database‑free** for now (pure `.brewlast.json` on disk) to keep S3 lightweight and reversible.

This phase is intentionally filesystem‑only. Any DB‑backed BrewLast v2 will be a **future upgrade**, not part of S3.

---

## 2. Final Design

### 2.1 Storage

* **File:** `~/.brewlast.json` (resolved by server helpers)
* **Format:** JSON document with a stable schema (v1).

```jsonc
{
  "version": 1,
  "projectRoot": "/home/brewexec",
  "lastUpdated": "2025-11-25T16:30:01.946Z",
  "lastToolRun": {
    "id": "1764088201946-write_file",
    "tool": "write_file",
    "args": ["sandbox/s3_test.txt"],
    "cwd": "/home/brewexec",
    "timestamp": "2025-11-25T16:30:01.946Z",
    "exitCode": 0,
    "stdout": "OK: wrote sandbox/s3_test.txt",
    "stderr": "",
    "summary": "write_file([\"sandbox/s3_test.txt\"]) → exitCode=0",
    "ok": true
  },
  "history": [
    {
      "id": "1764088201946-write_file",
      "tool": "write_file",
      "args": ["sandbox/s3_test.txt"],
      "cwd": "/home/brewexec",
      "timestamp": "2025-11-25T16:30:01.946Z",
      "exitCode": 0,
      "stdout": "OK: wrote sandbox/s3_test.txt",
      "stderr": "",
      "summary": "write_file([\"sandbox/s3_test.txt\"]) → exitCode=0",
      "ok": true
    }
  ]
}
```

> **Key decision:** S3 uses a **single file** with a small `history` array, not a growing log file. This keeps reads fast and avoids runaway disk usage.

---

### 2.2 Server Helpers

Implemented in `lib/brewLast.ts` / `lib/brewLastServer.ts`:

* `loadBrewLastState()` – Safely read and parse `.brewlast.json`.
* `saveBrewLastState(update)` – Merge + write updated state.
* `appendToolRun(run)` – Convenience helper for adding a new `lastToolRun` and pushing into `history`.

**Behavioral rules:**

* If the file does **not** exist, helpers create a default v1 structure.
* If the file is corrupted, helpers fall back to a minimal structure and log an error (no crash).
* `history` length can be capped in future phases (e.g., last 50 entries) – not enforced yet, but the schema is ready.

---

### 2.3 API Surface

#### `/api/brewlast` (GET)

* Returns the fully parsed `.brewlast.json` state.
* Shape:

```ts
{
  ok: boolean;
  state?: BrewLastState; // see schema above
  error?: string;
}
```

Used by:

* CLI & curl checks (`curl -s /api/brewlast | jq`).
* Overlays such as `brew_open_last_action.sh`.
* Future UIs (e.g., BrewLast panel, Truth/History tabs).

#### Integration: `/api/llm-tool-call`

* After each **toolbelt** action (e.g. `write_file`, `read_file`, `list_dir`, `run_shell`, `git_status`, `run_lint`, etc.),
  the API now:

  * Captures a **normalized tool run record**.
  * Calls the BrewLast helper to update `lastToolRun` and append to `history`.
  * Writes the result to `.brewlast.json`.

This is the core S3 win: **every toolbelt call is now auditable** via BrewLast.

---

### 2.4 CLI / Overlay Tools

New overlay scripts added in S3:

1. **`overlays/brew_status_snapshot.sh`**

   * Purpose: Quick BrewVerse‑aware environment snapshot.
   * Prints project, root, cwd, env info, and hints for debugging.

2. **`overlays/brew_open_last_action.sh`**

   * Purpose: Human‑readable view of the last BrewAssist toolbelt action.
   * Internals:

     * Calls `/api/brewlast` via `curl`.
     * Uses `jq` to extract `.state.lastToolRun`.
     * Prints a formatted block with tool, args, exit code, and timestamps.

3. **`overlays/brew_log_update.sh`**

   * Purpose: Append developer notes into `BrewUpdates.md` (Phase S3+), keeping a human log in sync with BrewLast telemetry.

> Note: These overlays are part of the **Tier 3 Toolbelt** and were smoke‑tested in S3 alongside the BrewLast engine.

---

## 3. S3 Acceptance Tests (Final)

### 3.1 Toolbelt → BrewLast Logging

**Test 1 – Toolbelt write → BrewLast JSON**

1. Ensure Next.js dev server is running: `pnpm dev` (env: `.env.local -> .env.brewexec`).
2. From the project root (`/home/brewexec`), call the Toolbelt API:

```bash
curl -s -X POST http://localhost:3000/api/llm-tool-call \
  -H "Content-Type: application/json" \
  -d '{"tool":"write_file","args":["sandbox/s3_test.txt"],"stdin":"s3 test"}'
```

3. Expected response:

   * `ok: true`
   * `tool: "write_file"`
   * `args: ["sandbox/s3_test.txt"]`
   * `exitCode: 0`

4. Then read BrewLast:

```bash
curl -s http://localhost:3000/api/brewlast | jq
```

5. Expected shape:

   * `state.version === 1`
   * `state.projectRoot === "/home/brewexec"`
   * `state.lastToolRun.tool === "write_file"`
   * `state.lastToolRun.args[0] === "sandbox/s3_test.txt"`
   * `state.history[0]` mirrors `lastToolRun`.

**Result:** ✅ Confirmed via screenshot and JSON output.

---

### 3.2 Overlay – brew_open_last_action

**Test 2 – Human‑readable overlay view**

1. Run the overlay directly:

```bash
bash overlays/brew_open_last_action.sh
```

2. Expected output (example):

```text
=== Last BrewAssist Action ===
Tool: write_file
Args: @sandbox/s3_test.txt
Summary: write_file(["sandbox/s3_test.txt"]) → exitCode=0
Timestamp: 2025-11-25T16:30:01.946Z

Full details:
{ ...full lastToolRun JSON... }
```

3. Verify that:

   * Tool name and args match the last Toolbelt call.
   * Exit code and summary line are correct.
   * The timestamp matches `lastUpdated` in `.brewlast.json`.

**Result:** ✅ Confirmed via console output and captured in screenshots.

---

## 4. Decisions & Non‑Goals

### 4.1 Locked‑In Decisions

* **Filesystem‑only:** BrewLast v1 is backed by `.brewlast.json` only. No DB tables, no Supabase integration in S3.
* **Single source of truth:** `/api/llm-tool-call` writes BrewLast; overlays and UIs **only read** from the file via `/api/brewlast` or server helpers.
* **Schema v1:** The JSON structure above is considered stable for S3/S4 work. Future changes will bump `version` and include a migration path.

### 4.2 Explicit Non‑Goals

* No long‑term audit log or analytics yet (that will belong to BrewPulse/BrewAudit later).
* No per‑project BrewLast files; S3 is scoped to the main BrewExec workspace.

---

## 5. Impact on Later Phases

S3 unlocks several future capabilities:

* **S4 BrewTruth Engine:** BrewTruth can consume BrewLast snapshots to understand *what just happened* (tool, cwd, status) when auditing answers.
* **UI History Panels:** A small BrewLast pane can show “Last toolbelt actions” for contributors and reviewers.
* **BrewAudit & BrewPulse:** Future phases can stream BrewLast entries into richer telemetry dashboards, without changing the S3 contract.

> In short, S3 makes BrewAssist **stateful and inspectable**: every toolbelt action now leaves a structured trace for truth engines, audits, and future contributors.

---

## 6. S3 Completion Statement

* ✅ BrewLast `.brewlast.json` engine implemented.
* ✅ `/api/brewlast` and server helpers wired and stable.
* ✅ `llm-tool-call` now logs all toolbelt runs into BrewLast.
* ✅ `brew_open_last_action.sh` + `brew_status_snapshot.sh` overlays working.
* ✅ S3 acceptance tests passed (write_file → BrewLast → overlay verification).

**Phase S3 is complete and locked.** BrewLast v1 is ready to support S4 BrewTruth and downstream BrewAudit/BrewPulse work.
