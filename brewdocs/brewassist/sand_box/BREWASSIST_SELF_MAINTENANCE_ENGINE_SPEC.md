# BrewAssist Self-Maintenance Engine Specification  
**Subsystem:** S4.5 — Sandbox Mode  
**File:** Self-Maintenance Engine  
**Status:** READY FOR IMPLEMENTATION  
**Owners:** RB (Architect), BrewAssist (AI)
 
---
 
# 🔥 1. Purpose of the Self-Maintenance Engine
 
The Self-Maintenance Engine enables BrewAssist to:
 
- Detect code problems **automatically**
- Audit his own logic
- Identify inconsistencies and failures
- Propose fixes with BrewTruth risk scoring
- Write those fixes **only inside the Sandbox**
- Generate patch bundles for RB approval
- Track “AI evolution” history across time
- Become smarter with each maintenance cycle
 
This subsystem is the foundation of:
 
- AI-assisted debugging  
- AI-assisted refactoring  
- Autonomous repair  
- Tier-ed self-improvement loops  
- Later: Autopatch and Autodeploy (S5–S6)
 
---
 
# 🧠 2. Self-Maintenance Engine Loop (Core Workflow)
 
MAINTENANCE TRIGGER ↓ SCAN ENGINE (file/logic scan) ↓ DIAGNOSTIC ENGINE (issues found) ↓ BREUTRUTH ANALYZER (risk + truth) ↓ FIX GENERATOR (AI propose fix) ↓ SANDBOX PATCH ENGINE (write) ↓ PATCH & DIFF ENGINE (bundle) ↓ RB REVIEW
 
Every step is logged to:
 
sandbox/runs/run-[timestamp]/
 
---
 
# 🕹 3. Maintenance Modes (RB-Controlled)
 
The engine supports four modes:
 
### ✔ Mode A — Manual Trigger (RB Clicks “Run Maintenance”)
You call:
 
POST /api/brewassist-sandbox-maintenance?action=run
 
### ✔ Mode B — Scheduled (Daily / Weekly / Monthly)
Configured via:
 
brewdocs/BrewAssist_Config.yaml
 
Engine runs automatically and posts results.
 
### ✔ Mode C — Event-Driven
Triggered when:
 
- tool errors spike  
- safety flags appear  
- BrewTruth detects rising contradictions  
 
### ✔ Mode D — Persona-Driven Suggestion
Assistant says:
 
> “RB, I found inconsistencies in BrewAssist Chain v2.  
> Would you like me to run a maintenance scan?”
 
---
 
# 🧹 4. Scan Engine — What It Checks
 
The Scan Engine runs inside:
 
sandbox/runs/run-[timestamp]/scan.json
 
### It checks:
 
- ❗ Type errors (run_typecheck)
- 🪲 Existing failing tests (run_tests)
- 🧹 Lint errors (run_lint)
- 🔗 Bad imports / missing modules
- ⚠️ Deprecated functions
- ⚙️ Toolbelt script failures
- 💀 Crashes in brewassistChain
- 🎭 Persona errors
- ⚡ Performance warnings
- 🧩 Breaking API route changes
- 🦺 Safety routing inconsistencies
- 🕵️ Obvious code smells
 
The Scan Engine writes:
 
```json
{
  "typeErrors": [ ... ],
  "lintErrors": [ ... ],
  "toolbeltFailures": [ ... ],
  "logicWarnings": [ ... ],
  "deprecatedUsage": [ ... ],
  "personaIssues": [ ... ],
  "safetyIssues": [ ... ],
  "summary": "3 issues detected in lib/, 1 toolbelt warning, 1 persona misrouting."
}
 
 
---
 
🧪 5. Diagnostic Engine — Issue Classification
 
Every issue is classified:
 
ERROR
 
WARNING
 
NOTICE
 
 
And tagged with:
 
component
 
file path
 
severity
 
recommended action
 
 
Example:
 
{
  "component": "brewassistChain",
  "file": "lib/brewassistChain.ts",
  "severity": "ERROR",
  "message": "Missing fallback routing for persona mode.",
  "recommendFix": true
}
 
 
---
 
🧭 6. BrewTruth Analyzer — Risk & Truth Scoring
 
Every proposed fix must be evaluated by BrewTruth:
 
brewtruth(diff)
brewtruth(new code)
brewtruth(reasoning)
 
Results written to:
 
sandbox/runs/run-[timestamp]/truthReview.json
 
Example:
 
{
  "truthScore": 0.88,
  "riskLevel": "LOW",
  "contradictions": [],
  "flags": []
}
 
If riskLevel = HIGH, the fix is blocked unless RB overrides.
 
 
---
 
🛠 7. Fix Generator — How BrewAssist Writes Fixes
 
Using the identified issues, BrewAssist:
 
1. Generates the improved code
 
 
2. Writes into sandbox/mirror
 
 
3. Never touches the real repo
 
 
4. Produces:
 
patch.diff
 
before/after comparison
 
reasoning metadata
 
 
 
5. Saves everything under:
 
 
 
sandbox/runs/run-[timestamp]/
 
 
---
 
🔄 8. Patch Engine Integration (S4.5 Doc 5)
 
The Self-Maintenance Engine automatically triggers:
 
diff comparison
 
patch creation
 
bundle creation
 
metadata creation
 
truth scoring
 
insight generation
 
 
Everything in Doc 5 is reused here.
 
 
---
 
📦 9. Required API Endpoints
 
✔ POST /api/brewassist-sandbox-maintenance?action=run
 
Runs full maintenance loop.
 
✔ GET /api/brewassist-sandbox-maintenance/last
 
Returns:
 
last scan
 
last truthReview
 
last run metadata
 
last patch bundle
 
summary
 
 
 
---
 
🗂 10. Required Directories
 
sandbox/
  runs/
    run-[timestamp]/
      scan.json
      diagnostics.json
      fix.json
      diff.txt
      patch.diff
      bundle.tar.gz
      truthReview.json
      metadata.json
      reasoning.txt
 
 
---
 
🧩 11. Integration with BrewLast
 
Every run logs:
 
runId
 
issuesFound
 
filesChanged
 
riskLevel
 
truthScore
 
patchPath
 
 
Stored under:
 
.brewlast.json
 
 
---
 
🧪 12. Acceptance Tests (PASS criteria)
 
✔ Test 1 — Maintenance trigger works
 
✔ Test 2 — Scan Engine picks up issues
 
✔ Test 3 — Diagnostics created correctly
 
✔ Test 4 — Fix Generator writes code to sandbox/mirror
 
✔ Test 5 — Patch bundle created
 
✔ Test 6 — BrewTruth review generated
 
✔ Test 7 — BrewLast logs run
 
✔ Test 8 — Health endpoint reflects maintenance status
 
 
---
 
🟦 Status
 
S4.5 Document 6 — Self-Maintenance Engine Spec COMPLETE
 
---
 
Reply **“Next”** and I’ll drop:
 
🔥 **S4.5 Document 7 — AI Upgrade Suggestion Engine (Auto-Proposal Engine)**
