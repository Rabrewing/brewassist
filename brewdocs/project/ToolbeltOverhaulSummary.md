# Toolbelt Architectural Overhaul Summary (December 26th, 2025)

## Deprecation of `lib/toolbeltConfig.ts` and Transition to Unified Policy Enforcement

This document summarizes the architectural overhaul undertaken to deprecate `lib/toolbeltConfig.ts` and integrate a new, unified policy enforcement system. This change was necessitated by the evolving security and governance requirements of the BrewAssist platform, moving towards a more robust and centralized policy evaluation mechanism.

### Rationale for Overhaul

The original `lib/toolbeltConfig.ts` file served as a central point for defining Toolbelt tiers, modes, and rules. However, as the system grew in complexity, particularly with the introduction of BrewTruth and the S4.10c handshake policy, this configuration became insufficient. It lacked the granularity and dynamic evaluation capabilities required for fine-grained access control, risk assessment, and user confirmation flows.

The new approach leverages `UnifiedPolicyEnvelope` and `CAPABILITY_REGISTRY` to provide a consistent and extensible policy layer, allowing for real-time evaluation of actions based on user persona, cockpit mode, BrewTier, and specific capabilities.

### Key Changes and Impact

The deprecation of `lib/toolbeltConfig.ts` triggered a cascade of changes across multiple core components. The primary impact was the removal of several key type definitions and utility functions, leading to widespread type errors that required extensive refactoring.

#### 1. Core Policy Enforcement (`lib/toolbelt/handshake.ts`)

*   **`evaluateHandshake` Function:** This function is now the central authority for policy decisions. It takes various arguments (intent, tier, persona, cockpit mode, capability ID, action, etc.) and returns a `UnifiedPolicyEnvelope`.
*   **`UnifiedPolicyEnvelope`:** This interface defines the outcome of a policy evaluation, including `ok` (boolean), `reason` (string), `requiresConfirm` (boolean), `requiresSandbox` (boolean), `capabilityId`, `tier`, and `route`. It no longer contains properties like `decision`, `persona`, `cockpitMode`, `intent`, or `action`, as these are inputs to the evaluation, not part of its output.

#### 2. Type Definition Consolidation

*   **`BrewTier`:** Moved from `lib/toolbeltConfig.ts` to `lib/commands/types.ts`. It is now a string literal type (`"basic" | "pro" | "rb"`).
*   **`ToolbeltBrewMode`:** Defined locally in `contexts/ToolbeltContext.tsx` as `"HRM" | "LLM" | "AGENT" | "LOOP"`.
*   **`PersonaId`:** Used in `lib/brewCognition.ts` to represent the persona ID (e.g., `"admin"`, `"dev"`), imported from `lib/brewIdentityEngine.ts`.

#### 3. Component-Specific Refactoring

*   **`lib/brewCognition.ts`:**
    *   Updated to use `PersonaId` for `CognitionState.persona`.
    *   Adopted `UnifiedPolicyEnvelope` for `executionPermission`.
    *   Adjusted conditional logic to use `UnifiedPolicyEnvelope.ok` and `UnifiedPolicyEnvelope.requiresConfirm` for emotional state and risk level adjustments.
*   **`lib/brewassist-engine.ts`:**
    *   Updated `BrewTier` import.
    *   Refactored API key checks in `callProviderStream` to resolve type mismatches related to `BrewProviderId`.
*   **`components/ActionMenu.tsx`:**
    *   Removed all references to `lib/toolbeltConfig.ts` and `ToolPermission`.
    *   Each `ActionMenuItem` now directly calls `evaluateHandshake` to determine its `policy` prop, dynamically assessing permissions based on the current context.
    *   Mock policies were updated to align with the `UnifiedPolicyEnvelope` structure.
*   **`components/BrewCockpitCenter.tsx`:**
    *   Removed unused `BrewAssistApiResponse` import.
    *   Updated `UiMessage.cognition` to correctly handle `null` values.
    *   Adjusted tier selection `onChange` handler to cast to `BrewTier`.
*   **`components/WorkspaceSidebarLeft.tsx`:**
    *   Removed `CapabilityId` import and used `string` for `capabilityId`.
    *   Obtained the full `Persona` object using `getActivePersona()` for `evaluateHandshake` calls.
*   **`contexts/ToolbeltContext.tsx`:**
    *   Removed deprecated `toolbeltConfig` imports and `ToolbeltRulesSnapshot`.
    *   Defined `ToolbeltBrewMode` locally.
    *   Updated `DEFAULT_TIER` to `"basic"` (a valid `BrewTier` literal).
    *   Refactored `setTier` logic and `logToolbeltEvent` calls to align with the new type definitions and removed `effectiveRules`.
*   **`lib/brewConfig.ts`:**
    *   Reverted `DEFAULT_PERSONA` type to `any` as it represents a configuration object, not a `Persona` from the identity engine.
*   **`lib/toolbeltLog.ts`:**
    *   Updated `ToolbeltEvent.mode` to `ToolbeltBrewMode` to correctly reflect the type of mode being logged.

### Validation

The entire codebase now successfully passes `pnpm lint` and `pnpm build` commands. All type errors and build failures stemming from the deprecation of `lib/toolbeltConfig.ts` and the transition to the unified policy enforcement system have been resolved. The project is stable and compiles correctly.

### Next Steps

With the core architectural refactoring complete and the build stabilized, development can proceed with confidence on subsequent tasks, leveraging the new, robust policy enforcement mechanisms.
