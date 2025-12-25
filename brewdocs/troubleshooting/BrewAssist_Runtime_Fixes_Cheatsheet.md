# BrewAssist Runtime Stability & Troubleshooting Cheat Sheet

This document outlines common issues encountered during BrewAssist runtime, their root causes, and how to quickly diagnose and fix them.

---

## 1. UI Displaying "undefinedundefined..." or other UI Glitches

**Problem:** Chat bubbles show literal "undefined" strings or malformed output.
**Symptoms:** Streamed content appears corrupted.

**Root Causes:**
*   Incorrect parsing or concatenation of SSE `chunk` events on the frontend.
*   Assumption of `json.payload` instead of `json.text` for streamed content.
*   Failure to handle `null` or `undefined` content gracefully.

**Quick Checks & Fixes:**
*   **Verify `components/BrewCockpitCenter.tsx`:**
    *   Ensure `json.text` is used for streamed content.
    *   Confirm safe concatenation with `(msg.content ?? "") + t`.
    *   Ensure `getMessageText` from `lib/ui/messageText.ts` is used for rendering displayable text.
*   **Relevant Tests:**
    *   `__tests__/ui/messageText.normalize.test.ts` (ensures `getMessageText` produces safe strings).
    *   `__tests__/ui/noUndefined.render.test.ts` (regression test for UI `undefined` safety).
    *   `__tests__/ui/messageStream.guard.test.ts` (checks handling of malformed chunks).

---

## 2. "Evaluating Request..." UI Hangs

**Problem:** The UI gets stuck on "Evaluating Request..." and never receives a final response.
**Symptoms:** No `end` event is received, or the stream terminates unexpectedly.

**Root Causes:**
*   API (`pages/api/brewassist.ts`) failing to send a terminal `end` event.
*   Asynchronous operations (e.g., LLM calls) hanging indefinitely without being managed by a timeout.
*   `res.end()` not being called reliably to close the HTTP connection.

**Quick Checks & Fixes:**
*   **Verify `pages/api/brewassist.ts`:**
    *   Ensure `res.end()` is within a `finally` block to guarantee execution.
    *   Confirm the `Promise.race` with a 10-second `timeoutPromise` is correctly implemented for `AGENT` and `LOOP` modes.
    *   Ensure the logic for dispatching the final `end` event (either successful or fallback) always runs after `Promise.race`.
*   **Relevant Test:**
    *   `__tests__/api/brewassist.agent.loop.liveness.test.ts` (verifies all modes terminate with an `end` event, even on hang).

---

## 3. Agent/Loop Modes Fail with "No active LLM providers found..." or "Unsupported provider: system"

**Problem:** When selecting `AGENT` or `LOOP` modes, an error indicates no providers could be found or the `system` provider is unsupported.
**Symptoms:** Agent/Loop modes do not produce meaningful responses, or show the fallback message "Agent/Loop mode is not fully wired yet."

**Root Causes:**
*   `lib/model-router.ts` (`getModelRoutes`, `resolveRoute`) failing to find suitable LLM providers for `AGENT` or `LOOP` modes, leading to the `system` provider being selected.
*   `lib/brewassist-engine.ts` then attempting to call `callProviderStream` with the `system` provider, which is not an actual external LLM.

**Quick Checks & Fixes:**
*   **Verify `lib/model-router.ts`:**
    *   In `getModelRoutes`, ensure that `AGENT` and `LOOP` modes explicitly include fallback to primary LLM providers (OpenAI, Gemini, Mistral, TinyLLM).
*   **Verify `lib/brewassist-engine.ts`:**
    *   Confirm that `runBrewAssistEngineStream` explicitly handles `route.provider === "system"` by emitting a message and `onEnd` event, without calling `callProviderStream`.
*   **Examine `debugInfo` in `end` event:** In the network console, inspect the `debugInfo` payload of the `end` event for `mode`, `tier`, `intent`, `enabledFlags`, and `candidateProviders` to understand why providers were not selected.
*   **Relevant Test:**
    *   `__tests__/api/brewassist.agent.loop.liveness.test.ts` (tests that Agent/Loop modes terminate gracefully even when hanging or falling back).

---

## 4. Greeting Prompts Blocked or Misclassified

**Problem:** Simple greetings (e.g., "hello") are blocked by the intent gate or incorrectly classified.
**Symptoms:** BrewAssist fails to respond to basic salutations, or misinterprets them.

**Root Causes:**
*   `lib/intent-gatekeeper.ts`'s `classifyIntent` function not correctly allowing or prioritizing greetings.
*   Overly strict gating logic.

**Quick Checks & Fixes:**
*   **Verify `lib/intent-gatekeeper.ts`:**
    *   Ensure short greetings are classified as `PLATFORM_DEVOPS` or an equivalent "allow" category.
    *   Confirm that `DOCS_KB` keywords take precedence over general `PLATFORM_DEVOPS` keywords when present in the same prompt.
*   **Relevant Tests:**
    *   `__tests__/api/intent.greeting.allow.test.ts` (specifically checks greeting classification).
    *   `__tests__/lib/intent-gatekeeper.test.ts` (validates overall `classifyIntent` logic).

---

**General Troubleshooting Workflow:**

1.  **Run `pnpm test`:** Always the first step. If tests fail, diagnose using test output.
2.  **Check UI Behavior:** If tests pass but UI has issues, manually test across different modes.
3.  **Inspect Browser DevTools (Network & Console):**
    *   Look at `/api/brewassist` requests (fetch/XHR).
    *   Check `Content-Type` headers.
    *   Examine raw SSE response for `type: "error"` events or unexpected structures.
    *   Look for `debugInfo` in the final `end` event payload for detailed context.
4.  **Review Server Logs:** For backend errors or `console.error` messages.
5.  **Re-verify Environment Variables:** Confirm `process.env.*` values are correctly set for all providers.

This cheat sheet provides a quick reference for common runtime stability issues and their resolutions. Always ensure the full test suite passes after any changes.
