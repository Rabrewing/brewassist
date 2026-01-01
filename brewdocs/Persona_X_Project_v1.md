# Persona, Handshake, and MCP Tool Gating Policy Matrix - v1

This document serves as the single source of truth for defining the policy matrix governing persona, handshake, and MCP tool gating within the BrewAssist platform. Its purpose is to ensure consistent behavior, prevent regressions, and provide a clear, auditable definition of system permissions across various user types, operational modes, and capability tiers.

---

## 1) Policy Matrix Definitions

### A) Personas (who is acting)

Defines the different user personas within the system, their inherent side, risk profile, and default cockpit mode.

export const PERSONAS = [
{ id: "admin", side: "admin", riskProfile: "normal", defaultCockpitMode: "admin" },
{ id: "customer", side: "customer", riskProfile: "normal", defaultCockpitMode: "customer" },
{ id: "dev", side: "admin", riskProfile: "normal", defaultCockpitMode: "admin" },
{ id: "support", side: "admin", riskProfile: "normal", defaultCockpitMode: "admin" },
] as const;

// Updated: All personas have safetyMode: 'soft-stop', so riskProfile: 'normal'. Sides inferred from context.

/\*

- Inferences Made for Personas:
- - `side`: Inferred 'admin' for 'admin', 'dev', 'support' and 'customer' for 'customer' based on common roles and the `CockpitMode` definition.
- - `riskProfile`: Inferred 'normal' for personas with `safetyMode: 'soft-stop'` (from `lib/brewIdentityEngine.ts`). If a persona were to have `safetyMode: 'hard-stop'`, its `riskProfile` would be 'strict'. This needs explicit confirmation.
- - `defaultCockpitMode`: Directly mapped from the `side` for now, as `CockpitMode` is defined as 'admin' | 'customer'. This assumes the UI defaults to the persona's side.
    \*/

### B) Modes (how the system is operating)

Defines the operational modes of the system. These currently influence behavioral context (how work is processed) rather than hard permission gates, but are included for future policy extensions.

```ts
export const MODES = ['LLM', 'HRM', 'AGENT', 'LOOP', 'TOOL'] as const;
```

### C) Tiers (how much power is unlocked)

Defines the different capability tiers and their general implications.

```ts
export const TIERS = {
  1: {
    name: 'Basic',
    note: 'Standard functionality, task creation, basic documentation. Access to /task, /doc commands.',
  },
  2: {
    name: 'Pro',
    note: 'Advanced functionality, code suggestions, more powerful documentation generation. Access to /patch, extended /doc with file context.',
  },
  3: {
    name: 'RB',
    note: 'High-level strategy, risk analysis, and future high-risk actions (auto-patch, repo-wide scans). RB Mode only, explicitly enabled and audited.',
  },
} as const;
```

### D) Capabilities Registry (the “what can be done” catalog)

A comprehensive list of all capabilities within the system, detailing their intent category, allowed actions, minimum required tier, and specific policy flags.

_Note: This table is generated from `lib/capabilities/registry.ts` to prevent drift. Manual edits should be made to the registry._

