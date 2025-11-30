# BrewAssist Sandbox Mode — Full Implementation Spec (S4.5)
**Version:** S4.5  
**Updated:** 2025-11-27  
**Status:** READY FOR IMPLEMENTATION  
**Owners:** BrewAssist (AI), RB (Architect)
 
---
 
# 🎯 1. Purpose of Sandbox Mode
Sandbox Mode allows BrewAssist to:
 
- safely test toolbelt commands  
- run refactors without affecting the real repo  
- generate patches, diffs, and repair proposals  
- simulate risky operations  
- perform self-maintenance (automatic insights + proposals)  
- work on a *mirrored* copy of the repo  
 
This is the **BrewExec DevOps playground** — a fully isolated mirror where BrewAssist performs experiments before anything touches real code.
 
---
 
# 🧱 2. Architecture Overview
 
Real Repo → Sandbox Mirror → BrewAssist Ops → Patch Generator → Human Approval → Apply Patch to Real Repo
 
Sandbox Mode sits **between** BrewAssist and the real filesystem.
 
BrewAssist never touches real code unless:
- RB approves  
- or autopatch Mode is explicitly enabled (future S5+)
 
---
 
# 📁 3. Directory Structure
 
Create under project root:
 
sandbox/ mirror/             # Full repo mirror (auto-regenerated) patches/            # Patch files created from diffs insights/           # Self-maintenance insights + reports runs/               # Per-run execution snapshots tmp/                # Temporary files
 
---
 
# ⚙️ 4. Sandbox Features (Full List)
 
### ✔ Feature A — Repo Mirror Sync
A full clone of current repo at:
 
sandbox/mirror/
 
Triggered by:
 
POST /api/brewassist-sandbox?action=sync
 
Rules:
- Completely replaces previous mirror
- Uses file-by-file copy (no git clone)
- Excludes:
  - node_modules/
  - .next/
  - .git/
  - .venv/
  - brewpulse-insight/  
  - test directories
 
---
 
### ✔ Feature B — Tier 1–3 Toolbelt Routing
Inside Sandbox Mode, **all toolbelt actions run inside mirror**.
 
Example:
 
write_file("components/Foo.tsx") → writes to sandbox/mirror/components/Foo.tsx
 
---
 
### ✔ Feature C — Diff Generation
Automatically produce diffs:
 
- file diff
- directory diff
- repo-wide diff
 
Output stored at:
 
sandbox/patches/patch-[timestamp].diff
 
Also returned in API response.
 
---
 
### ✔ Feature D — Patch Packaging
When BrewAssist makes multiple changes:
 
/sandbox/patches/patch-[timestamp].tar.gz
 
Includes:
- diffs
- changed files
- metadata.json  
  - persona
  - toolbelt calls
  - truthScore
  - risk rating
  - summary
 
---
 
### ✔ Feature E — Self-Maintenance Engine
Sandbox runs `/api/brewtruth` against:
- patched files
- changed files
- diffs
- persona outputs
 
Produces:
 
sandbox/insights/insight-[timestamp].json
 
Fields:
- truthScore
- riskLevel
- flags
- recommended fixes
- “Why this matters”
- brewPulse emotional tier alignment notes
 
---
 
### ✔ Feature F — SBX Mode Input Summary
Each sandbox session stores:
 
sandbox/runs/run-[timestamp]/ input.json output.json toolbelt.json truthReview.json persona.json summary.md
 
---
 
### ✔ Feature G — Apply Patch to Real Repo (gated)
Route:
 
POST /api/brewassist-sandbox?action=applyPatch
 
Rules:
- Only .diff and .tar.gz patches from verified insight runs allowed
- Hard approval required
- Logs to BrewLast
- Writes to real repo root
 
---
 
# 🔒 5. Safety Model
 
### SAFETY TIERS  
Each sandbox action runs through:
 
1. **PathGuard**  
   - All writes must stay inside `sandbox/mirror/`
 
