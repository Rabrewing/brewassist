# Revert BrewAssist API Stub (2025-11-16)

**Task:** Revert the temporary stubbing of the `output` variable in `pages/api/brewassist.ts`.

**Current State (to be reverted):**

```typescript
// 🔹 Call BrewAssist Python engine (text only)
// const output = runPythonText(
//   "brewassist_core.agents.codegen_runner",
//   prompt
// );

// 🔹 TEMP: Stubbed output so API is fast + stable for 12.10
const output = `Recursion is a technique where a function solves a problem by calling itself on smaller subproblems until it reaches a base case.`;
```

**Target State (original code):**

```typescript
// 🔹 Call BrewAssist Python engine (text only)
const output = runPythonText('brewassist_core.agents.codegen_runner', prompt);
```

**Context:** This change was made to temporarily bypass the heavy local Mistral model loading for `Test 12.10` and allow the API to be fast and stable for cockpit tests. The next step after this is to implement a persistent Python service for the Mistral model.
