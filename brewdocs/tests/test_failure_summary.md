# BrewAssist Test Failure Summary

**Goal:** Fix the failing tests in the `brewassist` project.

**Problem:** The test suite has multiple failures, primarily in `__tests__/brewassist.chain.smoke.test.ts`, `__tests__/s4.cost.scope.router.lock.test.ts`, `__tests__/api/brewassist.toolbelt.test.ts`, and `__tests__/api/brewassist.test.ts`. The core issue seems to be related to the recent implementation of the S4.10 spec, which introduced "Admin" and "Customer" modes and new toolbelt policies.

**Initial Failures:**
*   `__tests__/brewassist.chain.gates.test.ts`: `Error parsing JSON from raw response: SyntaxError: Unexpected token 'd', "data: {"ty"... is not valid JSON`.
*   `__tests__/s4.cost.scope.router.lock.test.ts`: `TypeError: res.flushHeaders is not a function` and `expect(json.ok).toBe(true);` received `undefined`.
*   `__tests__/brewassist.chain.smoke.test.ts`: `TypeError: (0 , sseTestUtils_1.buildSseStream) is not a function` and `expect(finalJson.type).toBe("end");` received `"error"`.
*   `__tests__/api/brewassist.toolbelt.test.ts`: Multiple assertion errors.
*   `__tests__/api/brewassist.test.ts`: Multiple assertion errors, with `reconstructContentFromEvents` returning an empty string.

**Steps Taken:**

1.  **Fixed JSON parsing in `__tests__/helpers/brewassistTestClient.ts`**: Modified the `callBrewassist` function to correctly parse SSE responses by stripping the "data: " prefix before parsing the JSON payload. This fixed the `__tests__/brewassist.chain.gates.test.ts` failures.

2.  **Addressed `TypeError: res.flushHeaders is not a function`**: Added a check `if (typeof res.flushHeaders === "function")` in `pages/api/brewassist.ts` to prevent the `TypeError` in the test environment.

3.  **Addressed `TypeError: (0 , sseTestUtils_1.buildSseStream) is not a function`**: Re-added the `buildSseStream` function to `__tests__/helpers/sseTestUtils.ts`.

4.  **Attempted to fix `TypeError: web_1.TextEncoder is not a constructor`**:
    *   Added a global mock for `TextEncoder` in `__tests__/brewassist.chain.smoke.test.ts`. This did not work.
    *   Modified the mock to target `node:stream/web` for `TextEncoder` and `ReadableStream`. This fixed the `TypeError`, but a new `SyntaxError: "[object Object]" is not valid JSON` appeared.

5.  **Attempted to fix `SyntaxError: "[object Object]" is not valid JSON`**:
    *   Modified `lib/brewassist-engine.ts` to handle `gemini` as a streaming provider within `callProviderStream`.
    *   Updated the `gemini` mock in `__tests__/brewassist.chain.smoke.test.ts` to send a response that matches the expected Gemini streaming format. This fixed the `SyntaxError`, but the test still fails with `Expected substring: "OK_FROM_GEMINI" Received string: ""`.

6.  **Attempted to fix `Expected substring: "OK_FROM_GEMINI" Received string: ""`**:
    *   Simplified the `gemini` mock in `__tests__/brewassist.chain.smoke.test.ts` by removing the explicit `data: [DONE]\n\n` event. This did not work.
    *   Added debug `console.log` statements to `lib/brewassist-engine.ts` to trace the values of `chunk`, `lines`, `line`, `data`, `json`, `content`, and `chunkText`. The logs revealed that `decoder.decode(value)` is returning `"[object Object]"`.
    *   Updated the `ReadableStream` and `TextEncoder` mocks to use `Buffer` objects. This did not work.

**Current Status:**

The test `BrewAssist chain smoke › falls back from OpenAI -> Gemini and returns 200` in `__tests__/brewassist.chain.smoke.test.ts` is still failing. The `accumulatedText` is empty because `decoder.decode(value)` in `lib/brewassist-engine.ts` is returning `"[object Object]"` instead of the actual SSE string. This indicates a deep issue with how the `ReadableStream` and `TextDecoder` mocks are interacting in the Jest environment.
