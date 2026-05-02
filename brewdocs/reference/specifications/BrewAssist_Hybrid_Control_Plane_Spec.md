# BrewAssist Hybrid Control Plane Spec

Updated: 2026-05-02

## Goal

Make BrewAssist online the shared control plane for both the browser app and `brew-agentic` local TUI, without inventing separate workflows.

## Canonical Workflow

1. Intent
2. Plan
3. Preview
4. Confirm
5. Execute
6. Report
7. Replay

## Roles

- **BrewAssist Online**: repo/provider selection, collaboration, review, approvals, audit, replay.
- **Brew-Agentic Local TUI**: terminal-first execution, offline use, fast operator control, local memory and telemetry.
- **Shared Contract**: one plan/session/run schema, one diff format, one replay/report model.
- **Agent Fabric**: small typed agents for intent, plan, policy, execute, report, replay, telemetry, and collaboration.

## Current Implementation Gap

- The typed agent fabric is now partially implemented.
- `intent_agent`, `planner_agent`, `policy_agent`, `executor_agent`, `reporter_agent`, `replay_agent`, `telemetry_agent`, and `collab_agent` now emit shared runtime events.
- Replay traces now persist through `sessions`, `runs`, and `run_events`.
- Collaboration notes now persist as `collab.message` events and surface in replay and the right rail.
- Current online behavior still relies on central UI/API orchestration in places where dedicated typed agents should own more stage transitions and side effects.
- BrewAssist is not v1 until provider/repo binding, sandbox execution, diff/confirm/apply, and human collaboration flows fully operate through the shared contract.
- Hosted resume is part of the shared contract: `/resume` should restore the latest run metadata plus the last meaningful command-center context before replay inspection finishes.

## Shared Event Envelope

All agent messages and run events should carry the same core fields.

- `sessionId`
- `runId`
- `stage`
- `agentId`
- `eventType`
- `timestamp`
- `actor`
- `summary`
- `payload`
- `policyState`
- `telemetry`
- `uiHints`

Stage payloads should stay narrow and typed:

- Intent: user text, repo context, desired outcome
- Plan: steps, risks, preview targets, confirm requirements
- Preview: diff summary, files touched, policy notes
- Confirm: approval state, blockers, acknowledgements
- Execute: sandbox writes, command results, retries, timestamps
- Report: changed files, outcome summary, truth/report metadata
- Replay: prior run references, immutable snapshot data
- Telemetry: DevOps 8 scores, latency, safety, scope, efficiency
- Collab: chat entries, presence, handoff state, screen-share markers

## Shared Session Fields

- `sessionId`
- `runId`
- `tenantId`
- `orgId`
- `repoProvider` (`github` | `gitlab` | `bitbucket` | `local`)
- `repoRoot`
- `repoId`
- `projectId`
- `mode`
- `tier`
- `persona`
- `riskLevel`

## Repository Model

- BrewAssist connects to the source repo through the provider.
- Work happens in a sandbox mirror, not directly against the live repo.
- Diffs are generated from mirror vs source and must be previewed before apply.

## Repo Connection Flow

1. User selects a provider: GitHub, GitLab, Bitbucket, or local.
2. User authenticates with that provider using OAuth, app install, token, or enterprise SSO.
   - **Note on "Local":** When "Local" is selected in the online web UI, BrewAssist should surface a larger local-runtime handoff that explains the Brew Agentic install/connect path and the dedicated sandbox execution boundary. The online web app cannot read local drives for security, but it can orchestrate the local runtime once Brew Agentic is connected.
3. User selects a repo or workspace scope.
4. BrewAssist binds that repo to a sandbox mirror.
5. BrewAssist uses the mirror for reads, previews, and writes.
   - The main pane should narrate the review and approval flow while the sandbox handles the actual writable execution surface.
6. Unsupported cross-repo access fails closed.
7. Supabase sessions and org membership govern enterprise access before production rollout.
8. Browser-originated bearer tokens may be forwarded to protected Next API routes until server-side cookie exchange is fully hardened.

## Onboarding

Onboarding is a required v1 surface for both new users and enterprise rollouts.

