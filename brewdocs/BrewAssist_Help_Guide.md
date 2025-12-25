## 11. Recent Development Updates (2025-12-20)

### 11.1 Intent Classification Refinement

- **Issue:** Previously, general knowledge questions (e.g., "What is the capital of France?") were sometimes misclassified as `DOCS_KB` due to overlapping keywords in `lib/intent-gatekeeper.ts`.
- **Resolution:** The `classifyIntent` function in `lib/intent-gatekeeper.ts` has been updated to remove ambiguous keywords from `DOCS_KB`, ensuring general knowledge queries are correctly routed to `GENERAL_KNOWLEDGE`.

### 11.2 Test Suite `s4.cost.scope.router.lock.test.ts` Progress

- **Issue:** Tests were failing due to `json.text` being empty, indicating that Server-Sent Events (SSE) output from the `/api/brewassist` endpoint was not being correctly captured by `node-mocks-http` in the test environment.
- **Current Status:**
    - The `classifyIntent` issue for `GENERAL_KNOWLEDGE` has been resolved.
    - A helper function, `mockSseResponse`, has been introduced in `__tests__/s4.cost.scope.router.lock.test.ts` to accurately mock `res.write` and `res._getData`, allowing proper capture of SSE stream data.
    - **Next Step:** Integrate `mockSseResponse` into the relevant test cases and re-run the tests to confirm full resolution.