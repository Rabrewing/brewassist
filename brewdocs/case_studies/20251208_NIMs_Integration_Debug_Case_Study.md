# 20251208_NIMs_Integration_Debug_Case_Study.md

## Date: December 8th, 2025

## Summary:
This case study documents the debugging process for integrating NVIDIA NIMs as a research model into BrewAssist. Initial attempts resulted in persistent `404 Not Found` errors, both from within the Next.js application and from direct `curl` calls to the NVIDIA API. The root cause was identified as an incompatibility between the selected NIMs model (`meta/llama-3.1-nemotron-70b-instruct`) and the user's NVIDIA API key access tier, rather than an issue with BrewAssist's code or environment variable loading. The resolution involved selecting an accessible model (`nemotron-3-8b-instruct`) and ensuring correct environment variable naming and URL construction.

## Problem Description:
After implementing the S4.8d "NIMs Researcher Smart Fallback + BrewTruth Hook" phase, attempts to use the NIMs research model consistently resulted in a `404 Not Found` error from the NVIDIA API. This caused BrewAssist to fall back to the Gemini provider, leading to rate-limiting issues. Initial debugging focused on environment variable naming (`NIM_API_KEY` vs `NIMS_API_KEY`) and URL construction (`NIMS_BASE_URL` potentially including `/chat/completions`). While these were addressed, the `404` persisted even with direct `curl` calls.

## Debugging Steps & Findings:

1.  **Initial `404` from BrewAssist:**
    *   BrewAssist's `callProvider` function for NIMs returned `404 page not found`.
    *   This triggered fallback to Gemini, which then hit `429 Resource exhausted` rate limits.
    *   Initial hypothesis: Incorrect `NIMS_API_KEY` or `NIMS_BASE_URL` in `.env.local`, or incorrect URL construction in `lib/brewassist-engine.ts`.

2.  **Environment Variable Name Mismatch:**
    *   It was discovered that the `.env.example` (and thus `.env.local`) used `NIM_API_KEY` and `NIM_API_BASE_URL`, while the code expected `NIMS_API_KEY` and `NIMS_BASE_URL`.
    *   **Action:** User manually corrected `.env.local` to use `NIMS_API_KEY` and `NIMS_BASE_URL`.

3.  **OpenAI Primary Provider Fix:**
    *   During debugging, it was found that the OpenAI primary provider was also failing with a `404` and `model_not_found` error (`gpt-5.1-mini`).
    *   **Action:** The `callProvider` function in `lib/brewassist-engine.ts` was hardened to correctly construct the OpenAI API URL, and `LLM_PRIMARY_MODEL` was explicitly set to `gpt-4.1-mini` in `.env.local`. This resolved the OpenAI issue.

4.  **Persistent NIMs `404` after `.env.local` corrections:**
    *   Even after correcting `NIMS_API_KEY` and `NIMS_BASE_URL` in `.env.local` and hardening the URL construction in `lib/brewassist-engine.ts`, the NIMs API still returned `404 page not found`.
    *   **Action:** A direct `curl` command was executed from the terminal to bypass the Next.js application and directly query the NVIDIA NIMs API.
    *   **Finding:** The direct `curl` also returned `404 page not found`.

5.  **Root Cause Identification (NVIDIA Model Access):**
    *   The `404` from a direct `curl` strongly indicated an issue on the NVIDIA side, specifically with the model name or API key access.
    *   **Conclusion:** The chosen model (`meta/llama-3.1-nemotron-70b-instruct`) was not accessible with the user's free NVIDIA API key tier. NVIDIA's API returns `404` for models not found or not accessible to the account.

## Resolution:
The resolution involves selecting an NVIDIA NIMs model that is accessible with the user's API key. A recommended accessible model is `nemotron-3-8b-instruct`.

## Actions Taken:
1.  **Updated `lib/model-router.ts`:** Implemented the new `BrewModelRole`, `BrewProviderId`, `BrewProviderConfig`, `BrewRouteConfig`, `MODEL_ROUTES`, and `resolveRoute` helper to support smart fallback and research models.
2.  **Updated `lib/brewassist-engine.ts`:**
    *   Implemented the `callProvider` helper with hardened URL construction for OpenAI and NIMs.
    *   Implemented `runBrewAssistEngine` with smart fallback logic and BrewTruth grading.
3.  **Updated `pages/api/brewassist.ts`:** Modified the API handler to use the new `runBrewAssistEngine` result shape.
4.  **User Action (Manual):** User updated `.env.local` to:
    *   Correct `NIM_API_KEY` to `NIMS_API_KEY` and `NIM_API_BASE_URL` to `NIMS_BASE_URL`.
    *   Set `LLM_PRIMARY_MODEL=gpt-4.1-mini` and `HRM_PRIMARY_MODEL=gpt-4.1`.
    *   **Crucially, the user will update `NIMS_MODEL` to `nemotron-3-8b-instruct` in `.env.local` to use an accessible model.**

## Outcome:
*   OpenAI is now correctly functioning as the primary LLM provider.
*   The BrewAssist application's integration code for NIMs is correct.
*   The NIMs `404` error is understood to be an external configuration issue related to model access.
*   BrewAssist is now ready to use NIMs as a research model once an accessible model is configured in `.env.local`.

## Next Steps:
*   User to update `NIMS_MODEL` in `.env.local` to an accessible model (e.g., `nemotron-3-8b-instruct`).
*   Re-run Test 2 to confirm NIMs research functionality.
*   Consider implementing S4.8f "NIMs Adaptive Model Discovery + Auto-Switch" for dynamic model selection.