````ts
export const CAPABILITIES = [
  // Command capabilities
  { capabilityId: "/task", intentCategory: "SUPPORT", actions: ["W"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "/doc", intentCategory: "DOCS_KB", actions: ["W"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "/patch", intentCategory: "PLATFORM_DEVOPS", actions: ["W"], minTier: 2, adminOnly: true, requiresSandbox: true, requiresConfirm: true },
  { capabilityId: "/hrm", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: true, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "/registry", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: true, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "/git", intentCategory: "PLATFORM_DEVOPS", actions: ["RWX"], minTier: 2, adminOnly: true, requiresSandbox: true, requiresConfirm: true },
  { capabilityId: "/fs", intentCategory: "PLATFORM_DEVOPS", actions: ["RWX"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },

  // BrewDocs capabilities
  { capabilityId: "brewdocs.inspect", intentCategory: "DOCS_KB", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "brewdocs.read", intentCategory: "DOCS_KB", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "brewdocs.index", intentCategory: "DOCS_KB", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },

  // FS capabilities
  { capabilityId: "fs_read", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "fs_write", intentCategory: "PLATFORM_DEVOPS", actions: ["W"], minTier: 2, adminOnly: true, requiresSandbox: true, requiresConfirm: true },
  { capabilityId: "fs_tree", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "fs_edit", intentCategory: "PLATFORM_DEVOPS", actions: ["W"], minTier: 2, adminOnly: true, requiresSandbox: true, requiresConfirm: true },

  // Git capabilities
  { capabilityId: "git_status", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: true, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "git_commit", intentCategory: "PLATFORM_DEVOPS", actions: ["W"], minTier: 3, adminOnly: true, requiresSandbox: true, requiresConfirm: true },

  // DB capabilities
  { capabilityId: "db_read", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: true, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "db_write", intentCategory: "PLATFORM_DEVOPS", actions: ["W"], minTier: 3, adminOnly: true, requiresSandbox: true, requiresConfirm: true },

  // Research capabilities
  { capabilityId: "research_web", intentCategory: "SUPPORT", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },

  // Gemini Toolbelt capabilities (absorbed)
  { capabilityId: "capability.file.read.analyze", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "capability.code.explain", intentCategory: "DOCS_KB", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "capability.research.external", intentCategory: "SUPPORT", actions: ["R"], minTier: 1, adminOnly: false, requiresSandbox: false, requiresConfirm: false },
  { capabilityId: "capability.plan.assist", intentCategory: "PLATFORM_DEVOPS", actions: ["R"], minTier: 2, adminOnly: true, requiresSandbox: false, requiresConfirm: false },
] as const;

/*
 * Inferences Made for Capabilities:
 * - `actions`: Derived from the `rwx` property in `Capability` interface, or inferred from the nature of the capability if `rwx` is not present.
 * - `adminOnly`: Inferred as `true` if `personaAllowed` does not include 'customer'. Otherwise `false`.
 * - `allowedModes`: Removed, as the `evaluateHandshake` function does not directly gate capabilities based on the operational mode (`LLM`, `HRM`, `AGENT`, `LOOP`, `TOOL`).
*/```

### E) Admin vs Customer Rules (explicit)

Explicitly states what capabilities are available to Admin and Customer personas at each tier.

*   **Customer Persona:**
    *   **Tier 1 (minTier 1, adminOnly: false):**
        *   `/task`, `/doc`, `/fs`, `brewdocs.*`, `fs_read`, `fs_tree`, `research_web`, `capability.*`
    *   **Tier 2/3:** No additional (customers capped at read operations)
*   **Admin Persona:**
    *   **Tier 1 (minTier 1):**
        *   All customer capabilities + `/hrm`, `/registry`, `git_status`, `db_read`
    *   **Tier 2 (minTier 2):**
        *   All Tier 1 + `/patch`, `/git`, `fs_write`, `fs_edit`, `capability.plan.assist`
    *   **Tier 3 (minTier 3):**
        *   All Tier 2 + `git_commit`, `db_write`


---

## 2) Handshake and UI Gating Mechanics (Confirmed)

*   UI elements are disabled (`not-allowed`) and/or `policy.ok = false` when access is denied.
*   Tooltip text for denied actions is derived from `policy.reason`.
*   The `ActionMenu` utilizes `evaluateHandshake({ intent, tier, persona, cockpitMode, capabilityId, action })` for policy evaluation.
*   The test suite will target both `evaluateHandshake()` unit tests and UI rendering component tests.

---

## 3) Jest Test Suite Plan

### Suite 1 — `handshake.policy.test.ts` (Pure Logic)

*   **Purpose:** Verifies the core policy logic defined in the matrix.
*   **Methodology:** Table-driven tests covering all combinations of persona, mode, tier, and capability.
*   **Assertions:**
    *   `policy.ok` (true/false)
    *   `policy.reason` (exact code string)
    *   `policy.requiresConfirm` (boolean)
    *   `policy.requiresSandbox` (boolean)

### Suite 2 — `ActionMenu.gating.test.tsx` (UI Contract)

*   **Purpose:** Validates that the Action Menu UI correctly reflects policy decisions.
*   **Methodology:** Component tests rendering the `ActionMenu` under various policy conditions.
*   **Assertions:**
    *   Items with `ok=false` render as `disabled`.
    *   Tooltips display the correct `policy.reason`.
    *   No "click" fires when an item is disabled.
    *   Confirm/sandbox badges show when `requiresConfirm` or `requiresSandbox` flags are present.

### Suite 3 — `RightDevOpsPanel.permissions.test.tsx` (DevOps 8 Panel)

*   **Purpose:** Validates the visibility and behavior of modules within the right-side DevOps 8 panel based on persona and policy.
*   **Methodology:** Component tests rendering the `RightDevOpsPanel` in different persona/mode/tier contexts.
*   **Assertions:**
    *   Customer side hides admin-only modules.
    *   Admin side shows the full toolset.
    *   Collapsible behavior does not cover the composer.
    *   "Panels don’t render if gated" (no ghost overlays).

---

## 4) Information Required for Policy Matrix Completion

### DevOps 8 Panel Module List

The following modules are displayed in the DevOps 8 Panel, with their visibility controlled by the `cockpitMode`.

*   **Base Tabs (available to all personas):**
    *   `id`: `guide`, `label`: `Guide` (DevOps 8 principles)
    *   `id`: `docs`, `label`: `Docs`
    *   `id`: `help`, `label`: `Help`
    *   `id`: `history`, `label`: `History`
*   **Admin-only Tabs (available to `admin`, `dev`, `support`):**
    *   `id`: `files`, `label`: `Files` (project tree)
    *   `id`: `sandbox`, `label`: `Sandbox`
    *   `id`: `cognition`, `label`: `Cognition` (operational states)

/*
 * Inferences Made for DevOps 8 Panel Modules:
 * - `minTier`: Not explicitly defined in `tabs.ts`. Assuming `minTier: 1` for all modules as their visibility is primarily controlled by `cockpitMode` and persona, rather than a specific tier level. This needs explicit confirmation.
*/

### Tier Definitions

*   **Tier 1:** Read operations, basic writes (tasks/docs). No sandbox/confirm required.
*   **Tier 2:** Moderate writes (patches, edits). Requires sandbox and confirm.
*   **Tier 3:** High-risk writes (commits, DB). Requires sandbox, confirm, full audit.

### Mode Meaning

The operational modes (`LLM`, `HRM`, `AGENT`, `LOOP`, `TOOL`) primarily dictate *how* the AI engine (`runBrewAssistEngineStream`) processes a request, rather than directly gating *what capabilities* are allowed by the `evaluateHandshake` policy. Capability gating is primarily controlled by `personaAllowed`, `tierRequired`, `sandboxRequired`, `confirmApplyRequired`, and `cockpitMode`. The `surfaces` property in `CAPABILITY_REGISTRY` indicates *how* a capability can be invoked (e.g., via a command, a wizard, or automatically by an assistant), but not which specific operational mode it is restricted to by the `evaluateHandshake` function.

---

## 5) Next Step

Please provide the details for the sections above, starting with **A) Personas** using the provided `PERSONAS` template.
````