2. **Truth Engine Guard (S4.5)**  
   - Statement must be internally consistent  
   - Score must be > 0.55 (RB override allowed)
 
3. **Persona Guard**  
   - RB Mode has override ability  
   - Safe Mode has strict boundaries  
   - Architect Mode pending S5
 
4. **PatchGuard**  
   - No deletion of project-level directories  
   - No patch larger than 50 files without RB approval  
   - No overwriting environment files
 
---
 
# 🧪 6. API Endpoints
 
---
 
## **POST /api/brewassist-sandbox**
Main routing entry.
 
### Request:
```json
{
  "action": "sync | run | diff | generatePatch | insight | applyPatch",
  "args": { ... },
  "persona": "rb | safe | brewexec-architect"
}
 
Response:
 
{
  "ok": true,
  "action": "sync",
  "mirrorPath": "sandbox/mirror",
  "timestamp": "..."
}
 
 
---
 
POST /api/brewassist-sandbox-run
 
Runs a sandbox operation (Tier 1–3 tool but sandboxed).
 
{
  "command": "write_file",
  "path": "components/Test.tsx",
  "content": "console.log('test')"
}
 
 
---
 
GET /api/brewassist-sandbox-diff
 
Returns live diff between:
 
sandbox/mirror ←→ real repo
 
 
 
---
 
GET /api/brewassist-sandbox-health
 
Returns:
 
last sync
 
last run
 
last patch
 
self-maintenance score
 
last persona used
 
last truthScore
 
 
 
---
 
🧠 7. Internal Engine — brewtruth + brewlast + toolbelt
 
Sandbox Mode uses:
 
BrewTruth (score all changed files)
 
BrewToolbelt (Tier 1–3)
 
BrewLast (log sandbox actions)
 
RB Persona (architect override)
 
Safe Mode Persona (soft-stop)
 
Patch Composer (S4.5 new component)
 
 
 
---
 
🧬 8. Recommended Implementation Order
 
(A) Static backend scaffolding
 
✔ /api/brewassist-sandbox
✔ /api/brewassist-sandbox-run
✔ /api/brewassist-sandbox-diff
✔ directory creation
 
(B) Mirror + safety + routing
 
✔ mirror builder
✔ path guard
✔ sandboxed toolbelt
 
(C) Patch engine
 
✔ diff generation
✔ patch packaging
✔ patchGuard
 
(D) Self-Maintenance Engine
 
✔ truth scoring
✔ insight generator
✔ insight writer
 
(E) Health + logging
 
✔ brewassist-sandbox-health
✔ BrewLast integration
 
 
---
 
⭐ 9. Acceptance Test Suite (Gemini Must Pass)
 
Test 1 — Mirror Sync
 
File structure preserved, excludes forbidden directories.
 
Test 2 — Safe Routing
 
write_file should write to sandbox/mirror/*.
 
Test 3 — Multi-file Patch
 
Multiple writes → creates .diff + .tar.gz.
 
Test 4 — BrewTruth Insight
 
Each patch contains a score & riskLevel.
 
Test 5 — Diff Correctness
 
Sandbox diff matches git diff.
 
Test 6 — Apply Patch (Disabled Until Approved)
 
Patch applied safely to real repo.
 
Test 7 — BrewLast Logging
 
All sandbox actions logged.
 
Test 8 — SBX Health Endpoint
 
Returns valid metadata.
 
 
---
 
🏆 10. Completion Criteria
 
S4.5 is considered DONE when:
 
sandbox directory auto-creates
 
mirror is correct
 
toolbelt writes go only to sandbox
 
diff engine returns correct diffs
 
patch files build
 
insights generate correctly
 
health endpoint is valid
 
BrewLast logs
 
S4.5 tests 1–8 pass
 
 
 
---
 
🟦 Status
 
S4.5 Spec Complete — READY FOR IMPLEMENTATION
 
---
 
Reply **“Next”** and I’ll drop:
 
🔥 **S4.5 Document 5 of 10 — BrewAssist Patch & Diff Engine Spec**