- first-run setup should explain the hybrid control plane and safe workflow
- provider connection, repo selection, and sandbox binding should be guided
- org creation, workspace setup, and role assignment should be explicit for enterprise tenants
- diff review, confirm gates, and replay should be introduced during onboarding
- resume and session recovery should be introduced during onboarding so returning users can reopen the last workflow without copy/paste or a dead-end landing page
- research and toolbelt permissions should be explained before first use
- onboarding must leave the user with a working Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay loop
- power users should be able to invoke a slash-command palette from the center composer
- public landing and auth gate should precede the cockpit for signed-out users on brewassist.app
- cookie consent and legal links should be present on the public entry flow
- the public entry flow should link accessibility and cookie policy pages and disclose AI/data collection terms
- tenant bootstrap should be idempotent so super-admin recovery and repeated login attempts reuse the same org/workspace instead of failing on unique constraints

## Surface Responsibilities

- **Online**
  - select provider and repo
  - authenticate to the provider
  - capture intent
  - generate and preview plans
  - show diffs and approvals
  - record reports and replay data
  - expose compact collaboration surfaces for chat, presence, reporting, and screen-share launch
  - expose the left rail as grouped, policy-aware MCP/action surfaces with a compact helper card
  - keep the right rail compact so the center pane stays dominant
  - **Help Tab:** Must explain the "Public Repository Requirement" (BrewAssist V1 requires repos to be public to support full Sandbox bindings and AI code-reading functions).
- **Local TUI / Sandbox Runtime**
  - execute approved plans
  - run offline when needed
  - expose operator keybinds and terminal-first telemetry
  - shadow the repo/workspace in an isolated execution surface
  - remain distinct from the main control-plane conversation

## Sandbox Shape

- V1 sandbox should be a larger workspace than the right rail, such as a dedicated panel, drawer, or modal execution surface.
- V1 sandbox should shadow the repo and keep writes isolated from the live repo until approval.
- V2 can add dedicated sandbox domain, separate DB, and customer-isolated runtime tiers if enterprise isolation needs demand it.
- The model/provider registry stays in the control plane and is consumed by the sandbox rather than duplicated there.

## Safety Rules

- No live-repo mutation without preview and confirm.
- No direct tool execution bypassing policy gates.
- No replay/report mode mutations.
- Sandbox mirror is the default writable surface.
- Enterprise deployments should assume RBAC, RLS, audit logging, and secret management are required before database-backed team workflows go live.
- Temporary bearer-token forwarding from the browser is acceptable for the current online build, but production hardening should converge on stable cookie/session exchange.

## Diff Review

Diff review is a required v1 control-plane surface.

- preview must show before/after context where possible
- patch validation must happen before confirm/apply
- review should expose truth score, risk level, and an explanation mode
- diff review should work against the sandbox mirror, not the live repo
- diff review should include summary chips for file count, line count, and binary hints when relevant

## BrewAssist v1 Criteria

BrewAssist is not v1 until it can:

- connect to GitHub, GitLab, Bitbucket, or local repos
- bind a repo to a sandbox mirror
- create a plan from user intent
- preview the diff before execution
- require confirmation for mutations
- report what changed and replay the run
- keep auth, tenant bootstrap, and repo/sandbox selection aligned so a signed-in user can reach the cockpit without manual recovery steps

## Cross References

- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`
- `brewdocs/reference/specifications/BrewAssist_Landing_And_Billing_Spec.md`
- `brewdocs/project/BrewAssist_Finite_Roadmap_S4_5_to_S5.md`
- `brewdocs/project/S4.10_MCP_DevOps_Cockpit_Blueprint.md`
- `brewdocs/project/S4.10_MCP_Tools_Overhaul_Roadmap.md`
- `brewdocs/reference/specifications/S4_xx_New_UI_Spec.md`
- `brew-agentic/brewdocs/overview/PRODUCT_OVERVIEW.md`
- `brew-agentic/brewdocs/specs/operator-workspace-v2-spec.md`
- `brew-agentic/brewdocs/manual/BREW_AGENTIC_TUI_MANUAL.md`
