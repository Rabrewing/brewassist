# BrewAssist Monetization and Team Capabilities Spec

Updated: 2026-04-13

## Goal

Define how BrewAssist makes money as an online provider while supporting hosted model usage, bring-your-own keys, and enterprise team workflows.

## Pricing Principle

BrewAssist is a paid product in every deployment mode.

## Pricing Modes

1. **Hosted BrewAssist**
   - Customer pays an application subscription.
   - Customer also pays usage-based model/provider charges for hosted keys.

2. **Bring-Your-Own Keys**
   - Customer still pays an application subscription.
   - Customer uses their own API keys for model usage.
   - BrewAssist may still charge a platform or orchestration fee.

3. **Enterprise Contract**
   - Subscription + seat/org pricing or annual contract.
   - Includes team controls, audit, support, and usage governance.

## Non-Negotiables

- The app itself has a base price.
- BYO keys do not make the application free.
- Hosted provider usage has separate consumption cost.
- Team and enterprise features should be priced above the base app subscription.

## Product Components

- typed agent fabric for intent, planning, policy, execution, reporting, replay, telemetry, and collaboration
- usage metering
- billing dashboard
- key management
- provider mode selection
- provider authentication and repo selection
- limits / quotas
- org and team management
- audit trail for usage and access
- team collaboration surfaces: chat, presence, reporting, session handoff
- screen-share launch / meeting entry points
- public landing and pricing surfaces that accurately describe the control-plane workflow

## Onboarding And Activation

Enterprise onboarding should be a guided setup path, not a handoff email.

- first-run activation for new customers
- org creation and workspace bootstrap
- provider connection and repo binding
- role assignment and permission review
- usage/billing preview before launch
- collaboration and reporting intro for teams
- research/web/toolbelt permission explanation

Onboarding should end with a successful preview-confirm-execute-report loop so the customer sees value immediately.

## Team Capabilities

- orgs, teams, roles, and permissions
- shared workspaces
- repo/project access policy
- provider-linked repo access and sandbox mirroring
- usage visibility per team/org
- admin billing controls
- support / operator roles
- collaborative review workflows and report snapshots

## Enterprise Security Baseline

Enterprise rollout should assume a database-backed control plane with explicit access control and audit.

- row-level security on all tenant-scoped tables
- role-based access control for org, repo, workspace, and billing actions
- immutable audit logs for approvals, access, and billing changes
- secret handling for provider keys and integration credentials
- encryption in transit and at rest
- SSO and optional SCIM provisioning for enterprise identity
- exportable reports for audit and compliance review
- Supabase-backed auth/session should be the first enterprise identity layer, replacing temporary headers before production
- current browser-based auth may forward the Supabase access token to protected API routes until server-side cookie exchange is hardened for production
- email magic link plus Google/GitHub can be allowed for self-serve sign-up, but enterprise should prefer org-managed SSO/OIDC/SAML with optional SCIM and domain restrictions
- public entry should link Terms, Privacy, Cookies, and Accessibility pages before sign-in
- AI usage terms and data collection disclosure should be visible before account creation or login
- enterprise onboarding should include accessibility and compliance review for regulated customers
- public support contact should be visible for compliance and privacy requests
- tenant membership lookup and auth state must be stable before billing/admin surfaces are treated as ready

## Toolbelt And Research Support

Enterprise and higher-trust workflows should keep research/web access explicit and governed.

- `webfetch` for direct web retrieval
- `websearch` where the mode permits it
- `capability.research.external` for structured research tasks
- `research_web` for the user-facing research surface
- NIMs research routes for deeper external research when enabled by mode

Research outputs should be folded back into BrewTruth, reports, and replay data.

## Current Build Notes

- Replay traces now persist through `sessions`, `runs`, and `run_events`.
- Collaboration notes now persist as `collab.message` events and surface in replay and the right rail.
- Billing implementation should build on this run/event model for usage visibility and audit-friendly plan administration.
- Current auth and tenant gating still need hardening before billing/admin workflows should be considered production-ready.

## Data Foundation (Later)

These objects are likely needed when the database layer is introduced:

Current state: this schema foundation now exists under `supabase/migrations/` and should be treated as active infrastructure, not a future placeholder.

- organizations
- memberships
- roles
- workspaces
- repositories
- repo connections
- sandbox bindings
- sessions
- runs
- run events
- audit logs
- usage meter records
- provider keys / secrets metadata
- policy rules and approvals

### Draft SQL Schema

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

### Policy Baseline

- Every tenant-scoped row must carry `org_id`.
- Every workspace-scoped row should also carry `workspace_id` or a workspace relation.
- Service roles can bypass RLS only for tightly scoped background jobs and must write audit logs.
- Raw provider secrets must never be returned to the app layer.
- Run events and audit logs should be append-only where possible.
- Compliance exports should read from audit logs, runs, and usage tables only.

## Questions To Resolve

- exact base subscription price
- hosted token/unit pricing
- BYO platform fee structure
- seat-based vs org-based enterprise pricing
- free trial and metering thresholds
- how local `brew-agentic` licensing interacts with online BrewAssist

## Cross References

- `brewdocs/project/BrewAssist_V1_Execution_Plan.md`
- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md`
- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`
- `brewdocs/reference/specifications/BrewAssist_Landing_And_Billing_Spec.md`
