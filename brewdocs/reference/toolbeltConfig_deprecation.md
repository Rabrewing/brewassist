# Deprecation of `lib/toolbeltConfig.ts`

This document outlines the deprecation of the `lib/toolbeltConfig.ts` file and its replacement with a new unified capability registry system as of **S4.10c.4**.

## 1. Why was `toolbeltConfig.ts` deprecated?

The `lib/toolbeltConfig.ts` file previously served as the primary source for defining toolbelt tiers, modes, and rules. However, as the BrewAssist platform grew, this approach led to several challenges:

*   **Scattered Truth:** Policy and configuration rules were spread across multiple files (`toolbeltConfig.ts`, `handshake.ts`, etc.), making it difficult to maintain consistency.
*   **Lack of Unification:** There was no single, unified system for governing capabilities across different surfaces (AI auto-use, MCP tools, and `/commands`).
*   **Difficult to Scale:** Adding new tools or commands required changes in multiple places, increasing the risk of errors and inconsistencies.

## 2. The New Unified Capability Registry

To address these challenges, we have introduced a **Unified Capability Registry**, which serves as the **single source of truth** for all capabilities within BrewAssist.

The new system is based on the following core principles:

*   **3 Surfaces, 1 Gate, 1 Truth:** All capabilities, whether initiated by the AI, a user through the MCP, or a power-user via a `/command`, are governed by the same policy engine.
*   **Centralized Registry:** A single registry, located at `lib/capabilities/registry.ts`, defines all capabilities and their associated policies.
*   **Clear Contracts:** Each capability has a clear contract that defines its properties, including tier requirements, allowed personas, intent category, and more.

## 3. Key Changes and New Files

The following files are central to the new system:

*   `lib/capabilities/registry.ts`: The new single source of truth for all capability definitions.
*   `lib/commands/policies.ts`: Derives command-specific policies from the capability registry.
*   `lib/toolbelt/policies.ts`: Derives MCP tool-specific policies from the capability registry.
*   `lib/toolbelt/handshake.ts`: The central policy enforcement point, which uses the capability registry to make decisions.

## 4. How to Update Imports

Any files that previously imported from `lib/toolbeltConfig.ts` should be updated to use the new system.

*   For tool and command policies, import from `lib/commands/policies.ts` or `lib/toolbelt/policies.ts`.
*   For policy enforcement, use the `evaluateHandshake` function from `lib/toolbelt/handshake.ts`.
*   For direct access to capability definitions, import from `lib/capabilities/registry.ts`.

This change ensures a more robust, scalable, and maintainable architecture for BrewAssist.
