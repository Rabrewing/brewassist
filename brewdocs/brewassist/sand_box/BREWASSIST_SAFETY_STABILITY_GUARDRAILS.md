🛡️ BrewAssist Safety & Stability Guardrails Engine
 
Subsystem: S4.5 — Sandbox Mode
Status: IMPLEMENTATION READY
Owners: RB (Architect), BrewAssist (AI)
 
 
---
 
🔥 1. Purpose of the Guardrails Engine
 
BrewAssist now has:
 
Sandbox Mode
 
Self-Maintenance
 
Self-Debugging
 
Patch Generator
 
Truth Engine
 
Persona Memory
 
 
That is power — but power needs guardrails.
 
This subsystem ensures:
 
✔ The AI cannot break the repo
✔ Risky code is blocked
✔ Unsafe patterns are rejected
✔ Persona memory stays stable
✔ No infinite tool chains
✔ No accidental writes to prod
✔ No corrupt patches slip through
✔ AI suggestions stay responsible
✔ Internal safety layer remains intact
 
This is the Governance Layer for BrewAssist V2.
 
 
---
 
🧠 2. Guardrails Categories
 
Category A — Sandbox Safety
 
Controls where BrewAssist can write.
 
Category B — Patch Safety
 
Controls which patches are allowed.
 
Category C — Engine Safety
 
Prevents runaway loops & reasoning errors.
 
Category D — Persona Safety
 
Ensures tone, boundaries, and memory integrity.
 
Category E — Performance Safety
 
Stops slowdowns and excessive compute usage.
 
Category F — BrewTruth Safety
 
Stops high-risk changes from being applied.
 
 
---
 
🧩 3. Category A — Sandbox Safety Rules
 
Sandbox Safety ensures BrewAssist never touches production.
 
Rules:
 
✔ A1. All file writes routed ONLY to:
 
sandbox/mirror/**
sandbox/debug/**
sandbox/runs/**
 
✔ A2. Prevent ANY write to:
 
lib/**
pages/**
components/**
brewassist_core/**
next.config.js
package.json
 
Attempts produce:
 
403 — Sandbox Write Violation
 
✔ A3. All repairs must be diff-based
 
No full file rewrites without RB approval.
 
 
---
 
🧩 4. Category B — Patch Safety Rules
 
Rules for patches that BrewAssist generates:
 
✔ B1. Patch must pass BrewTruth
 
truthScore ≥ 0.75
riskLevel ≠ HIGH
 
✔ B2. Patch must contain minimal diff
 
No 200-line replacements for 6-line bugs.
 
✔ B3. Patch must not include:
 
logic change without explanation
 
imported dependency removal
 
new dependencies
 
deletion of safety rules
 
persona system modifications
 
 
✔ B4. Patch must be reversible
 
Patch engine always produces reverse.diff.
 
 
---
 
🧩 5. Category C — Engine Safety (Loop Prevention)
 
These rules stop runaway AI logic:
 
✔ C1. Max 10 tool calls per chain
 
Hard-stop override available for RB only.
 
✔ C2. Tool recursion detection
 
If tool references itself more than 2 layers deep → abort.
 
✔ C3. Infinite loop detection
 
If request repeats > 3 identical calls → abort.
 
✔ C4. Time safety
 
No request allowed to run > 12 seconds.
 
✔ C5. Memory safety
 
Sandbox temp directory auto-purged if > 200MB.
 
 
---
 
🧩 6. Category D — Persona Safety
 
Protects:
 
Tone
 
Memory
 
Behavior
 
Ethics
 
Relationship with RB
 
 
✔ D1. Memory Window Guard
 
Never stores sensitive personal data.
Never stores session 2–3 explained cues unless marked.
 
✔ D2. Tone Guard
 
RB mode → friendly + technical
ChatG mode → balanced
Architect mode → serious + precise
 
✔ D3. Persona Drift Block
 
If BrewAssist drifts from expected tone → auto-correct.
 
✔ D4. Emotional Tier Safety
 
Tier > 4 must be RB-authorized.
 
 
---
 
🧩 7. Category E — Performance Guardrails
 
Ensures stability under load.
 
✔ E1. Lint/Test/Typecheck throttling
 
Only one maintenance process at a time.
 
✔ E2. Cache control
 
Sandbox diagnostics cached for 4 hours.
 
✔ E3. Large diff detection
 
If patch > 150 lines → require RB override.
 
✔ E4. Rebuild prevention
 
Sandbox never triggers Next.js production builds.
 
 
---
 
🧩 8. Category F — BrewTruth Safety Layer
 
BrewTruth becomes the final gatekeeper.
 
✔ F1. All patches undergo BrewTruth review
 
truthScore < 0.75 → BLOCK
riskLevel HIGH → BLOCK
 
✔ F2. High-risk modifications limited to:
 
comments
 
metadata
 
docs
 
tests
But disallowed on:
 
chains
 
llm-tool-call
 
safety modules
 
 
✔ F3. Contradictions auto-block
 
If BrewTruth flags contradictions → BLOCK
 
 
---
 
🔐 9. Required Files
 
✔ pages/api/brewassist-guardrails.ts
 
Central enforcement endpoint.
 
✔ lib/brewGuardrails.ts
 
Reusable safety module.
 
✔ brewdocs/BrewAssist_SafetyRules.md
 
Developer-facing version of these guardrails.
 
 
---
 
🧪 10. Acceptance Tests
 
 
---
 
✔ Test 1 — Sandbox Write Violation
 
Attempt writing to lib/. Must fail.
 
✔ Test 2 — Patch with HIGH risk
 
Must be blocked.
 
✔ Test 3 — Large diff (>150 lines)
 
Must require override.
 
✔ Test 4 — Infinite loop attempt
 
Engine must abort safely.
 
✔ Test 5 — Persona Drift
 
Incorrect tones corrected.
 
✔ Test 6 — BrewTruth contradiction
 
Must block patch.
 
✔ Test 7 — Repo safety
 
Real repo files never change during maintenance.
 
✔ Test 8 — Guardrails logged in BrewLast
 
Every rule enforcement must appear in .brewlast.json.
 
 
---
 
🟦 Status
 
S4.5 Document 9 — COMPLETE
Gemini-ready.
Architect-level.
Safety-critical.
NON-NEGOTIABLE for any sandbox write logic.
 
 
---
 
Reply “Next” and I’ll drop:
 
🔥 S4.5 Document 10 — Full API Surface & Route Definitions
(Every endpoint for Sandbox, Maintenance, Debugging, Patch Engine, Guardrails, Truth Engine.)