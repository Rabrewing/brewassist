# S4.9 to S4.10 Roadmap: Consolidated

This document outlines the single, authoritative roadmap from the current state (S4.9d.4) through S4.10, and clarifies where the `/init` wizard and S5.6 Guide Mode fit in the grand scheme.

---

## ✅ S4.9 — BrewTruth + Toolbelt + Input UX

This phase is all about signal, safety, and control at the message level.

### S4.9a – BrewTruth Data Model & API

**Status: ✅ DONE (spec + implementation + tests)**

-   `BrewTruthReport` model defined (`truthScore`, `riskLevel`, `flags`, `version`, etc.).
-   `/api/brewtruth` wired to `lib/brewtruth.ts`.
-   Stub grading implemented + Jest tests.
-   Curl/test path proves: Truth ON vs Truth OFF vs unset env.

---

### S4.9b.x – MCP Tools Overhaul + Truth Wiring

**Status: ✅ DONE (and documented)**

-   MCP wizard stubs created: `McpWizardModal`, `FileWizard`, `GitWizard`, `DatabaseWizard`, `ResearchWizard`.
-   Left-side MCP buttons now open wizard UIs instead of doing opaque actions.
-   `runBrewAssistEngine` can call `BrewTruth` when `BREWTRUTH_ENABLED=true`.
-   Dedicated tests: Mistral routing, NIMs routing, BrewTruth ON/OFF behavior.
-   Env hardening tracked in `S4.9b_env_BrewTruth_Env_Hardening_Spec.md`.

---

### S4.9c – Input Bar & BrewTruth UI Surfaces

**Status: ✅ PATCH 1 DONE, more polish TODO**

**Done:**

-   Markdown toolbar added: Bold, italic, H1, H2, `</>` code.
-   Toolbar writes markdown syntax into the input, so whatever you paste from ChatG keeps structure once rendered.
-   BrewTruth chip (“Truth 80% • low”) added to message bubbles as a visual indicator.

**Still TODO (for later sub-patches, not blocking S4.10):**

-   Auto-scroll polish: chat should behave like ChatGPT — always scroll to new message unless user is manually reading up.
-   BrewTruth chip layout tweaks (spacing, vertical centering).
-   Optional mini markdown preview bubble.

---

### S4.9d – Toolbelt Reintegration & Enforcement

> This is where we turned the Toolbelt dropdown into a real governor, not just a label.

#### S4.9d.1 – HUD / Tier Selector Online

**Status: ✅ DONE**

-   Toolbelt selector in the input bar (Tier 1 – Safe, Tier 2 – Guided, Tier 3 – Power).
-   Visible state reflecting active tier for the next action.

#### S4.9d.2 – Tier Rules → MCP Guard Rails

**Status: ✅ DONE**

-   `toolbeltConfig.ts` defines:
    -   Tool IDs (file ops, git ops, db ops, research, etc.).
    -   Per-tier permissions (T1 / T2 / T3).
-   `canRunTool()` / equivalent logic decides if a given tool is allowed under the current tier.

#### S4.9d.3 – API Enforcement + Tests

**Status: ✅ DONE**

-   New Jest suites:
    -   Tool allowed at Tier 1 → passes.
    -   Tool blocked at Tier 1 but allowed at Tier 2 → correct behavior.
    -   Tier 3 rules exercised where applicable.
-   Toolbelt logic is enforced at the API layer, not just in the UI.

#### S4.9d.4 – Sync Layer + BrewLast Touchpoints

**Status: ✅ DONE (first pass)**

-   Cockpit reads toolbelt tier from a shared config/ctx and passes it into:
    -   BrewAssist engine options.
    -   Tool invocations (MCP layer).
-   Tests confirm expectations align with `TOOLBELT_MATRIX.md` / enforcement spec.
-   BrewLast hooks earmarked for logging (we haven’t gone deep on BrewLast v2 yet — still filesystem-based per your rule).

---

## 🧭 Where We Are Right Now

All S4.9a–d work is in code, documented, lint/build/test clean, and pushed.

-   BrewTruth is live behind an env flag.
-   Toolbelt tiers are real and enforced.
-   Input bar has markdown tools and a BrewTruth chip, with further polish queued but not blocking.

Now we lock in the next corridor: S4.10 (modes + intent gatekeeping) and where `/init` and S5.6 sit so nothing is lost.

---

## 🔒 S4.10 – Modes & Intent Governance (Admin vs Customer)

This phase is about who is using BrewAssist and what they’re trying to do.

### S4.10a — Admin vs Customer Mode Split

**Goal:** Rename and formalize the two faces of BrewAssist:

-   **Admin Mode (internal):** Full cockpit: MCP tools, sandbox, logs, experimental features.
-   **Customer Mode (external):** Clean, focused UI: no sandbox, limited toolbelt, safe actions only.

**Key pieces:**

-   Replace “Dev” terminology with **Admin** across:
    -   Mode types / enums.
    -   UI labels.
    -   Settings / toggles.
-   Add a single `cockpitMode` value, e.g.:
    -   `type CockpitMode = 'admin' | 'customer';`
-   **Persistence:**
    -   Stored in `localStorage` or BrewLast.
    -   Restored on reload.
-   **Guardrails:**
    -   In **Customer** mode:
        -   Sandbox panel hidden.
        -   Tier 3 actions blocked.
        -   Potentially some MCP wizards hidden or run in read-only suggestion mode.

