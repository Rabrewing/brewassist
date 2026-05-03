# BrewAssist Execution Phase: Control Plane, Runtime, And Enterprise Hardening

**Date:** 2026-04-24  
**Updated:** 2026-04-29 10:31 EDT  
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
- require versioned acceptance for Terms, Privacy, Acceptable Use, and AI workflow acknowledgement before hosted execution-sensitive usage
- foundation now implemented with persisted org/user acceptance records and a hosted checkpoint inside `EnterpriseTenantGate`; next step is admin visibility plus document-version roll-forward
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
- publish and maintain the non-blocking trust set:
  Cookies, Accessibility, AI Transparency, Security / Trust, Status, Support
- support/admin session help should use an explicit audited assist flow:
  read, assist, and admin tiers with scoped session access, visible operator identity, no silent impersonation, and a customer-facing approval portal for support grants
- AI may draft support triage and escalation summaries, but a human operator must own the support action
- the console support surface now has the first audited support-session request lane backed by `audit_logs`; next step is explicit client-granted join/leave semantics if we decide to expose live assist sessions
- the console support surface now includes request / grant / join / leave / revoke actions, a customer-facing approval portal for grants, and active assists should derive from the latest support audit trail entries
- recommended V1 support stack is BrewAssist-native on Supabase + Resend; keep BrewAssist as the consent and audit authority, and use outbound email as the notification wrapper instead of a third-party helpdesk
- support email should use `supportdesk@brewassist.app` as the public sender address, with inbound replies forwarded through ImprovMX or similar into a real inbox that the team monitors
- support cases should be first-class records in the console support surface, with status, subject, owner, approval state, and audit history

### Track 2: Admin And Permissions

- build a true admin surface in console
- first live admin surface now exists in `/console/settings` for membership and role visibility plus basic owner/admin role reassignment
- capability-aware gating now exists for billing and identity administration, with account session summaries carrying resolved live permissions from the org role catalog
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

### Track 2.5: Collaboration Model

- keep BrewAssist-native collaboration scoped to execution truth:
  - run threads
  - review notes
  - replay annotations
  - approval requests
  - incident/blocker state
  - handoff summaries
- integrate external communication systems instead of rebuilding them:
  - Slack first
  - Teams later
  - external meeting/video providers for screenshare and calls
- avoid building generic chat rooms or a native video stack before core workflow completion and RBAC are done

### Track 3: Runtime And Workflow Completion

- finish diff / confirm / apply loop so BrewAssist actually writes to the intended sandbox/repo surfaces
- add explicit execution permission choices in the confirm/apply flow:
  - `Apply`
  - `Always apply`
  - `Reject with comment`
- make the diff preview itself block-native in the cockpit so preview/confirm/apply reads like one coherent control-plane flow instead of a modal bolted onto chat
- add code syntax highlighting in the diff/review surface, with clear error/warning coloring and LSP-backed validation where appropriate so code compliance issues are visible before apply
- add a real LSP integration path for BrewAssist code review and sandbox validation so the app can surface language-aware diagnostics instead of relying only on static syntax checks
- sandbox diff review now has the first tri-state UI and static syntax diagnostics; next step is to deepen that into richer policy-state persistence and command-center integration
- sandbox decision choices and rejection comments now persist into the session trail in both the modal and the dedicated sandbox workspace; keep that trail wired into replay and command-center summaries as the next pass
- `/console/sandbox` now exists as a dedicated larger workspace route and should reflect the active repo mirror plus repo-shadow state instead of a static scaffold
- the sandbox workspace now also exposes live file preview from the mirror tree so the user can inspect connected repo content directly inside BrewAssist
- the sandbox workspace now also exposes a remote-repo diff/apply review block so preview, confirm, and apply can happen from the larger execution surface instead of only the modal
- local repo selection should no longer rely on a short toast; replace it with a Brew Agentic local-runtime modal that can explain the install path and provide a copyable setup command for the agentic CLI
- add `--resume brewassist <session-id>` style continuity contract for local and hosted pickup
- first hosted continuity surface now exists via `/api/sessions/summary` and `/console/overview`; next step is turning recent session visibility into explicit resume/reopen actions
- explicit hosted resume handoff now exists from `/console/overview` into replay using `resumeSessionId` / `resumeRunId`
- hosted resume now rehydrates command-center state from persisted workflow events instead of only opening replay
- hosted resume should stay in-app first: `/exit` marks the session resumable, `/resume` opens a recent-session picker or deep link, and the UI restores the chosen session into the command center instead of forcing copy/paste of a session id
- hosted resume now has a server-side restore lookup so the cockpit can rehydrate the latest run metadata before falling back to summary-only session recovery
- hosted resume now includes a richer restore context derived from the latest run events, so the command center can surface the last meaningful workflow state before the replay trace finishes loading
- local Brew Agentic should keep the CLI path: `brew-agentic --resume <session-id>` reopens the workspace when the snapshot still has workspace state, even if the stored frame drifted idle
- the hosted `/resume` picker should surface recent sessions with title, timestamp, workspace, stage, and a direct reopen link back into the command center
- ensure replay/session IDs map cleanly between online and local workflows
- returning-user session policy is now implemented in the browser auth layer with a 7-day warm window and 12-hour idle freshness; step-up auth for sensitive actions remains the next hardening layer
- continue DevOps 8 right-rail enrichment so runtime, replay, sandbox, and file state are genuinely useful
- add a mobile/tablet responsive shell pass so the public routes and cockpit collapse cleanly instead of only reading well on desktop; keep the cockpit usable when the side rails have to stack or hide
- continue public-route responsive polish across the most important pages (`/`, `/pricing`, `/connect`, `/book-demo`) so the nav, CTA rows, and comparison content all remain readable on small screens
- make execution/report/replay summaries more native and informative:
  surface detailed, human-readable execution summaries in the app the same way the assistant explains its own work, rather than collapsing important outcomes into terse log fragments
