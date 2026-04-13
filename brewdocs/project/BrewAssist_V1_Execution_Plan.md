# BrewAssist V1 Execution Plan

Updated: 2026-04-13

**Created**: 2026-04-12

## Purpose

Single build plan for getting BrewAssist to v1 as a hybrid online control plane for `brew-agentic` local TUI.

## Source Of Truth

- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md`
- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`
- `brewdocs/project/BrewAssist_Finite_Roadmap_S4_5_to_S5.md`
- `brewdocs/reference/specifications/BrewAssist_Monetization_And_Team_Spec.md`
- `brewdocs/reference/specifications/BrewAssist_Landing_And_Billing_Spec.md`
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

1. Auth and tenant hardening
2. Landing, pricing, and billing normalization
3. Real provider/repo connection
4. Sandbox mirror and diff review/apply
5. Production auth and enterprise identity hardening
6. Rich online UI completion
7. Extended enterprise collaboration

## Current Status Snapshot

- Public landing, legal/compliance pages, cookie consent, and auth gate are in place.
- Supabase enterprise schema, RLS/RBAC groundwork, org/workspace bootstrap, and tenant gating are in place.
- API routes now resolve the signed-in user from Supabase session identity and org membership; browser-originated bearer tokens are currently accepted until cookie exchange is fully hardened.
- Super-admin recovery currently routes through `brewmaster.rb@brewassist.app`, and bootstrap is idempotent for repeated login attempts.
- The right-rail files/sandbox surfaces now show selected org/workspace scope, but workspace selection does not yet drive a real repo binding or sandbox binding.
- Typed agent runtime is partially implemented and now persists replay traces to `sessions`, `runs`, and `run_events`.
- Right-rail collaboration surfaces now read persisted `collab.message` run events and can deep-link replay context.
- Current auth is still blocked by tenant lookup instability: `EnterpriseTenantGate` creates its own browser Supabase client and the `memberships` select policy appears recursive, which likely explains the current client-side Supabase 500s.

## Immediate Remaining Work

1. Fix tenant lookup and auth stability: remove duplicate browser Supabase clients, stop recursive membership policy evaluation, and make sign-in consistently reach the cockpit.
2. Normalize the new landing/pricing spec and mockups into public pages that describe the real control-plane workflow rather than generic AI messaging.
3. Implement pricing/billing surfaces and org plan visibility aligned to the normalized landing spec.
4. Replace the current provider/root selector with real provider auth, repo connect, and repo selection.
5. Bind the selected repo to a real sandbox mirror instead of only passing repo context headers.
6. Complete the online workflow after preview: confirm, apply, and full execution reporting still need true end-to-end execution.
7. Harden production auth delivery: server-side cookie exchange, SMTP/email delivery, enterprise SSO/OIDC/SAML, and domain/admin recovery flow.

## Execution Path

Build in this order so the product stays coherent:

1. Restore stable auth and tenant gating before expanding the signed-in product.
2. Normalize public product truth before implementing landing/pricing visuals.
3. Keep the center pane as the canonical workflow surface.
4. Use the right rail for compact telemetry and team collaboration launch points.
5. Keep preview, confirm, execute, report, and replay distinct.
6. Harden tests and docs together before expanding enterprise depth.

## Phase 0: Onboarding And Setup

Goal: get a new user or enterprise tenant to a safe first successful run.

Files:

- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md`
- `brewdocs/reference/specifications/BrewAssist_Monetization_And_Team_Spec.md`
- `components/RepoProviderSelector.tsx`
- `components/BrewCockpitCenter.tsx`
- `components/WorkspaceSidebarLeft.tsx`
- `components/WorkspaceSidebarRight.tsx`

Acceptance:

- first-run flow explains the workflow and safety model
- provider selection and repo binding are guided
- org/workspace/role setup is clear for enterprise users
- diff review and confirm gates are introduced during onboarding
- the user can complete a first safe preview/execute/report loop

## Phase 0b: Public Entry And Legal

Goal: give brewassist.app a clear landing experience before the cockpit loads.

Files:

- `pages/index.tsx`
- `components/PublicLandingPage.tsx`
- `components/CookieConsentBar.tsx`
- `pages/terms.tsx`
- `pages/privacy.tsx`
- `pages/cookies.tsx`
- `pages/accessibility.tsx`
- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`