**Acceptance criteria:**

-   Toggling `cockpitMode` clearly changes visible surfaces (MCP tools, sandbox, etc.).
-   One build supports both modes; no separate deploys.

---

### S4.10b — BrewAssist Intent Gatekeeper (Hybrid Mode v1)

**Goal:** Every prompt goes through an intent checkpoint before tools fire.

**Core classification buckets:**

-   `ENGINEERING` → okay to execute within BrewAssist.
-   `GENERAL` → future BrewChat (for now: “Soon online, this request isn’t supported here yet.”).
-   `KNOWLEDGE` → future BrewCore (same “coming soon / not supported” message).
-   `RISK` → send through BrewTruth.
-   `OVERRIDE` → Admin-only “force execute” lane.

**What v1 actually does (no future vapor):**

-   A small intent classifier (can be rule-based + model assist later) that returns:
    -   `type BrewIntent = 'ENGINEERING' | 'GENERAL' | 'KNOWLEDGE' | 'RISK' | 'OVERRIDE';`
-   If `ENGINEERING`:
    -   Proceed to HRM / LLM / Agent / Loop as normal.
-   If `GENERAL` or `KNOWLEDGE`:
    -   Return a clear message like:
        > “This looks like a general/knowledge request. BrewChat/BrewCore will handle this soon, but this cockpit is DevOps-only, so I can’t run it here yet.”
-   If `RISK`:
    -   Run BrewTruth:
        -   `truthScore < 0.5` → block + explain.
        -   `truthScore >= 0.5` → allow, but surface risk level.
-   If `OVERRIDE`:
    -   Only allowed in **Admin mode** and only if Toolbelt tier & safety rules permit.
-   All decisions loggable (or logged later) via BrewLast as:
    ```json
    {
      "type": "intent_gate",
      "input": "...",
      "classified_intent": "RISK",
      "routed_target": "BrewTruth",
      "timestamp": "..."
    }
    ```

**Acceptance criteria:**

-   No prompt bypasses Gatekeeper.
-   “Coming soon” paths for BrewChat/BrewCore are clear and friendly, but still say: “not supported in BrewAssist yet.”
-   Risk lane actually triggers BrewTruth block/allow logic.

---

### S4.10c — Toolbelt + Gatekeeper Integration

**Goal:** Toolbelt tier and intent must agree before action.

**Rules (examples):**

-   If `intent ≠ ENGINEERING`:
    -   Block any Tier 2 / Tier 3 tools.
-   **Tier mapping:**
    -   **Tier 1** → read/analysis only, okay for `ENGINEERING`/`KNOWLEDGE`.
    -   **Tier 2** → write/patch allowed only when intent is `ENGINEERING` and mode is `Admin`.
    -   **Tier 3** → requires `Admin` mode + explicit override pattern (“Tier 3 authorized”) + possibly future G.E.P. header for Gemini flows.

**Acceptance criteria:**

-   You cannot trigger file writes or git actions from a `GENERAL` or `KNOWLEDGE` intent.
-   Attempted violations produce clear, guided messages (not silent failures).

---

### S4.10d — Tests + BrewDocs Update

**Goal:** Snap this whole phase into something future devs can reason about.

-   **Jest tests:**
    -   Intent → allowed modes.
    -   Intent + tier → `canRunTool` or blocked.
    -   Admin vs Customer plus intent combos.
-   **Docs:**
    -   `brewdocs/brewassist/s4/S4.10a_Admin_Customer_Mode.md`
    -   `brewdocs/brewassist/s4/S4.10b_Intent_Gatekeeper_Hybrid_Mode.md`
-   Roadmap update linking S4.9 → S4.10 → `/init` → S5.6.

---

## 🧱 Where /init and S5.6 Fit (So We Don’t Lose Them)

Just to be crystal:

-   **/init wizard (project type, experience level, frameworks, etc.)**
    -   Stays as **S4.11+** work:
        -   It uses Gatekeeper + BrewContext + BrewLast.
        -   We don’t move it earlier than S4.10 because intent + modes should exist first.
-   **S5.6 – BrewAssist Guide Mode & Support Engine**
    -   Sits in **S5.x** as the “Help / FAQ / Tutor” layer on top of:
        -   Gatekeeper
        -   BrewLast
        -   Toolbelt tiers
        -   Modes (Admin / Customer)
        -   BrewTruth
    -   We already outlined S5.6 in the screenshot (UI components, DSL, skill levels, error explainers, tutorials, fallback visualizer). That stays intact — just clearly after S4.10 and after minimal S5.0–S5.2 BrewLast / BrewContext work.

---

## TL;DR for you, RB

-   Nothing from S4.10a/b (`/init`, Gatekeeper, Admin vs Customer) is lost.
-   S4.9 is now cleanly done and documented — BrewTruth + Toolbelt + input UX.
-   The official next corridor is:
    1.  **S4.10a – Admin vs Customer modes**
    2.  **S4.10b – Intent Gatekeeper v1 (ENGINEERING/GENERAL/KNOWLEDGE/RISK/OVERRIDE)**
    3.  **S4.10c – Toolbelt + Gatekeeper handshake**
    4.  **S4.10d – Tests + docs**
-   Then we go into `/init` and S5.6.