- apply the same native execution-summary standard to Brew Agentic as a dual-spec requirement so both repos present detailed run outcomes in a human-readable way
- establish a shared, model-agnostic response contract so BrewAssist and Brew Agentic normalize final assistant output into the same native summary structure even when the underlying model tone varies
- apply the shared response contract to both admin and customer-facing surfaces so execution and support handoffs render the same native summary shape in the cockpit and approval/support views
- surface BrewAssist as an online intelligent TUI in the public frontend and cockpit, with BrewLast memory, HRM visibility, and replay-ready state treated as product truth rather than hidden implementation detail

### Track 4: Provider, Model, And Tooling Upgrade

- refresh provider roster and default models to current supported releases
- add hosted `Codex / ChatGPT account connect` planning alongside Brew Agentic-style runtime linking; BrewAssist now has a `/connect` entry point that separates browser, headless, and API/BYOK paths, but the hosted customer browser-OAuth lane still needs a supported OpenAI flow before it can be treated as production-ready
- 2026-04-28 update: the hosted providers console now has a first-pass encrypted BYOK key-management surface; the remaining work is runtime key resolution, validation, and any provider-specific connect handoff that should be exposed after the current pass stabilizes
- 2026-04-28 update: runtime key resolution now prefers hosted keys for normal org users, falls back to env-managed keys when no hosted secret exists, and leaves the super-admin recovery account on the original env-key path
- 2026-04-28 monetization note: managed provider usage and BYOK both remain billable product paths; add usage metering and platform-fee handling before expanding the provider roster again
- 2026-04-29 update: provider usage metering now records call and character counts, and the console/providers surface exposes those totals so managed vs hosted/BYOK usage is visible instead of hidden in raw database rows
- 2026-04-29 update: billing now surfaces the same provider-usage rollup so spend review can see managed and hosted/BYOK consumption alongside the subscription truth
- 2026-04-29 update: billing now also shows a spend-exposure card that combines platform fee, managed spend, and intelligence spend into one visible total
- 2026-04-29 update: billing now includes a chargeback breakdown that splits usage by auth mode and key source so managed vs BYOK and hosted vs env paths are visible in one review surface
- 2026-04-29 update: usage records now carry a lane dimension (`executor`, `planner`, `reviewer`, `memory`, `research`) so BrewPM review work can be tracked separately from executor/provider usage and surfaced in billing/export
- 2026-04-29 update: billing now exposes a usage CSV export for org-scoped usage-meter records, and the sandbox provider catalog now surfaces the broader current model sets for the providers already wired in the runtime
- 2026-04-29 update: the usage export now accepts a billing-cycle date window, the billing page exports the current cycle by default, and the usage-logs page links back into that export path
- 2026-04-29 update: the usage-logs page now exports the current cycle directly when an org is selected, and the provider matrix copy was normalized away from stale Anthropic wording
- 2026-04-29 update: agent roles are now normalized as planner, executor, reviewer, memory, and research, with BrewAssist and Brew Agentic sharing the same visible contract instead of a vague multi-agent swarm
- 2026-04-29 update: the shared agent role model is now a stabilization item with a draft implementation brief; carry that brief into the Brew Agentic session before adding any new agent types or communication layers
- 2026-04-30 update: BrewAssist still needs the Brew Agentic-style agent audit pass translated into its own runtime/UX contract so built-in agent wiring is visible and the remaining gap around generic recursive toolcall auto-execution stays explicit
- 2026-04-30 update: BrewAssist and Brew Agentic should share the same core agent contract and apply-result semantics, but their UI shells may differ; BrewAssist should expose a hosted agent audit card that makes the built-in stage wiring visible while the recursive toolcall gap remains a tracked follow-on
- 2026-04-29 update: BrewPM is now the named reviewer/PM source-of-truth concept for execution closeouts; use it as the human-readable approval lane that validates closeout reports against the spec, diff, and tests before a phase is treated as greenlit
- 2026-04-29 update: BrewPM should default to `openai:gpt-5.4-pro` with `gpt-5.4` as the immediate fallback; keep the visible role stable even if the backing model changes later
- 2026-04-29 update: the first BrewPM frontend pass should render as a native summary card in the cockpit, with replay/history mirroring the same reviewer lane once run artifacts are available
- 2026-04-29 update: BrewPM lane visibility is now surfaced directly in the cockpit summary card and replay history cards so the reviewer lane reads as a first-class product role
- 2026-04-29 update: BrewPM should also act as the planning lead for new repos; onboarding must capture whether the workspace is bootstrap/new-repo or existing-repo so the UI can route into review vs plan mode correctly
- 2026-04-29 update: onboarding now emits an explicit BrewPM branch (`planner` for bootstrap/new repos, `reviewer` for existing repos) so the cockpit can choose the first prompt and summary lane without inferring a third interpretation later
- 2026-04-29 update: returning-user continuity still needs a dedicated pass so a previously signed-in user lands back inside BrewAssist instead of being routed through the public landing page again after session restore
- 2026-04-30 update: returning-user continuity now keeps a recent authenticated-user hint and holds the public shell in a restore state before falling back to landing, so returning users are less likely to bounce through the public surface mid-session
- 2026-04-30 update: returning-user continuity now also remembers the last internal console route and restores a signed-in user back to that route when they return through `/`, so session restore keeps the last cockpit context instead of only preserving the landing-page avoidance hint
- 2026-04-29 update: BrewAssist now runs the BrewPM execution transaction automatically at closeout time, invoking the chosen model, returning a structured verdict/corrections payload, persisting it on the run record, and mirroring it into replay and collab surfaces; Brew Agentic still needs the mirrored transaction path
- 2026-04-29 update: BrewAssist now exposes a visible BUILD / PLAN workflow toggle in the cockpit and `/help` reflects that split so onboarding can route existing repos into build/review flow while bootstrap repos can route into planning
- 2026-04-29 update: benchmark DeepSeek-R1 against the current BrewPM baseline on the same closeout artifacts before freezing any new PM-model default
- 2026-04-29 update: replay-history payloads and the right-rail collab summary now carry the reviewer lane as well so every run summary surface stays consistent with BrewPM
- 2026-04-29 update: BrewPM and executor models must share a structured closeout status contract (`ready_for_review`, `needs_changes`, `blocked`, `complete`, `complete_not_committed`) so the reviewer lane can validate the delivery state without guessing from prose
- 2026-04-29 update: persist the closeout status on the run record itself so replay, overview, and BrewPM can read one durable field, and mirror the same field in Brew Agentic before adding any new reviewer logic
- 2026-04-30 update: sandbox confirm/apply decisions and rejection comments now persist into the session trail and replay summary so the operator can inspect the exact decision path alongside BrewPM review output
- 2026-04-30 update: successful and failed sandbox apply actions now emit a durable `apply.completed` trail event and the server route rejects malformed execution choices before any git write runs
- 2026-04-30 update: Book Demo is a sales-led walkthrough path that should focus on hosted control-plane truth, Brew Agentic, BrewPM planner/reviewer behavior, sandbox/replay, billing, support, and a clear live-vs-roadmap boundary
- 2026-04-30 update: Book Demo now has a dedicated spec; keep the walkthrough centered on hosted control plane, BrewPM plan/review flow, Brew Agentic local runtime, sandbox/replay, billing, support, and explicit live-vs-roadmap boundaries instead of turning it into a generic contact page
- 2026-04-30 update: the live `/book-demo` route now mirrors that spec with clear audience, what-we-show, what-we-do-not-overstate, and agenda framing so the public page reads like a real enterprise walkthrough request instead of a placeholder form
- 2026-04-30 update: public-page mobile polish tightened the landing hero, features, pricing, connect, and demo routes so the narrow-screen layouts keep their hierarchy instead of collapsing into cramped desktop copy
- spec and design a real hosted BYOK provider-key management surface for BrewAssist console/providers; Brew Agentic already has local `/connect <provider> api-key` capture, but the hosted product now needs runtime key resolution, validation, and rotate/revoke polish before we treat the control plane as complete
- verify BrewAssist tool-call surfaces and routing contracts are explicit, testable, and policy-gated
- audit `HRM`, multi-tier agent communication, and staged execution lanes for actual performance contribution rather than assumed complexity
- keep maintenance and model refresh recommendation-first in V1:
  surface AI recommendations for lint, dependency drift, security posture, and model updates, but require human review before any auto-fix or rollout
