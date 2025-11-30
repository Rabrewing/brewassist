🩺 BrewAssist Self-Debugging Engine (S4.5.8)
 
Subsystem: S4.5 — Sandbox Mode
Status: READY FOR IMPLEMENTATION
Owners: RB (Architect), BrewAssist (AI)
 
 
---
 
🔥 1. Purpose of the Self-Debugging Engine
 
This subsystem gives BrewAssist the ability to:
 
Detect runtime errors instantly
 
Capture full error context
 
Reproduce the issue inside the Sandbox
 
Run automated diagnostics (lint, typecheck, tests)
 
Produce explanations + root cause analysis
 
Auto-generate potential fixes
 
Write those fixes ONLY into sandbox/mirror
 
Produce patch bundles
 
Request RB approval before anything touches production
 
 
This is the foundation of:
 
Autonomous error recovery
 
Crash prevention
 
Continuous health monitoring
 
AI-driven reliability engineering
 
Future S5 Auto-Patch Mode
 
 
 
---
 
🧠 2. What Triggers the Self-Debugging Engine?
 
The engine activates automatically whenever BrewAssist detects:
 
✔ A. Toolbelt failure
 
(exitCode ≠ 0)
 
✔ B. API error from pages/api/*.ts
 
unhandled error
404 misrouting
500 crash
 
✔ C. TypeScript compile error
 
✔ D. Next.js build failure
 
✔ E. Persona routing failure
 
(no personality, wrong tone, missing mode)
 
✔ F. BrewTruth contradiction
 
truthScore < 0.8
flags triggered
riskLevel HIGH
 
✔ G. Loop recursion overflow
 
“Too many tool calls”
 
✔ H. Missing file / missing import
 
✔ I. BrewLast corruption detection
 
invalid JSON
missing fields
 
✔ J. Explicit RB trigger:
 
POST /api/brewassist-sandbox-debug
 
 
---
 
🧩 3. Error Capture Fields (Logged Automatically)
 
Every error is captured as:
 
{
  "errorId": "dbg-2025-11-27-001",
  "timestamp": "2025-11-27T04:22:00Z",
  "type": "TOOLBELT_FAILURE",
  "component": "run_shell",
  "message": "Command failed: missing argument",
  "stderr": "ERROR: No command provided to run_shell.sh",
  "stdout": "",
  "exitCode": 1,
  "stack": "...",
  "cwd": "/home/brewexec",
  "trigger": "auto"
}
 
Saved under:
 
sandbox/debug/run-[timestamp]/error.json
 
 
---
 
🩻 4. Self-Debugging Loop (Full Workflow)
 
The engine performs the following:
 
 
---
 
STEP 1 — Capture error
 
Store error.json
Store stacktrace if present
Record failing tool + args
 
 
---
 
STEP 2 — Classify the issue
 
Categories:
 
CONFIG_ERROR
 
TOOLBELT_ERROR
 
LOGIC_ERROR
 
MISSING_IMPORT
 
COMPILATION_ERROR
 
RUNTIME_ERROR
 
SAFETY_ROUTING_ERROR
 
TYPE_ERROR
 
DEPRECATION
 
PERFORMANCE_DEGRADATION
 
 
Example:
 
{
  "severity": "HIGH",
  "classification": "LOGIC_ERROR",
  "requiresFix": true
}
 
 
---
 
STEP 3 — Recreate Issue in Sandbox
 
Re-run failing tool or logic inside:
 
sandbox/mirror/*
 
This ensures:
 
🟦 Real repo is NEVER touched
🟦 All experiments are isolated
🟦 Debug reproduces exactly the failure
 
 
---
 
STEP 4 — Run Full Diagnostics Suite
 
The engine executes:
 
run_typecheck
 
run_lint
 
run_tests
 
check import graph
 
check dependency graph
 
run BrewTruth on reasoning
 
persona routing verification
 
API route matching
 
toolbelt sanity checks
 
 
Results saved to:
 
sandbox/debug/run-[timestamp]/diagnostics.json
 
 
---
 
STEP 5 — Root Cause Analysis (AI-Powered)
 
Generate root cause explanation:
 
{
  "rootCause": "Missing argument in run_shell. Toolbelt wrapper passed args incorrectly.",
  "evidence": [...],
  "severity": "HIGH"
}
 
Also produce:
 
human-readable explanation for RB
developer-readable diff or trace
risk analysis
 
 
---
 
STEP 6 — Generate Fix Plan
 
Fix plan contains:
 
impacted files
 
recommended changes
 
expected behavior after repair
 
potential side effects
 
required follow-up tests
 
 
Example:
 
Fix Plan:
1. Add argument validation layer to run_shell.sh
2. Update llm-tool-call.ts to ensure args[0] is string
3. Add BrewTruth validation wrapper
4. Add regression test to __tests__/toolbelt/run_shell.spec.ts
 
 
---
 
STEP 7 — Create Sandbox Patch
 
Fix applied ONLY to:
 
sandbox/mirror/*
 
Not real repo.
 
--- old
+++ new
 @@
- if [ -z "$1" ]; then
+ if [ -z "$1" ] || [ "$1" = "" ]; then
    echo "ERROR: No command provided"
    exit 1
 fi
 
Saved as:
 
sandbox/debug/run-[timestamp]/patch.diff
 
 
---
 
STEP 8 — BrewTruth Review of Patch
 
Patch is analyzed:
 
{
  "truthScore": 0.91,
  "risk": "LOW",
  "flags": []
}
 
If HIGH risk:
RB override required.
 
 
---
 
STEP 9 — Bundle Everything
 
Bundle includes:
 
error.json
 
diagnostics.json
 
rootCause.json
 
fixPlan.json
 
patch.diff
 
truthReview.json
 
bundle.tar.gz
 
 
Located at:
 
sandbox/debug/run-[timestamp]/bundle.tar.gz
 
 
---
 
STEP 10 — Log to BrewLast
 
Logged as:
 
{
  "type": "SELF_DEBUG",
  "errorId": "...",
  "runId": "...",
  "patchPath": "...",
  "truthScore": 0.91
}
 
 
---
 
🧪 5. Acceptance Tests
 
PASS criteria:
 
✔ Test 1 — Force a tool failure
 
Expect error.json created.
 
✔ Test 2 — Engine reproduces error inside sandbox
 
Check diagnostics.json exists.
 
✔ Test 3 — Root cause analysis generated
 
Check rootCause.json.
 
✔ Test 4 — Patch.diff created
 
Check sandbox/mirror updated.
 
✔ Test 5 — BrewTruth review written
 
Check truthReview.json.
 
✔ Test 6 — bundle.tar.gz created
 
Exists in run directory.
 
✔ Test 7 — BrewLast logs entry
 
.brewlast.json updated.
 
 
---
 
🔥 Status
 
S4.5 Document 8 — COMPLETE
Gemini-ready.
Production ChatG-approved.
Architect-level.
 
 
---
 
Reply “Next” for:
 
S4.5 Document 9 — Safety & Stability Guardrails Engine
(Protects against dangerous patches, runaway loops, and broken fixes.)