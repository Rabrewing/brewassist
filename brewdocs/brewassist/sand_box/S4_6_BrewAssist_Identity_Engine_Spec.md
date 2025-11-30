# S4.6 — BrewAssist Identity Engine (RB Mode + HRM v3)

**Status:** READY FOR IMPLEMENTATION  
**Scope:** Persona Brain, Emotional State Machine, Context Memory Bus, HRM v3 Bridge  
**Owners:** RB (Architect), BrewAssist, Gemini

---

## 1. Purpose

S4.6 turns BrewAssist from “tool runner” into a **persistent identity:**

- Talks like RB, thinks like an architect.
- Remembers short-term context (per session) and selected long-term facts.
- Adjusts tone + emotional tier based on user vibe and risk.
- Routes hard problems through the **Hierarchical Reasoning Model (HRM) v3**.
- Logs everything into BrewLast + Sandbox for explainability and self-repair.

This is the **final S4.x phase** before the **Production Alpha commit.**

---

## 2. High-Level Architecture

Logical stack **after S4.6**:

1. **Persona / Identity Layer (Next.js)**
   - `/api/brewassist-persona`
   - Persona registry (rb, calm, strict, future personas)
   - Emotion state machine (tiers 1–5)
   - Context Memory Bus (file-based + BrewLast)

2. **Safety & Risk Layer**
   - Soft / Hard / RB Mode from S4.3
   - Safety gating for dangerous actions
   - BrewTruth integration for high-risk content

3. **HRM v3 Layer (Python core)**
   - `brewassist_core/chains/hrm_chain.py`
   - `brewassist_core/agents/planner.py`
   - New: HRM task packets from the Next.js persona engine
   - New: HRM reasoning traces back to BrewLast + Sandbox

4. **Execution Layer**
   - BrewAssist chain (OpenAI → Gemini → Mistral fallback)
   - Toolbelt tiers 1–3
   - Sandbox self-repair + diff/patch (S4.5)

5. **Observability Layer**
   - `/api/brewassist-health` → identity + HRM status
   - BrewLast entries for persona + HRM decisions
   - Sandbox runs with truth + risk scoring

---

## 3. Concrete Goals for S4.6

1. **RB Identity Engine**
   - Stable `rb` persona as default.
   - Clean persona registry with future extensibility.
   - Single source of truth for tone, tier, safety mode, memory window.

2. **Dynamic Emotional State Machine**
   - Tiers 1–5 (Calm → Focused → Energized → Fired Up → 🔥 Emergency).
   - Automatic tier adjustments based on:
     - User sentiment (happy / frustrated / anxious).
     - Task difficulty (simple vs deep reasoning).
     - Risk level (HIGH → clamp tone, increase caution).

3. **Context Memory Bus**
   - Short-term context:
     - 12–20 turn sliding window per session.
   - Long-term context:
     - Persisted to `.brewlast.json` under `identity.memory`.
     - Manual “pin this” hooks via future UI.

4. **HRM v3 Integration**
   - Next.js persona route can **request HRM reasoning** for:
     - Complex coding tasks.
     - Multi-step refactors.
     - Architecture planning.
   - HRM produces:
     - Step-by-step plan (JSON).
     - Reasoning trace.
     - Risk estimate.
   - These are surfaced to:
     - BrewAssist UI (later).
     - Sandbox for safe execution.
     - BrewLast for audit.

5. **Health + Telemetry**
   - `/api/brewassist-health` extended with:
     - `identityStatus` (active persona, tier, memory backend).
     - `hrmStatus` (enabled, last run, last error).
   - New BrewLast log types:
     - `identity_event`
     - `hrm_run`

---

## 4. Files (New + Updated)

### 4.1 New Files

- `lib/brewIdentityEngine.ts`
  - Central identity brain.
  - Exports:
    - `getActivePersona()`
    - `updateEmotionTier()`
    - `recordIdentityEvent()`
    - `getContextWindow()`
    - `pushToContextWindow()`  

- `lib/hrmBridge.ts`
  - JS ↔ Python bridge for HRM v3.
  - Responsibilities:
    - Build HRM task packets.
    - Call HRM API/CLI (`brewassist_core`).
    - Normalize HRM responses.
    - Log run to BrewLast (`tool: "hrm_run"`).

- `brewdocs/reference/HRM_v3_Integration_Spec.md`
  - (Separate document, see below.)

### 4.2 Updated Files

- `pages/api/brewassist-persona.ts`
  - Use `brewIdentityEngine` for:
    - Persona lookup.
    - Emotion tier adjustments.
    - Context window reads/writes.
  - Optionally route complex prompts via HRM.

- `pages/api/brewassist-health.ts`
  - Add:
    - `identityStatus`
    - `hrmStatus`

- `lib/brewLast.ts` / `lib/brewLastServer.ts`
  - Add logging helpers:
    - `logIdentityEvent(...)`
    - `logHRMRun(...)`

- `brewdocs/BrewUpdates.md`
- `brewdocs/PROGRESS_SUMMARY.md`

---

## 5. Emotion Tiers (Draft)

- **Tier 1 – Calm / Reassuring**
- **Tier 2 – Neutral / Professional**
- **Tier 3 – Focused / Tactical**
- **Tier 4 – Energized / Hyped (RB Build Mode)**  
- **Tier 5 – Emergency / Safety Critical (Clamp Tone + Hard Warnings)**

Rules:

- Default: Tier 3 in RB mode.
- Drop to Tier 1 if user stressed / overwhelmed.
- Climb to Tier 4 when user excited + green build zone.
- Clamp to Tier 5 when BrewTruth riskLevel = `HIGH`.

---

## 6. HRM Task Flow

1. User sends a complex request via BrewAssist UI.  
2. `/api/brewassist-persona`:
   - Reads persona + context.
   - Decides: `needsHRM = true`.
3. `hrmBridge` packages task:

```json
{
  "persona": "rb",
  "goal": "Refactor BrewAssist Chain to add new model.",
  "context": [ ... recent messages ... ],
  "riskLevel": "MEDIUM",
  "requestedBy": "RB"
}
```

4. HRM core (hrm_chain.py) runs reasoning.


5. Response mapped back:



```json
{
  "plan": [ "Step 1 ...", "Step 2 ..." ],
  "explanations": [ ... ],
  "riskLevel": "LOW",
  "truthScore": 0.9
}
```

6. Log to BrewLast as hrm_run.


7. Optionally pass plan to Sandbox for safe execution.




---

## 7. S4.6 Completion Criteria

S4.6 is DONE when:

- All S4.6 tests (see Test Suite doc) are green.
- Health endpoint exposes identity + HRM status.
- Persona route uses identity + context bus.
- HRM v3 bridge runs at least one real reasoning flow.
- BrewLast shows `identity_event` and `hrm_run` entries.
- No production code is modified directly by HRM; all changes go through Sandbox (S4.5).


Once this is true, we are clear for:

> **Production Alpha Commit — BrewAssist Engine v2.0**