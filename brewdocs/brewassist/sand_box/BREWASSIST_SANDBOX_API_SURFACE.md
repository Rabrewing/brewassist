☕ BrewAssist Sandbox Mode – Full API Surface

Subsystem: S4.5 — Sandbox Mode
Status: COMPLETE
Owners: RB (Architect), BrewAssist (AI)


---

🔥 1. Overview

This document defines the complete HTTP API for the BrewAssist Sandbox & Self-Maintenance Engine.
All endpoints are local-first, repo-safe, and guardrail enforced.

Every endpoint follows:

POST for mutations

GET for reads

JSON bodies

Consistent response envelope:


{
  "ok": true,
  "error": null,
  "data": { ... },
  "meta": { "timestamp": "2025-11-26T12:00:00Z" }
}

Errors follow:

{
  "ok": false,
  "error": "S4.5_SANDBOX_WRITE_VIOLATION",
  "details": { ... }
}


---

🟥 2. Root Directory Structure (Contract)

All APIs assume the following structure exists:

sandbox/
  mirror/              ← AI writes only here
  runs/
    run-[timestamp]/
      scan.json
      diagnostics.json
      fix.json
      diff.txt
      patch.diff
      truthReview.json
      metadata.json
      bundle.tar.gz


---

🟦 3. Core Sandbox APIs


---

3.1 POST /api/brewassist-sandbox/run

Runs a single tool inside the sandbox context.

Body:

{
  "tool": "write_file",
  "args": ["sandbox/mirror/test.txt"],
  "stdin": "hello"
}

Response:

{
  "ok": true,
  "data": {
    "stdout": "OK: wrote sandbox/mirror/test.txt",
    "stderr": "",
    "exitCode": 0
  }
}

Guardrails:

Rejects writes outside sandbox (A1, A2).

Always logs into .brewlast.json.



---

3.2 POST /api/brewassist-sandbox/scan

Runs the Scan Engine and writes to:

sandbox/runs/run-[timestamp]/scan.json

Response:

{
  "ok": true,
  "data": {
    "issuesFound": 12,
    "scanPath": "sandbox/runs/run-1764200000/scan.json"
  }
}


---

3.3 POST /api/brewassist-sandbox/diagnostics

Runs the Diagnostic Engine.

Inputs: none
Uses most recent scan.json.

Outputs to:

sandbox/runs/run-[timestamp]/diagnostics.json


---

**3.4 POST /api/brewassist-sandbox/fix`

Runs the Fix Generator and produces updated files inside the sandbox mirror.

Outputs:

fix.json
patch.diff
diff.txt


---

3.5 POST /api/brewassist-sandbox/bundle

Creates:

bundle.tar.gz
metadata.json

For RB review.


---

🟩 4. Maintenance Engine APIs


---

4.1 POST /api/brewassist-sandbox-maintenance?action=run

Runs the full S4.5 self-maintenance loop:

1. Scan


2. Diagnostics


3. Fix Generator


4. Patch Engine


5. Truth Review


6. Bundle


7. BrewLast log



Response:

{
  "ok": true,
  "data": {
    "runId": "run-1764200303",
    "issuesFound": 3,
    "riskLevel": "LOW",
    "bundle": "sandbox/runs/run-1764200303/bundle.tar.gz"
  }
}


---

4.2 GET /api/brewassist-sandbox-maintenance/last

Returns:

last run metadata

last truth review

last bundle path

last diagnostics

last scan summary



---

🟨 5. Patch Engine APIs


---

5.1 POST /api/brewassist-sandbox/patch/diff

Returns unified diff between sandbox and real repo.

Body:

{ "target": "lib/brewassistChain.ts" }


---

5.2 POST /api/brewassist-sandbox/patch/apply

❗ Sandbox only — applies patch to mirror.

Body:

{
  "diff": "--- original\n+++ sandbox\n..."
}

Guardrails:

Patch width limited (#lines < 150)

truthScore must be >= 0.75

riskLevel cannot be HIGH



---

🟧 6. BrewTruth APIs (for S4.5 integration)


---

6.1 POST /api/brewtruth

Standard truth scoring.

{
  "userPrompt": "This patch improves stability.",
  "code": "diff..."
}


---

6.2 GET /api/brewtruth/health

Returns:

truth engine status

last risk level

last truthScore

version

sandbox integration flags



---

🟪 7. Guardrails APIs (Critical)


---

7.1 POST /api/brewassist-guardrails/check

Checks safety rules for a given action.

Request:

{
  "action": "file_write",
  "path": "sandbox/mirror/lib/test.ts",
  "diffLineCount": 22
}

Response:

{
  "ok": true,
  "data": { "allowed": true }
}

Or:

{
  "ok": false,
  "error": "S4.5_LARGE_DIFF_BLOCKED",
  "details": {
    "limit": 150,
    "actual": 324
  }
}


---

7.2 GET /api/brewassist-guardrails/rules

Returns all enforced rules:

sandbox write rules

patch rules

truth rules

persona rules

safety overrides



---

🟫 8. Persona APIs (Cross-linked with S4.4)


---

8.1 POST /api/brewassist-persona

Handles:

Tone

Emotion

Memory Window

Style

Persona selection


Now enriched with:

Maintenance triggers

Self-repair suggestions

Safety gate enforcement


---

8.2 GET /api/brewassist-persona/health

Shows:

personaId

memoryWindow

last memory write

last suggestion

sandbox access flag

safetyMode


---

🟫 9. BrewLast APIs (Cross-linked with S3)


---

9.1 GET /api/brewlast

Full BrewLast state.


---

9.2 POST /api/brewlast-apply

Writes new BrewLast state.

Used by:

Maintenance

Sandbox

Guardrails

Persona


---

🟦 10. Acceptance Tests for All APIs

Must pass all tests:

✔ Test 1 — All endpoints respond

✔ Test 2 — All POST endpoints validate input

✔ Test 3 — All sandbox writes blocked outside mirror

✔ Test 4 — Patch engine denies unsafe modifications

✔ Test 5 — BrewTruth blocks high-risk diffs

✔ Test 6 — Guardrails enforce limits

✔ Test 7 — Maintenance loop runs end-to-end

✔ Test 8 — Persona integrates with sandbox

✔ Test 9 — BrewLast logs all actions

✔ Test 10 — Health endpoints reflect S4.4 + S4.5 state


---

🟦 S4.5 — COMPLETE

All 10 documents delivered.
Gemini can now build the full subsystem.


---

If you want, I can now generate:

🔥 S4.5 Implementation ZIP Folder Structure
🔥 Gemini Implementation Checklist
🔥 S4.6 Spec (Autopatch & Deploy Engine)
🔥 OR begin prepping the Big Commit #2 Plan

Tell me which direction you want.
