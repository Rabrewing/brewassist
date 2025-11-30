# BrewAssist Patch & Diff Engine Specification  
**Subsystem:** S4.5 — Sandbox Mode  
**File:** BrewAssist Patch & Diff Engine  
**Status:** READY FOR IMPLEMENTATION  
**Owners:** RB (Architect), BrewAssist (AI)
 
---
 
# 🧠 1. Purpose of the Patch & Diff Engine
 
The Patch & Diff Engine is the system that lets BrewAssist:
 
- Compare the sandbox mirror to the real repo  
- Generate diffs (single file, directory, or full repo)  
- Package changes into reusable patch files  
- Export a complete change bundle (diff + files + metadata)  
- Produce “insight-ready” patch bundles for self-maintenance  
- Prepare patches for RB approval before ever touching the real repo  
- Integrate with BrewTruth for risk scoring  
- Integrate with BrewLast for full logging  
 
This subsystem becomes the backbone for:
 
- AI refactoring  
- AI debugging  
- AI feature creation  
- Safe SaaS update workflows  
- Future Autopatch / Autodeploy (S5–S6)
 
---
 
# 🧱 2. Patch Engine Directory Structure
 
Under project root:
 
sandbox/ mirror/                   # Repo mirror patches/ patch-[timestamp].diff  # Unified diff bundle-[timestamp].tar.gz insights/ insight-[timestamp].json runs/ run-[timestamp]/ input.json output.json diff.txt patch.diff metadata.json tmp/
 
Everything the Patch Engine writes lives in here.
 
---
 
# 🔄 3. Patch Engine Workflow Overview
 
SANDBOX WRITE (toolbelt) ↓ DIFF ENGINE ↓ PATCH ENGINE ↓ INSIGHT ENGINE (truth scoring) ↓ RB Approval ↓ applyPatch()
 
**Nothing touches the real repo until RB approves.**  
This is the golden rule.
 
---
 
# 🧩 4. Diff Engine — Implementation Rules
 
The Diff Engine uses **file-by-file comparison** between:
 
- sandbox/mirror
- real repo (PWD)
 
### Required diff modes:
 
### ✔ Mode A — Single File Diff
 
GET /api/brewassist-sandbox-diff?path=lib/foo.ts
 
Output:
- raw unified diff
- JSON structured diff
- path metadata
 
### ✔ Mode B — Directory Diff
 
GET /api/brewassist-sandbox-diff?path=components/
 
Collects all file-level diffs under that folder.
 
### ✔ Mode C — Full Repo Diff
 
GET /api/brewassist-sandbox-diff?full=true
 
Equivalent to:
 
diff -ruN real/ sandbox/mirror/
 
But implemented in Node, not shell.
 
---
 
# 🛠 5. Patch Engine — Construction Rules
 
When BrewAssist completes a batch of edits, the Patch Engine creates:
 
### ✔ File A — Unified Diff
 
sandbox/patches/patch-[timestamp].diff
 
### ✔ File B — Patch Bundle
 
sandbox/patches/bundle-[timestamp].tar.gz
 
Containing:
 
patch.diff changed-files/* metadata.json truthReview.json persona.json run.json
 
### Metadata must include:
 
```json
{
  "id": "patch-17640882233",
  "created": "timestamp",
  "persona": "rb",
  "toolsUsed": ["write_file", "list_dir", "run_shell"],
  "truthScore": 0.94,
  "riskLevel": "LOW",
  "changedFiles": [
    "components/NavBar.tsx",
    "lib/openaiToolbelt.ts"
  ]
}
 
 
---
 
🧪 6. Patch Engine — Required API Endpoints
 
 
---
 
POST /api/brewassist-sandbox?action=generatePatch
 
Request:
 
{
  "includeFiles": true,
  "includeInsights": true
}
 
Response:
 
{
  "ok": true,
  "patchPath": "sandbox/patches/patch-123.diff",
  "bundlePath": "sandbox/patches/bundle-123.tar.gz",
  "insightPath": "sandbox/insights/insight-123.json"
}
 
 
---
 
GET /api/brewassist-sandbox-diff
 
Supports:
 
path
 
full=true
 
 
Returns both human readable and machine readable output.
 
 
---
 
POST /api/brewassist-sandbox?action=applyPatch
 
This is gated behind RB approval and CANNOT run without explicit manual override.
 
 
---
 
🛡 7. PatchGuard — Safety Rules
 
A patch cannot:
 
delete root project folders
 
modify .env.* files
 
modify .git/
 
mod node_modules/
 
modify brewdocs/ (docs edited manually)
 
include more than 50 file changes without RB override
 
include file deletions without confirmation
 
 
Every patch is validated with BrewTruth:
 
truthScore must be > 0.55
 
riskLevel must NOT be HIGH
 
RB override bypasses all thresholds (Architect mode only)
 
 
 
---
 
🧠 8. Self-Maintenance Integration
 
Every patch forces BrewAssist to run:
 
brewtruth(diff)
brewtruth(changed files)
 
The generated insight file is saved:
 
sandbox/insights/insight-[timestamp].json
 
Fields required:
 
{
  "truthScore": 0.92,
  "riskLevel": "LOW",
  "flags": [],
  "recommendedFixes": [],
  "reviewSummary": "Patch is internally consistent and low risk."
}
 
 
---
 
📈 9. Patch Review Panel (Future UI)
 
S5 will include:
 
diff viewer
 
patch preview
 
risk meter
 
truth engine score
 
persona reasoning
 
“Explain this diff” mode
 
 
JavaScript-ready API for React UI.
 
 
---
 
✔ 10. Acceptance Test Suite (8 Required Tests)
 
Test 1 — Mirror Sync
 
✓ Mirror created, correct excludes
 
Test 2 — Sandboxed Writes
 
✓ All writes go to sandbox/mirror
 
Test 3 — Patch Generation
 
✓ Creates .diff + .tar.gz
 
Test 4 — Patch Metadata
 
✓ metadata.json contains all required fields
 
Test 5 — Truth Scoring
 
✓ Generates insight JSON
 
Test 6 — Apply Patch
 
✓ Disabled unless RB approves
✓ Works when enabled
 
Test 7 — BrewLast Logging
 
✓ Every patch action logged
 
Test 8 — Health Endpoint
 
✓ Shows last patch, last insight, last run
 
 
---
 
🟦 Status
 
S4.5 Patch & Diff Engine Spec — COMPLETE
 
---
 
Reply **“Next”** whenever you're ready for:
 
🔥 **S4.5 Document 6 of 10 — Self-Maintenance Engine Spec (Truth-Aware AI Repair Engine)**