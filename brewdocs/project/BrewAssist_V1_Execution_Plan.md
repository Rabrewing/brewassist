# BrewAssist V1 Execution Plan

**Created**: 2026-04-12

## Purpose

Single build plan for getting BrewAssist to v1 as a hybrid online control plane for `brew-agentic` local TUI.

## Source Of Truth

- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md`
- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`
- `brewdocs/project/BrewAssist_Finite_Roadmap_S4_5_to_S5.md`
- `brewdocs/reference/specifications/BrewAssist_Monetization_And_Team_Spec.md`
- `brew-agentic/brewdocs/specs/operator-workspace-v2-spec.md`
- `brew-agentic/brewdocs/overview/PRODUCT_OVERVIEW.md`

## Normalized Connection Model

- provider selection comes before repo selection
- authentication is provider-specific
- repo selection resolves to a sandbox mirror
- all reads, previews, and writes happen against the mirror unless explicitly blocked

## V1 Definition

BrewAssist is v1 when it can:

- connect to GitHub, GitLab, Bitbucket, or local repos
- bind the selected repo to a sandbox mirror
- capture intent and produce a plan
- preview diffs before mutation
- require confirmation before apply
- execute approved work safely
- report what changed
- replay prior runs

## Current Build Priorities

1. Hybrid workflow shell
2. Repo/provider context
3. Sandbox mirror and diff review
4. Rich online UI formatting
5. Left rail action surfaces
6. DevOps 8 live telemetry
7. Enterprise collaboration surfaces

## Execution Path

Build in this order so the product stays coherent:

1. Confirm provider/repo context is always attached to requests.
2. Keep the center pane as the canonical workflow surface.
3. Use the right rail for compact telemetry and team collaboration launch points.
4. Keep preview, confirm, execute, report, and replay distinct.
5. Harden tests and docs together before expanding enterprise depth.

## Phase 1: Workflow Shell

Goal: make the online center pane reflect `Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay`.

Files:

- `components/BrewCockpitCenter.tsx`
- `lib/hybridWorkflow.ts`
- `pages/api/brewassist.ts`

Acceptance:

- workflow strip visible in center pane
- current stage updates during send/stream/end/error
- replay entry point exists in the HUD

## Phase 2: Repo And Sandbox Context

Goal: make provider/root selection affect real file access and request routing.

Files:

- `contexts/RepoConnectionContext.tsx`
- `components/RepoProviderSelector.tsx`
- `pages/api/fs-tree.ts`
- `pages/api/fs-read.ts`
- `pages/api/edit-file.ts`
- `lib/enterpriseContext.ts`
- `lib/permissions.ts`

Acceptance:

- provider/root are sent with requests
- provider auth and repo selection are explicit in the flow
- selected repo binds to a sandbox mirror
- unsupported cross-repo access fails closed
- file tree and file reader respect selected repo context

## Phase 3: Sandbox Mirror And Diff Review

Goal: make sandboxed changes reviewable before apply.

Files:

- `lib/brewDiffEngine.ts`
- `lib/brewPatchEngine.ts`
- `lib/brewdocs/diff/render.ts`
- `lib/brewdocs/diff/validate.ts`
- `lib/brewdocs/apply/guard.ts`
- `components/CodeViewerModal.tsx`

Acceptance:

- diff preview UI exists
- patch validation blocks unsafe changes
- confirm gate is required before apply

## Phase 4: Live Right Rail

Goal: expose live DevOps 8 telemetry in the right pane.

Design rule:

- keep the right rail compact and icon-first
- the center pane remains the primary workspace
- detailed telemetry belongs in the right rail without stealing focus from the center
- collaboration support belongs here only as a compact launch surface, not a full screen-share workspace

Files:

- `contexts/DevOps8RuntimeContext.tsx`
- `components/right-rail/DevOps8SignalsPanel.tsx`
- `components/right-rail/CollabPanel.tsx`
- `components/WorkspaceSidebarRight.tsx`
- `lib/devops8/*`

Acceptance:

- right rail shows computed live signals
- ops tab reflects streaming, policy, memory, quality, and efficiency state
- right rail width remains intentionally tighter than the center workspace
- collab tab can surface team chat, presence, reporting, and screen-share launch state

## Phase 5: Left Rail Action Surfaces

Goal: make the left rail more than a guide placeholder.

Design rule:

- the left rail is a grouped action launcher and policy-aware helper surface
- show compact operator summary, then grouped MCP action cards, then a helper panel
- any guide/help content must support action selection, explanation, or preview
- do not add dead guide-only cards that cannot lead to a real MCP or workflow action
- keep the left rail compact; surface deeper help in an overlay or drawer

Files:

- `components/WorkspaceSidebarLeft.tsx`
- `components/ActionMenu.tsx`
- `lib/capabilities/registry.ts`
- `lib/toolbelt/handshake.ts`

Acceptance:

- left rail surfaces real MCP actions/help
- placeholder guide content is replaced with action-driven content
- action buttons map to policy-gated capabilities
- guide/help content points to real tasks, not static copy
- left rail feels like an enterprise operator pane, not a generic nav list

## Phase 6: Rich Text And Code Rendering

Goal: make the online chat feel like a modern product, not a raw log.

Files:

- `components/BrewCockpitCenter.tsx`
- `components/CodeViewerModal.tsx`
- `lib/ui/messageText.ts`
- `styles/*` (as needed)

Acceptance:

- markdown renders with rich formatting
- code fences get syntax highlighting
- file previews use the same rendering quality as chat output

## Phase 7: V1 Hardening

Goal: close gaps before calling the product v1.

Files:

- `__tests__/**/*`
- `brewdocs/project/S5_LOCK_CHECKLIST.md`
- `brewdocs/project/S4_LOCK_MANIFEST.md`

Acceptance:

- focused tests for workflow, provider context, right rail, and sandbox gating pass
- build and typecheck pass
- v1 criteria in the hybrid spec are fully met

## Phase 8: Monetization And Team Capabilities

Goal: make BrewAssist an online provider with controllable cost, usage metering, and team-aware features.

Questions to settle:

- bring-your-own API key vs hosted API vs hybrid
- usage tracking and billing model
- usage dashboard and limits
- team roles, shared workspaces, and org capabilities
- team chat, presence, screen-share handoff, and reporting surfaces
- how team specs map to the online cockpit and local TUI

Files likely involved later:

- `pages/api/*` usage and auth routes
- `contexts/*` provider/billing/team state
- `components/*` usage and billing surfaces
- `brewdocs/reference/specifications/*`

Acceptance:

- BrewAssist can operate as a provider without forcing all model cost onto the host
- team capabilities are explicit in the spec and UI model
- billing/usage monitoring can be observed and enforced

## Update Rule

When a phase changes, update this file first, then update the matching todo item and implementation files.
