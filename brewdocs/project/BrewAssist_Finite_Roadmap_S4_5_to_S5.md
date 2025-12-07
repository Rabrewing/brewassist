# BrewAssist Finite Roadmap — S4.5 to S5 Go-Live

This document captures the **single, finite execution path** from the current state to BrewAssist being a real, production-quality DevOps cockpit.

---

## Phase 1 — UI Repair & Lock-In (S4.5)

Goal: Fix everything visual/interactive that is currently broken or unstable.

- Remove experimental logos & half-finished CSS.
- Restore:
  - Left: project tree
  - Center: BrewAssist cockpit & chat
  - Right: sandbox/status
- Ensure:
  - No hydration errors.
  - `/api/fs-tree` and `/api/fs-read` work end-to-end.
  - BrewAssist chat bar works.

**Doc:** `brewdocs/tasks/2025xxxx_S4_5_UI_Repair_and_Lock_In.md`

---

## Phase 2 — Sandbox Engine & BrewLast Repair (S4.6)

Goal: Get sandbox + BrewLast fully functional again in the new repo.

- Cleanly define sandbox root (local dev).
- Fix sandbox API routes.
- Make sure BrewLast:
  - Restores last state.
  - Updates state on successful patch.
- Confirm patch lifecycle is safe and reversible.

---

## Phase 3 — New UI Upgrade (S4.NEW_UI)

Goal: Apply the new Gemini-inspired minimalist UI after stability is reached.

- Remove always-visible preview pane.
- Add:
  - Code modal with download options & file-scoped chat.
  - Better sandbox panel on right.
  - Footer with version & links.
- Keep behavior consistent with Phase 1.

**Doc:** `brewdocs/reference/specifications/S4_xx_New_UI_Spec.md`

---

## Phase 4 — Multi-Model Chain Restoration (S5 Preflight)

Goal: Bring back real “brainpower”.

- Rewire LLM chain:
  - Primary: OpenAI GPT-4.1.
  - Secondary: Gemini Flash.
  - Local: Mistral.
  - Research: NIM inside chain.
- Add:
  - HRM Identity gating
  - BrewTruth checks
  - BrewLast context loading before tools

---

## Phase 5 — Go-Live Architecture (brewassist.app)

Goal: Turn BrewAssist into a SaaS product.

- Domain: `brewassist.app`.
- Hosted UI + API.
- Per-tenant sandbox infrastructure.
- Auth + billing + plans.
- Internal dogfooding → beta → public.

**Doc:** `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`

---

## Phase 6 — Integration with BrewExec & the BrewVerse

Goal: Make BrewAssist the “DevOps brain” of the BrewVerse.

- Use BrewExec as RB’s personal “home base”.
- BrewAssist interacts with:
  - BrewExec projects
  - BrewSearch
  - BrewPulse
- RB becomes “User Zero” of the BrewAssist SaaS.

---

## One-Sentence Summary

> Fix the UI → Fix the sandbox → Apply the new UI → Restore the chain → Deploy the SaaS → Integrate the BrewVerse.
