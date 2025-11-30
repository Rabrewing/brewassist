# BrewAssist Full Chain Upgrade — v1

**Date:** 2025-11-18

## Objective

Implement a production-grade, multi-model AI chain behind `/api/brewassist`, incorporating Gemini, HRM, Grok, TinyLLaMA, and Mistral. This includes creating a shared chain helper, updating the main orchestrator, adding dedicated endpoints for HRM, LLM, and Agent, and revamping the auto command selection router.

## Task Breakdown

- [x] **0. Assumptions:** Review and confirm assumptions.
- [x] **1. Environment Variables:** Confirm environment variables are set as specified.
- [x] **2. Shared Engine + Chain Helper:** Create `lib/brewassistChain.ts`.
- [x] **3. `/api/brewassist.ts`:** Create or replace the main orchestrator.
- [x] **4. Dedicated HRM / LLM / Agent Endpoints:**
    - [x] Create `pages/api/hrm.ts`.
    - [x] Create `pages/api/llm.ts`.
    - [x] Create `pages/api/agent.ts`.
- [x] **5. `/api/router.ts`:** Create or replace the auto command selection router.
- [x] **6. Small Client-Side Tweaks:** Update `components/ChatCommandRouter.tsx` (specifically the default case body).
- [ ] **7. Sanity Checklist:** Perform the provided sanity checklist after implementation.
- [ ] **Progress Summary:** Update `PROGRESS_SUMMARY.md` upon completion.
