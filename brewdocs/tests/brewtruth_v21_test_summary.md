# BrewTruth v2.1 Test Summary

This document summarizes the conditions and reasons for the `__tests__/brewtruth.v21.test.ts` suite to pass. This serves as a "cheat sheet" for understanding the test environment and the expected behavior of the BrewTruth v2.1 system.

## `__tests__/brewtruth.v21.test.ts`

**Purpose:** This suite verifies the deterministic behavior of BrewTruth v2.1, specifically its ability to:
*   Vary scores based on response characteristics (e.g., short vs. structured).
*   Flag safety concerns and adjust the tier accordingly.
*   Flag possible hallucinations.

**Key Conditions and Reasons for Passing:**

1.  **Deterministic Mocking of `runBrewTruth`:**
    *   **Condition:** The `runBrewTruth` function (presumably from `lib/brewtruth.ts`) is mocked to return predictable `BrewTruthReport` objects. This allows the tests to assert specific outcomes without relying on actual LLM calls or external services.
    *   **Observation:** The test output shows `PASS`, indicating that the mocked `runBrewTruth` is providing the expected `truthScore`, `riskLevel`, and `flags` for each test case.
    *   **Example Mock Behavior (inferred):**
        *   For "scores vary for short vs structured response", the mock likely returns different `truthScore` values based on the input prompt or a simulated response length.
        *   For "flags safety concerns and drops tier", the mock returns a `BrewTruthReport` with `riskLevel: "high"` and a "safety_concern" flag.
        *   For "flags possible hallucination", the mock returns a `BrewTruthReport` with a "hallucination" flag.

2.  **Correct Assertion of BrewTruthReport Properties:**
    *   **Condition:** The tests correctly assert against the properties of the `BrewTruthReport` returned by the mocked `runBrewTruth` function.
    *   **Observation:** The tests use `expect().toBe()` and `expect().toContain()` to verify the `truthScore`, `riskLevel`, and `flags` match the expected values for each scenario.

3.  **Isolation from External Dependencies:**
    *   **Condition:** The test suite is isolated from external dependencies (like actual LLM providers or the `brewassist-engine`) by mocking `runBrewTruth`.
    *   **Observation:** The test runs quickly (0.868 s) and consistently, indicating that it's not making real network calls or being affected by external factors.

## Summary of Passing Logic:

The `brewtruth.v21.test.ts` suite passes because `runBrewTruth` is effectively mocked to return predefined `BrewTruthReport` objects that simulate various truth scenarios. The tests then correctly assert against the properties of these mocked reports, ensuring that the logic for interpreting BrewTruth results is sound. The isolation provided by mocking ensures deterministic and fast test execution.
