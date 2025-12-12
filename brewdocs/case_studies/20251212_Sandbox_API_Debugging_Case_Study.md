# Case Study: Resolving Sandbox API Build and Test Failures (2025-12-12)

## Overview

This case study documents the debugging and resolution process for persistent build and test failures related to the BrewAssist Sandbox API. The primary challenges involved resolving TypeScript errors, addressing Next.js configuration warnings, and stabilizing asynchronous test interactions with `node-mocks-http` and `node:child_process.spawn`.

## Summary of Changes Made:

1.  **`pages/api/sandbox.ts`**:
    *   The `handler` function was modified to wrap the `runOverlay` call within a `new Promise<void>((resolve) => { ... resolve(); })` block. This ensures that the `handler` explicitly returns a `Promise` that resolves only after `res.json()` has been called, aligning with Next.js's expected async API handler behavior and allowing tests to correctly capture the response.
    *   Early exit conditions (`return res.status(...).json(...)`) were changed to `res.status(...).json(...); return;` for consistency with the new Promise-wrapped structure.
    *   **Implemented Sandbox Protection Logic**: Added a check for the `x-brewassist-mode` header. If the mode is not 'admin', the API now logs the attempt using `brewLast.logSandboxBlocked` and returns a `403` status with a specific error message and `ok: false`.

2.  **`__tests__/api/sandbox.test.ts`**:
    *   The `jest.mock("node:child_process", ...)` block was adjusted to simulate asynchronous behavior for `stdout.on('data')` and `on('close')` events using `process.nextTick`.
    *   The test assertions were reverted to use `node-mocks-http.createMocks()` and its standard getters (`_getStatusCode()`, `_getJSONData()`), as the previous custom `waitForResponseEnd` polling mechanism was found to be unnecessary once the `spawn` mock's asynchronous behavior was correctly isolated.
    *   The assertion for the "200 on success" test was updated to `expect(res._getJSONData().output).toBe("OK");` to match the exact output from the `spawn` mock.

3.  **`__tests__/api/sandbox.protection.test.ts`**:
    *   This new test file was created to comprehensively test the sandbox API protection, covering 'admin' allowed, 'customer' blocked, and missing header blocked scenarios.
    *   Assertions were updated to expect `ok: false` in the JSON payload for blocked scenarios, aligning with the implemented sandbox protection logic.

4.  **Project Configuration Updates**:
    *   **`next.config.cjs`**: The `turbopack.root` property was explicitly set to `/home/brewexec/brewassist/` to resolve the "multiple lockfiles" warning.
    *   **`package.json`**: The `typescript` dependency was upgraded from `5.0.4` to `^5.3.3` (resolved to `5.9.3`) to meet Next.js's recommended minimum version.
    *   **`pages/api/sandbox.js`**: The duplicate JavaScript file for the sandbox API route was removed to resolve the "Duplicate page detected" warning.

## Resolution Summary

The core issue stemmed from a subtle interaction between the asynchronous nature of `node:child_process.spawn` (even when mocked) and the `node-mocks-http` library's ability to reliably capture JSON responses in tests. By systematically isolating the `spawn` mock, reverting to standard `node-mocks-http` usage, and then re-introducing the `spawn` mock with correct asynchronous simulation, we were able to stabilize the `sandbox.test.ts` suite. Concurrently, missing sandbox protection logic was implemented in `pages/api/sandbox.ts`, and `sandbox.protection.test.ts` was updated to correctly assert on the new `403` responses. All related build warnings (Turbopack root, TypeScript version, duplicate API route) were also addressed.

**Outcome**: All 7 test suites and 86 tests now pass, and the BrewAssist Sandbox API is robustly protected and fully functional.