Acceptance:

- signed-out users see the landing page instead of the cockpit
- cookie consent is explicit and stored locally
- terms and privacy routes exist and are linked from the public entry
- cookies and accessibility routes exist and are linked from the public entry
- AI usage terms and data-collection language are visible before sign-in
- contact email is surfaced from the public entry and legal pages
- the landing page explains the product in enterprise and power-user terms
- the cockpit remains the post-auth workspace, not the public default
- email auth must reach the cockpit with a stable tenant bootstrap path for the super-admin recovery account

## Agent Topology

BrewAssist should use a small typed agent fabric, not a single general agent.

### Core Agents

1. `intent_agent` - normalizes user input into a structured request.
2. `planner_agent` - breaks intent into steps, risks, and previewable actions.
3. `policy_agent` - gates repo scope, permissions, and dangerous actions.
4. `executor_agent` - performs approved work against the sandbox mirror.
5. `reporter_agent` - emits run summaries, diffs, and audit-ready reports.
6. `replay_agent` - reconstructs prior runs and supports post-run review.
7. `telemetry_agent` - feeds DevOps 8 signals from runtime events.
8. `collab_agent` - tracks chat, presence, handoff, and session coordination.

### Communication Model

- Every agent reads and writes the same typed session/run envelope.
- Agents communicate through events, not hidden side effects.
- The center workflow owns stage transitions.
- The left rail exposes policy-aware actions.
- The right rail stays compact for telemetry and team coordination.

### Required Event Types

- `intent.captured`
- `plan.created`
- `preview.ready`
- `confirm.requested`
- `execute.started`
- `execute.completed`
- `report.emitted`
- `replay.available`
- `telemetry.updated`
- `collab.message`

### Message Schema

Every agent event should carry the same core envelope.

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

Minimal payload shape by stage:

- Intent: user text, repo context, desired outcome
- Plan: steps, risks, preview targets, confirm requirements
- Preview: diff summary, files touched, policy notes
- Confirm: approval state, blockers, required acknowledgements
- Execute: sandbox writes, command results, retries, timestamps
- Report: changed files, outcome summary, truth/report metadata
- Replay: prior run references, immutable snapshot data
- Telemetry: DevOps 8 scores, latency, safety, scope, efficiency
- Collab: chat entries, presence, handoff state, screen-share markers

### Agent To Panel Mapping

- `intent_agent` -> center prompt area
- `planner_agent` -> center workflow strip and plan preview region
- `policy_agent` -> left rail actions, confirm gate, danger badges
- `executor_agent` -> center execution stream and sandbox write actions
- `reporter_agent` -> center report state and right-rail reporting cues
- `replay_agent` -> center replay controls and history entry points
- `telemetry_agent` -> right rail DevOps 8 ops tab
- `collab_agent` -> right rail collab tab and future expanded team view

### Current Agent Status

- `intent_agent`, `planner_agent`, `policy_agent`, `executor_agent`, `reporter_agent`, `replay_agent`, `telemetry_agent`, and `collab_agent` now exist in the shared typed runtime.
- Replay traces now persist through `sessions`, `runs`, and `run_events`.
- Collab notes now persist as `collab.message` events and appear in the right rail and replay trace.
- The fabric is still partial because provider/repo binding, diff/apply execution, and human-authored collab flows are not complete yet.

### Execution Rule

- One agent may own a stage at a time.
- Policy must resolve before execution.
- Replay and report are read-only stages.
- Team collaboration must not bypass policy or preview.

## Implementation Checklist

1. Define shared TypeScript types for session, run, agent event, and stage state.
2. Route `intent_agent` and `planner_agent` outputs into the center workflow state machine.
3. Feed policy decisions into the left rail and confirmation gating.
4. Send executor events into the sandbox mirror and center stream.
5. Emit reporter events for diff summary, report, and audit data.
6. Persist replay snapshots and expose them from the center and history surfaces.
7. Keep telemetry updates flowing into DevOps 8 runtime state.
8. Keep collaboration metadata available in the right rail and future team surfaces.
9. Add tests for event shape, stage transitions, and panel routing.
10. Harden docs and types before extending the agent mesh further.

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
- diff viewer shows before/after context, patch summary, and risk level
- truth score and review notes are visible before apply
- "explain this diff" mode is available in the review surface
- diff artifacts show summary chips for file count and line counts
- assistant prompt bar can be prefilled for diff explanation or patch drafting

