# BrewAssist Hybrid Control Plane Spec

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
3. User selects a repo or workspace scope.
4. BrewAssist binds that repo to a sandbox mirror.
5. BrewAssist uses the mirror for reads, previews, and writes.
6. Unsupported cross-repo access fails closed.

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
- **Local TUI**
  - execute approved plans
  - run offline when needed
  - expose operator keybinds and terminal-first telemetry

## Safety Rules

- No live-repo mutation without preview and confirm.
- No direct tool execution bypassing policy gates.
- No replay/report mode mutations.
- Sandbox mirror is the default writable surface.

## BrewAssist v1 Criteria

BrewAssist is not v1 until it can:

- connect to GitHub, GitLab, Bitbucket, or local repos
- bind a repo to a sandbox mirror
- create a plan from user intent
- preview the diff before execution
- require confirmation for mutations
- report what changed and replay the run

## Cross References

- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`
- `brewdocs/project/BrewAssist_Finite_Roadmap_S4_5_to_S5.md`
- `brewdocs/project/S4.10_MCP_DevOps_Cockpit_Blueprint.md`
- `brewdocs/project/S4.10_MCP_Tools_Overhaul_Roadmap.md`
- `brewdocs/reference/specifications/S4_xx_New_UI_Spec.md`
- `brew-agentic/brewdocs/overview/PRODUCT_OVERVIEW.md`
- `brew-agentic/brewdocs/specs/operator-workspace-v2-spec.md`
- `brew-agentic/brewdocs/manual/BREW_AGENTIC_TUI_MANUAL.md`
