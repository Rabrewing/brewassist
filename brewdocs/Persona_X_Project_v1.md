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

/*
 * Inferences Made for Personas:
 * - `side`: Inferred 'admin' for 'admin', 'dev', 'support' and 'customer' for 'customer' based on common roles and the `CockpitMode` definition.
 * - `riskProfile`: Inferred 'normal' for personas with `safetyMode: 'soft-stop'` (from `lib/brewIdentityEngine.ts`). If a persona were to have `safetyMode: 'hard-stop'`, its `riskProfile` would be 'strict'. This needs explicit confirmation.
 * - `defaultCockpitMode`: Directly mapped from the `side` for now, as `CockpitMode` is defined as 'admin' | 'customer'. This assumes the UI defaults to the persona's side.
*/

### B) Modes (how the system is operating)

Defines the operational modes of the system and their policy implications.

```ts
export const MODES = [
  "LLM",
  "HRM",
  "AGENT",
  "LOOP",
  "TOOL",
] as const;
```

### C) Tiers (how much power is unlocked)

Defines the different capability tiers and their general implications.

```ts
export const TIERS = {
  basic: { name: "Basic", note: "Standard functionality, task creation, basic documentation. Access to /task, /doc commands." },
  pro: { name: "Pro", note: "Advanced functionality, code suggestions, more powerful documentation generation. Access to /patch, extended /doc with file context." },
  rb: { name: "RB", note: "High-level strategy, risk analysis, and future high-risk actions (auto-patch, repo-wide scans). RB Mode only, explicitly enabled and audited." },
} as const;
```

### D) Capabilities Registry (the “what can be done” catalog)

A comprehensive list of all capabilities within the system, detailing their intent category, allowed actions, minimum required tier, and specific policy flags.