- model refresh should follow a defined checklist:
  inventory defaults, review provider release notes, test representative prompts, compare replay/tool-call behavior, confirm policy/data handling, capture approval, and document rollback target before promotion

### Track 5: Billing And Console Truth

- finish billing console truth from active subscription rows
- add invoice and subscription detail surfaces
- support plan changes, cancel, and downgrade paths
- make billing and entitlement transitions explicit in console and hosted APIs
- keep V1 billing `portal-first` for billing administration while BrewAssist
  console remains the primary billing visibility and state surface
- before Vercel promotion, run the go-live checklist and verify the console shell, auth callbacks, Stripe, and Brew Agentic smoke path against the deployed origin:
  - `brewdocs/console/brewassist-vercel-go-live-checklist-2026-04-28.md`

## Immediate Build Order

### Phase A

- console shell/page cleanup
- top app nav should use a clear `Console` entry point instead of `Dashboard`, with `/console/overview` as the obvious post-onboarding destination and `/console/settings` / `/docs` visible from the same top bar
- public-site overhaul against `brewdocs/mockups/new-landing-page.png` and the newer mockup set, replacing the current scaffolded landing/pricing treatment with a fuller product-site architecture
- docs/features/security public tabs should use `brewdocs/mockups/docs-page.png`, `brewdocs/mockups/features-page.png`, and `brewdocs/mockups/frontend-security-page.png` as the next layout anchors once supporting imagery is ready
- the public `/status` page should be built before V1 launch as a real trust surface with platform, console, runtime-link, support, billing, and incident visibility; it should not remain a fake uptime dashboard or a dead footer link
- remove public free-tier language and normalize the website to the real monetization model: trial/demo entry, paid platform plans, Enterprise sales flow, and BYOK that still pays BrewAssist platform fees
- public pricing should now normalize to `Starter / Pro / Team / Enterprise`, with self-serve plans routing into trial onboarding when signed out and into the shared Stripe-backed billing path when signed in
- docs/navigation IA should be treated as incomplete until the left rail explains the major control-plane, Brew Agentic, security, integrations, and reference areas instead of acting like a sparse link list
- billing truth from subscriptions
- control-plane summary fetch consolidation and cache/revalidation tuning
- tie public pricing CTAs to the live Stripe integration path after pricing copy and plan truth are normalized
- fold the Vercel go-live checklist into the production promotion path so deployment, Stripe, and console/API route checks happen before launch:
  - `brewdocs/console/brewassist-vercel-go-live-checklist-2026-04-28.md`