## Phase 3b: Composer Helpers

Goal: make the center prompt approachable for both first-time users and power users.

Files:

- `components/ActionMenu.tsx`
- `components/SlashCommandPalette.tsx`
- `components/BrewCockpitCenter.tsx`

Acceptance:

- the prompt placeholder advertises `/` and `/init`
- the `+` menu is visually distinct, compact, and polished
- helper actions are clearly labeled as functional vs stubbed
- the slash palette supports quick insert/run for common commands

## Toolbelt And Research

Goal: keep research and web calls explicit so the right capability is used for the right job.

Allowed research paths:

- `webfetch` for direct web retrieval
- `websearch` when available in the active mode profile
- `capability.research.external` for structured research requests
- `research_web` for the operator-facing research capability surface
- `nims` / research route for deeper research workflows when the mode allows it

Rules:

- research tool use must be explicit in the request context
- web calls should be available through the toolbelt, not hidden in app logic
- research outputs should feed BrewTruth and report/replay metadata

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

## Phase 9: Enterprise Security And Data Foundation

Goal: prepare BrewAssist for enterprise deployment with database-backed identity, access control, audit, and compliance support.

Questions to settle:

- what database tables are needed for orgs, memberships, workspaces, sessions, runs, events, audit logs, usage, and keys
- how row-level security policies map to org/repo/workspace boundaries
- which roles need RBAC and approval authority
- what audit and retention policies are required for enterprise use
- which compliance controls are in scope first (eg. SSO, SCIM, audit export, encryption, secret rotation)

Implementation notes:

- no production database tables are required yet for the current v1 shell
- when the data layer lands, every tenant-scoped table should be protected by RLS
- RBAC should be enforced in both the API and the database policies
- compliance features should follow after the core workflow, telemetry, and team surfaces are stable
- use Supabase SQL migrations as the first implementation path; add ORM tooling later only if query complexity demands it
- never commit live Supabase keys; keep them in local env and server secret stores only
- after linking the project, apply a second migration for default roles and indexes before wiring runtime data writes

### Supabase Wiring

Files:

- `lib/supabase/browser.ts`
- `lib/supabase/server.ts`
- `lib/enterprise/bootstrap.ts`
- `pages/api/enterprise/bootstrap-org.ts`

Flow:

- browser code uses the public anon key only
- server routes use the service role key only
- org bootstrap creates the org, seeds default roles, adds the creator membership, and optionally creates a workspace
- auth/session wiring should replace the temporary user-id header before production rollout
- signed-in users land on an org/workspace gate before the cockpit so tenant scope is always explicit

## Phase 10: Auth And Permission Wiring

Goal: replace temporary headers with real Supabase session auth and enforce permissions end to end.

Files:

- `lib/supabase/browser.ts`
- `lib/supabase/server.ts`
- `pages/api/enterprise/bootstrap-org.ts`
- `pages/api/brewassist.ts`
- `pages/api/fs-tree.ts`
- `pages/api/fs-read.ts`
- `pages/api/edit-file.ts`
- `components/EnterpriseTenantGate.tsx`
- `contexts/EnterpriseSelectionContext.tsx`
- `lib/enterpriseContext.ts`
- `lib/permissions.ts`
- `lib/uiGates.ts`
- `contexts/RepoConnectionContext.tsx`

Acceptance:

- browser auth uses the Supabase anon client and real session state
- server routes resolve the signed-in user from Supabase auth/session, not temporary headers
- org bootstrap requires a real authenticated user and writes the membership + role state
- org role and write permission should be resolved from Supabase membership when org scope is present
- permission gates map to database-backed org roles and workspace scope
- admin/operator/customer capabilities are enforced consistently in UI and API
- audit logs capture approval and access changes once the auth layer is active

### Data Model And Policy Matrix

Planned tenant-scoped objects:

