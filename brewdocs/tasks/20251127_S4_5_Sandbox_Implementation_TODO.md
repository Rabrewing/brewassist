# BrewAssist – S4.5 Sandbox Implementation TODO
**Owner:** RB (Architect)
**Implementer:** Gemini / BrewAssist
**Status:** READY
**Date:** 2025-11-27

---

## PHASE 0 — Safety, Folder Prep, Ignore Rules

### 0.1 Ensure Sandbox Directory Structure Exists
- [ ] `/sandbox`
- [ ] `/sandbox/mirror/`
- [ ] `/sandbox/patches/`
- [ ] `/sandbox/insights/`
- [ ] `/sandbox/suggestions/`
- [ ] `/sandbox/runs/`
- [ ] `/sandbox/debug/`
- [ ] `/sandbox/tmp/`

### 0.2 Update .gitignore
- [ ] Add `sandbox/tmp`
- [ ] Add `sandbox/debug`
- [ ] Add `sandbox/runs`
- [ ] Add `sandbox/**/*.log`
- [ ] Add `sandbox/*_bundle*`
- [ ] Add `sandbox/*_analysis*`

### 0.3 Update Roadmap Docs
- [ ] Append S4.5 clarification to `brewdocs/BrewAssist_Stabilization_Roadmap.md`.
  - Note: Sandbox is the only place BrewAssist writes code in S4.5. No real repo writes allowed.

---

## PHASE 1 — Core Sandbox Utilities

### 1.1 Create: `lib/brewSandbox.ts`
- [ ] `getSandboxRoot()`
- [ ] `ensureSandboxDirs()`
- [ ] `getRunDir(runId)`
- [ ] `getMirrorRoot(runId?)`
- [ ] `resolveSandboxPath(relative)` (with `..` traversal rejection)

### 1.2 Extend BrewLast
- **Files:** `lib/brewLast.ts`, `lib/brewLastServer.ts`
- [ ] Add fields: `isSandbox`, `sandboxRunId`
- [ ] Add `async function logSandboxRun(meta)`

---

## PHASE 2 — Mirror Builder

### 2.1 Create: `lib/brewSandboxMirror.ts`
- [ ] Define allowed mirror roots: `lib`, `pages/api`, `brewassist_core`, `overlays`
- [ ] Implement `buildMirror(runId, mode)`
- [ ] Implement `syncFileToMirror`
- [ ] Implement `getMirrorPath`

### 2.2 Optional Mirror CLI
- [ ] Create `scripts/sandbox_build_mirror.ts` or `.sh`

---

## PHASE 3 — Diff & Patch Engine

### 3.1 Create: `lib/brewDiffEngine.ts`
- [ ] `computeDiff(runId)` using `git diff --no-index`
- [ ] Output to `sandbox/runs/run-[id]/diff.txt`

### 3.2 Create: `lib/brewPatchEngine.ts`
- [ ] `createPatchBundle(runId, input)`
- [ ] Write `patch.diff`
- [ ] Write `metadata.json`

---

## PHASE 4 — Insights & Suggestions

### 4.1 Create: `lib/brewInsightEngine.ts`
- [ ] `buildInsights(runId)`
- [ ] Read from `scan.json`, `diagnostics.json`, `truthReview.json`
- [ ] Write to `sandbox/runs/run-[id]/insights.json` and `sandbox/insights/latest.json`

### 4.2 Create: `lib/brewUpgradeSuggestion.ts`
- [ ] `generateUpgradeSuggestions(runId)`
- [ ] Write to `sandbox/suggestions/run-[id].json` and `sandbox/suggestions/latest.json`

---

## PHASE 5 — Self-Maintenance Engine

### 5.1 Create: `lib/brewSelfMaintenance.ts`
- [ ] Main entry: `runSelfMaintenance({ mode })`
- [ ] **Pipeline:**
    - [ ] `ensureSandboxDirs()`
    - [ ] `buildMirror`
    - [ ] Run `run_tests`, `run_typecheck`, `run_lint`
    - [ ] Write `scan.json`
    - [ ] Create `diagnostics.json`
    - [ ] (Optional) Write fixes into mirror
    - [ ] `computeDiff(runId)`
    - [ ] `createPatchBundle(runId)`
    - [ ] BrewTruth review -> `truthReview.json`
    - [ ] `buildInsights()`
    - [ ] `generateUpgradeSuggestions()`
    - [ ] `logSandboxRun`

### 5.2 Create API: `pages/api/brewassist-sandbox-maintenance.ts`
- [ ] `POST ?action=run`
- [ ] `GET ?action=last`

---

## PHASE 6 — Self-Debug Engine

### 6.1 Create: `lib/brewSelfDebug.ts`
- [ ] `analyzeFailure(input)`
- [ ] Write `analysis.json` and optional `suggestedFix.ts`

### 6.2 API: `pages/api/brewassist-sandbox-debug.ts`
- [ ] `POST` endpoint to accept error data and return analysis.

---

## PHASE 7 — Guardrails

### 7.1 Create: `lib/brewGuardrails.ts`
- [ ] `isPathSandboxed`
- [ ] `assertSandboxWrite`
- [ ] `enforceToolSafety`
- [ ] Integrate into write operations.

---

## PHASE 8 — Health & Observability

### 8.1 Extend `pages/api/brewassist-health.ts`
- [ ] Add `sandbox` section with `enabled`, `lastRunId`, `lastRunAt`, `lastRiskLevel`, `lastTruthScore`.

---

## PHASE 9 — Minimal Tests

- [ ] **Manual Checks:**
    - [ ] Mirror builds
    - [ ] Maintenance API returns `runId`
    - [ ] `scan.json` & `diagnostics.json` created
    - [ ] `diff` created
    - [ ] `patch` created
    - [ ] `truth review` created
    - [ ] `insights` created
    - [ ] `suggestions` created
    - [ ] Guardrails block unsafe writes
    - [ ] Health endpoint updated

---

## DONE WHEN

- ✔ All files created
- ✔ All directories working
- ✔ Maintenance run produces a full run folder
- ✔ Diff, patch, insights, and suggestions all generate
- ✔ BrewTruth review integrated
- ✔ BrewLast logs run
- ✔ Health endpoint reports sandbox status