- onboarding policy checkpoint design
- wizard org/workspace truth should inherit the selected tenant gate org/workspace and lock those values to the authoritative record rather than collecting a second free-form org identity in the init wizard
- init completion should auto-launch the repo analysis / first-plan prompt from the captured onboarding context so the user does not have to manually run `/init` again after the wizard completes
- extend hosted checkpoint with Trust Center / Security links and policy-admin visibility
- returning-user session policy implementation is in place; next step is to harden step-up auth for sensitive actions and keep server-side revalidation authoritative
- admin/RBAC information architecture
- deepen RBAC from the first live settings surface into capability-aware gates for billing, provider management, replay export, and execution approval
- extend hosted session continuity from passive visibility into explicit reopen/resume flows tied to replay and command-center context
- move beyond replay-only resume so a restored session can rehydrate active workflow context, not just open the run trace
- next continuity gap is transcript-grade persistence so resumed sessions can restore richer assistant output than summary-level workflow reconstruction
- preserve command-center layout state and composer drafts when the browser returns to the tab so in-progress work is not lost on a visibility switch or reload
- define the sandbox as a larger isolated execution workspace that shadows the repo, with room for a future dedicated sandbox domain / DB / runtime tier
- normalize right-rail collaboration surfaces away from native “screen share” language and toward handoff/integration language