- `organizations` - one row per customer org; RLS by `org_id`
- `memberships` - user to org/team membership; RLS by `org_id` and membership role
- `roles` - named permission sets; write-restricted to admins/owners
- `workspaces` - project surfaces bound to an org; RLS by `org_id`
- `repositories` - repo metadata and provider mapping; RLS by `org_id`
- `repo_connections` - provider auth and repo binding records; RLS by `org_id`
- `sandbox_bindings` - repo to sandbox mirror bindings; RLS by `org_id`
- `sessions` - user control-plane sessions; RLS by `org_id` and session ownership
- `runs` - intent/plan/execute/report records; RLS by `org_id` and workspace access
- `run_events` - immutable event log for replay and audit; append-only, RLS by `org_id`
- `audit_logs` - approvals, access, billing, and policy actions; append-only, admin-visible
- `usage_meter_records` - billable usage and quota signals; admin/billing-visible
- `provider_keys` - secret metadata only, never raw secret values; locked down by role
- `policy_rules` - org/workspace policy configuration; admin-owned
- `approvals` - confirm/deny records and signoff history; RLS by org and approver scope

### Draft SQL Schema

Initial shape only, not implementation code yet:

```sql
organizations(id, name, slug, plan, created_at)
memberships(id, org_id, user_id, role_id, status, created_at)
roles(id, org_id, name, permissions, created_at)
workspaces(id, org_id, name, repo_id, created_by, created_at)
repositories(id, org_id, provider, external_id, full_name, created_at)
repo_connections(id, org_id, repo_id, provider_account_id, auth_state, created_at)
sandbox_bindings(id, org_id, repo_id, sandbox_root, status, created_at)
sessions(id, org_id, user_id, workspace_id, current_stage, created_at)
runs(id, org_id, session_id, workspace_id, status, truth_score, created_at)
run_events(id, org_id, run_id, event_type, payload, created_at)
audit_logs(id, org_id, actor_id, action, target_type, target_id, payload, created_at)
usage_meter_records(id, org_id, run_id, metric_name, metric_value, billed_at)
provider_keys(id, org_id, provider, key_ref, status, created_at)
policy_rules(id, org_id, workspace_id, rule_key, rule_value, created_at)
approvals(id, org_id, run_id, approver_id, decision, reason, created_at)
```

### RLS / RBAC Matrix

| Table                 | Owner/Admin | Operator            | Collaborator  | Customer     | Notes                        |
| --------------------- | ----------- | ------------------- | ------------- | ------------ | ---------------------------- |
| `organizations`       | read/write  | read                | read          | no access    | org admin only               |
| `memberships`         | read/write  | read                | no access     | no access    | admin-managed membership     |
| `roles`               | read/write  | read                | no access     | no access    | permission sets              |
| `workspaces`          | read/write  | read/write assigned | read          | read limited | scoped by org and workspace  |
| `repositories`        | read/write  | read                | read limited  | read limited | provider metadata            |
| `repo_connections`    | read/write  | read                | no access     | no access    | secrets/provisioning surface |
| `sandbox_bindings`    | read/write  | read                | read limited  | no access    | mirror binding control       |
| `sessions`            | read/write  | read own            | read own      | read own     | ownership + org scope        |
| `runs`                | read/write  | read/write assigned | read          | read limited | confirm/execute/report trail |
| `run_events`          | append/read | read assigned       | read assigned | read limited | immutable audit/replay       |
| `audit_logs`          | read/write  | read limited        | no access     | no access    | security + compliance log    |
| `usage_meter_records` | read/write  | read limited        | no access     | read limited | billing visibility only      |
| `provider_keys`       | read/write  | no access           | no access     | no access    | secret metadata only         |
| `policy_rules`        | read/write  | read limited        | no access     | no access    | policy admin surface         |
| `approvals`           | read/write  | read/write assigned | read assigned | read limited | confirm gate history         |

### Policy Rules

- Every tenant-scoped row must carry `org_id`.
- Every workspace-scoped row should also carry `workspace_id` or a workspace relation.
- Service roles can bypass RLS only for tightly scoped background jobs and must write audit logs.
- Raw provider secrets must never be returned to the app layer.
- Run events and audit logs should be append-only where possible.
- Compliance exports should read from audit logs, runs, and usage tables only.

Policy baseline:

- owners/admins can manage org, billing, repo, and policy records
- operators can approve and execute within assigned workspace scope
- collaborators can read shared workspace state and contribute notes
- customers can only see what their org/workspace scope allows
- service integrations should use least-privilege service roles with audit trails

## Update Rule

When a phase changes, update this file first, then update the matching todo item and implementation files.