```ts
export const CAPABILITIES = [
  {
    capabilityId: "/task",
    intentCategory: "SUPPORT",
    actions: ["W"], // Inferred from its nature (creating a task)
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "/doc",
    intentCategory: "DOCS_KB",
    actions: ["W"], // Inferred from its nature (creating/updating docs)
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "/patch",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["W"], // Explicitly "W" for write
    minTier: 2,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: "/hrm",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["R"], // Inferred from its nature (strategy/analysis)
    minTier: 1,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "/registry",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["R"], // Inferred from its nature (inspecting registry)
    minTier: 1,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "/git",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["RWX"], // Inferred from its nature (git operations can be R, W, X)
    minTier: 2,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: "/fs",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["RWX"], // Inferred from its nature (file system operations)
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "brewdocs.inspect",
    intentCategory: "DOCS_KB",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "brewdocs.read",
    intentCategory: "DOCS_KB",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "brewdocs.index",
    intentCategory: "DOCS_KB",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "fs_read",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "fs_tree",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "fs_write",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["W"], // Explicitly "W"
    minTier: 2,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: "fs_edit",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["W"], // Explicitly "W"
    minTier: 2,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: "git_status",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "git_commit",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["W"], // Explicitly "W"
    minTier: 3,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: "db_read",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
  {
    capabilityId: "db_write",
    intentCategory: "PLATFORM_DEVOPS",
    actions: ["W"], // Explicitly "W"
    minTier: 3,
    adminOnly: true, // personaAllowed does not include customer
    requiresSandbox: true,
    requiresConfirm: true,
  },
  {
    capabilityId: "research_web",
    intentCategory: "SUPPORT",
    actions: ["R"], // Explicitly "R"
    minTier: 1,
    adminOnly: false, // personaAllowed includes customer
    requiresSandbox: false,
    requiresConfirm: false,
  },
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
    *   **Tier Basic (minTier 1, adminOnly: false):**
        *   `/task` (W)
        *   `/doc` (W)
        *   `/fs` (RWX)
        *   `brewdocs.inspect` (R)
        *   `brewdocs.read` (R)
        *   `brewdocs.index` (R)
        *   `fs_read` (R)
        *   `fs_tree` (R)
        *   `research_web` (R)
    *   **Tier Pro (minTier 1 or 2, adminOnly: false):**
        *   Same as Tier Basic. (No additional capabilities for customers at Tier Pro based on current registry).
    *   **Tier RB (minTier 1, 2, or 3, adminOnly: false):**
        *   Same as Tier Basic. (No additional capabilities for customers at Tier RB based on current registry).
*   **Admin Persona:**
    *   **Tier Basic (minTier 1):**
        *   `/task` (W)
        *   `/doc` (W)
        *   `/hrm` (R)
        *   `/registry` (R)
        *   `/fs` (RWX)
        *   `brewdocs.inspect` (R)
        *   `brewdocs.read` (R)
        *   `brewdocs.index` (R)
        *   `fs_read` (R)
        *   `fs_tree` (R)
        *   `git_status` (R)
        *   `db_read` (R)
        *   `research_web` (R)
    *   **Tier Pro (minTier 1 or 2):**
        *   All Basic Tier capabilities, plus:
        *   `/patch` (W, requiresSandbox, requiresConfirm)
        *   `/git` (RWX, requiresSandbox, requiresConfirm)
        *   `fs_write` (W, requiresSandbox, requiresConfirm)
        *   `fs_edit` (W, requiresSandbox, requiresConfirm)
    *   **Tier RB (minTier 1, 2, or 3):**
        *   All Pro Tier capabilities, plus:
        *   `git_commit` (W, requiresSandbox, requiresConfirm)
        *   `db_write` (W, requiresSandbox, requiresConfirm)


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

*   **Base Tabs (available to `customer`, `admin`, `dev`):**
    *   `id`: `guide`, `label`: `Guide`, `modes`: [`customer`, `admin`, `dev`]
    *   `id`: `docs`, `label`: `Docs`, `modes`: [`customer`, `admin`, `dev`]
    *   `id`: `help`, `label`: `Help`, `modes`: [`customer`, `admin`, `dev`]
    *   `id`: `history`, `label`: `History`, `modes`: [`customer`, `admin`, `dev`]
*   **Admin/Dev Tabs (available to `admin`, `dev`):**
    *   `id`: `files`, `label`: `Files`, `modes`: [`admin`, `dev`]
    *   `id`: `sandbox`, `label`: `Sandbox`, `modes`: [`admin`, `dev`]
    *   `id`: `cognition`, `label`: `Cognition`, `modes`: [`admin`, `dev`]

/*
 * Inferences Made for DevOps 8 Panel Modules:
 * - `minTier`: Not explicitly defined in `tabs.ts`. Assuming `minTier: 1` for all modules as their visibility is primarily controlled by `cockpitMode` and persona, rather than a specific tier level. This needs explicit confirmation.
*/

### Tier Definitions

*   **Tier Basic:**
    *   **"safe"**: Operations are generally considered safe, primarily read-only or low-impact write actions (e.g., creating tasks/docs). Capabilities requiring explicit confirmation (`requiresConfirm: true`) or a sandbox (`requiresSandbox: true`) are typically not available or are heavily restricted.
    *   **"sandbox available"**: Sandbox is generally not required for basic operations. If a capability requires a sandbox, it would be blocked or require a higher tier.
*   **Tier Pro:**
    *   **"safe"**: Allows more impactful write actions (e.g., `/patch`, `fs_write`, `fs_edit`). Safety for these actions is managed by often requiring explicit user confirmation (`requiresConfirm: true`) and execution within a sandbox (`requiresSandbox: true`). This implies a higher level of inherent risk, mitigated by these policy controls.
    *   **"sandbox available"**: Sandbox is available and frequently required for "pro" level write capabilities.
*   **Tier RB:**
    *   **"safe"**: Provides the highest level of access, including potentially high-risk actions. Safety is managed through explicit auditing (`auditLevel: 'full'`) and the "RB Mode only" restriction. Capabilities at this tier often require both `requiresSandbox: true` and `requiresConfirm: true`.
    *   **"sandbox available"**: Sandbox is available and frequently required for high-risk "RB" level capabilities.

### Mode Meaning

The operational modes (`LLM`, `HRM`, `AGENT`, `LOOP`, `TOOL`) primarily dictate *how* the AI engine (`runBrewAssistEngineStream`) processes a request, rather than directly gating *what capabilities* are allowed by the `evaluateHandshake` policy. Capability gating is primarily controlled by `personaAllowed`, `tierRequired`, `sandboxRequired`, `confirmApplyRequired`, and `cockpitMode`. The `surfaces` property in `CAPABILITY_REGISTRY` indicates *how* a capability can be invoked (e.g., via a command, a wizard, or automatically by an assistant), but not which specific operational mode it is restricted to by the `evaluateHandshake` function.

---

## 5) Next Step

Please provide the details for the sections above, starting with **A) Personas** using the provided `PERSONAS` template.