### Phase B

- diff/confirm/apply completion
- runtime/session resume
- DevOps 8 signal depth
- diff/apply review surfaces should show structured file counts and line stats, not just a raw diff blob, before the final push step
- sandbox confirm now returns commit hash and changed-file metadata so the cockpit can narrate a real apply handoff instead of a generic success message
- enterprise auth hardening and second-factor policy

### Phase C

- provider/model refresh
- hosted Codex account-connect design
- tool-call audit and explicit tool execution surfaces
- HRM and multi-tier agent verification
- add explicit HRM and AGENTS regression coverage so mode routing, tool gating, and run/report replay behavior stay stable across the cockpit and API paths
- keep multi-tier agents in the backlog as a controlled role model, not a free-form swarm; any new agent tiers should ship with permission, memory, and replay contracts

## Todo Capture From This Session

- console search placement may move beside the tab strip later if it gives the top frame better balance
- console data layer is currently chatty in dev; reduce repeated summary calls, consider endpoint consolidation, and tighten cache/revalidation behavior once the current billing/admin/onboarding foundations are stable
- `Console` should remain the visible post-onboarding entry point in the top nav; keep `/console/overview` reachable from there, but avoid advertising `Dashboard` when the real hosted surface is the control plane
- V1 can ship the console as `brewassist.app/console/*`; if we want the cleaner enterprise split, `console.brewassist.app` can be mapped to the same hosted app later without changing the product flow
- billing stays capability-gated on the server, and V1 should keep manage-billing owner-only unless a future admin policy explicitly broadens it
- non-members must still fail closed at the enterprise gate; repo connection warnings should show in the main frame when no repo shadow is connected and disappear once `repoRoot` is bound
- private repo selections should trigger a visible toast telling the user the repo must be public to use in the BrewAssist sandbox
- onboarding should not jump straight to billing after auth; it should establish org, policy, workspace, and readiness first
- add policy review and acknowledgement surfaces before first sensitive usage
- apply `202604240001_policy_acceptance_foundations.sql` to Supabase before relying on hosted checkpoint in shared environments
- add admin-only permissions console
- keep DevOps 8 / right-rail collaboration execution-linked; do not turn it into a generic chat/video product
- add second-factor / enterprise auth policy
- support/admin session help should be an explicit audited access path rather than silent impersonation; if support needs to assist a customer session, that should be a granted view/join/assist flow with logging and clear operator boundaries
- support session assist should eventually live in the console as a dedicated support surface with scoped client-session join, audit events, and explicit expiry
- console support now has the first request-and-audit API; the remaining gap is approval/grant flow plus live join/leave enforcement if we want a true client-session assist session
- console support now has the request/grant/join/leave/revoke API shape with client consent and expiry; the remaining gap is client-visible consent UX in the product-facing side of the support flow if we want a true client-session assist session
- step-up auth now applies to sensitive billing and support mutations; keep the browser freshness gate honest for checkout, portal, approval-link, and support-access actions until we add a stronger server-backed reauth proof
- design hosted Codex account connect flow
- refresh model inventory and provider defaults
- audit tool calls, HRM, and multi-agent communication
- add BrewPM hosted agent-audit visibility in the cockpit so current stage, workflow mode, last assistant activity, and the explicit recursive-toolcall gap are visible before mirror validation lands in Brew Agentic
- add resume/session recovery contract
- surface structured line stats in the hosted review handoff so the command center shows file counts, added/removed lines, and binary hints instead of only a file list
- keep verifying that BrewAssist actually performs file and repo work it claims to support
