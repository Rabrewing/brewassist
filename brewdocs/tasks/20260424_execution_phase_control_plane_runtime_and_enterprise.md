# BrewAssist Execution Phase: Control Plane, Runtime, And Enterprise Hardening

**Date:** 2026-04-24  
**Updated:** 2026-04-24 07:44 EDT  
**Status:** Active execution package

## Working Principle

BrewAssist should now move as one coordinated execution phase instead of isolated feature requests.

The right sequencing is:

1. finish the real control-plane workflow
2. harden identity, admin, and trust
3. modernize models, runtime orchestration, and tool use
4. tighten presentation and verification around all of the above

## Recommended User Flow After Auth

For a brand-new hosted user, the better default path is:

1. sign in
2. create or join org
3. accept core legal and policy acknowledgements
4. choose workspace setup mode
5. connect repo/provider
6. complete the `InitWizard` readiness flow
7. land in console overview
8. surface billing only when the user reaches a gated capability or explicitly enters plan selection

Why not force billing immediately:

- teams often need to inspect product trust, workflow, and org setup before payment
- enterprise admins usually want workspace, policy, and identity clarity before plan commitment
- BrewAssist should feel governed first, monetized second

Recommended gating:

- require legal/policy acceptance before first execution-sensitive action
- require stronger auth and billing before managed-provider usage or higher-tier capabilities
- keep plan upgrade prompts contextual instead of front-loading them for every new user

## Phase Tracks

### Track 1: Onboarding, Identity, And Trust

- add policy acknowledgement checkpoint before execution-sensitive stages
- define whether `2FA` is:
  - optional for all users
  - required for owners/admins
  - required for enterprise workspaces
- design enterprise auth progression:
  - email magic link baseline
  - TOTP / second factor
  - SAML / OIDC SSO
  - SCIM later
- add Trust Center and security review links directly into onboarding and billing decision points

### Track 2: Admin And Permissions

- build a true admin surface in console
- support roles like:
  - owner
  - admin
  - operator
  - reviewer
  - viewer / business stakeholder
- restrict capabilities by role:
  - repo connect
  - provider management
  - billing access
  - approval / confirm
  - execution
  - replay export

### Track 3: Runtime And Workflow Completion

- finish diff / confirm / apply loop so BrewAssist actually writes to the intended sandbox/repo surfaces
- add `--resume brewassist <session-id>` style continuity contract for local and hosted pickup
- ensure replay/session IDs map cleanly between online and local workflows
- continue DevOps 8 right-rail enrichment so runtime, replay, sandbox, and file state are genuinely useful

### Track 4: Provider, Model, And Tooling Upgrade

- refresh provider roster and default models to current supported releases
- add hosted `Codex / ChatGPT account connect` planning alongside Brew Agentic-style runtime linking
- verify BrewAssist tool-call surfaces and routing contracts are explicit, testable, and policy-gated
- audit `HRM`, multi-tier agent communication, and staged execution lanes for actual performance contribution rather than assumed complexity

### Track 5: Billing And Console Truth

- finish billing console truth from active subscription rows
- add invoice and subscription detail surfaces
- support plan changes, cancel, and downgrade paths
- make billing and entitlement transitions explicit in console and hosted APIs
- keep V1 billing `portal-first` for billing administration while BrewAssist
  console remains the primary billing visibility and state surface

## Immediate Build Order

### Phase A

- console shell/page cleanup
- billing truth from subscriptions
- control-plane summary fetch consolidation and cache/revalidation tuning
- onboarding policy checkpoint design
- admin/RBAC information architecture

### Phase B

- diff/confirm/apply completion
- runtime/session resume
- DevOps 8 signal depth
- enterprise auth hardening and second-factor policy

### Phase C

- provider/model refresh
- hosted Codex account-connect design
- tool-call audit and explicit tool execution surfaces
- HRM and multi-tier agent verification

## Todo Capture From This Session

- console search placement may move beside the tab strip later if it gives the top frame better balance
- console data layer is currently chatty in dev; reduce repeated summary calls, consider endpoint consolidation, and tighten cache/revalidation behavior once the current billing/admin/onboarding foundations are stable
- onboarding should not jump straight to billing after auth; it should establish org, policy, workspace, and readiness first
- add policy review and acknowledgement surfaces before first sensitive usage
- add admin-only permissions console
- add second-factor / enterprise auth policy
- design hosted Codex account connect flow
- refresh model inventory and provider defaults
- audit tool calls, HRM, and multi-agent communication
- add resume/session recovery contract
- keep verifying that BrewAssist actually performs file and repo work it claims to support
