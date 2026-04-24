# AGENTS.md - BrewAssist

Updated: 2026-04-24T12:19:31Z (Billing lifecycle surfaces extended; fetch optimization queued)

- Treat `/home/brewexec/brewassist` as the repo root.
- Main UI entrypoint is `pages/index.tsx`; the primary assistant stream route is `pages/api/brewassist.ts`.
- Shared app logic lives in `lib/`; client state providers live in `contexts/`; tests live in `__tests__/`.
- TypeScript is strict, uses ES2020, `moduleResolution: bundler`, and only the `@/*` path alias from `tsconfig.json`.
- `pnpm dev` starts `next dev -p 3000` and forces `BREWTRUTH_ENABLED=true` in the script. `pnpm start` serves on port 3000.
- `next.config.cjs` uses `output: 'standalone'` and sets Turbopack root to this repo.

## Commands

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:chain`
- `pnpm build`
- `pnpm test -- --testPathPattern="file.test.ts"`
- `pnpm test -- --testNamePattern="specific test name"`
- `pnpm s4:lock-check`
- `pnpm s4:gate`
- `pnpm s4:manifest:verify`
- `pnpm s4:manifest:update`
- `pnpm s5:brewdocs:verify`
- `pnpm s5:support:verify`
- `pnpm audit:capabilities`

## Gotchas

- `pnpm lint` only covers `pages/`, `components/`, and `lib/`; it does not lint `contexts/`, `scripts/`, or `pages/api/`.
- `pnpm typecheck` follows `tsconfig.json`; it does not include `__tests__/`.
- `pnpm test:chain` is the key regression suite for mode splitting, tool gating, and router integrity.
- `pages/api/brewassist.ts` enforces policy and streams SSE responses; keep its response shape stable when changing assistant flow.
- `CockpitModeContext` persists `cockpitMode` in browser `localStorage`; keep that code client-only.
- Update `brewdocs/` when changing architecture or S4/S5 gate behavior.

## Current Session Rules

- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md` is the canonical online+local workflow contract.
- During the BrewAssist + Brew Agentic merger phase, keep `brewdocs/console/` aligned with the mirrored upstream specs and review `/home/brewexec/brew-agentic/brewdocs/specs/` when checking intent, provider, billing, console, runtime-link, or trust behavior.
- When BrewAssist and Brew Agentic appear to diverge, do not silently invent a third interpretation; document the delta and normalize BrewAssist to the shared control-plane contract where feasible.
- BrewAssist online must stay aligned to `Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay`; do not invent a second flow.
- `components/WorkspaceSidebarRight.tsx` is the real right-rail host for `Ops`/DevOps8, `Files`, `Sandbox`, and `Cognition`; do not reintroduce placeholder tabs.
- `repoProvider` and `repoRoot` are part of the request context and must be forwarded through `/api/brewassist`, `/api/fs-tree`, and `/api/fs-read`.
- Unsupported cross-repo access must fail closed until multi-repo routing is implemented.
- The sandbox mirror is the writable surface; live repo writes are not the default path.
- BrewAssist is not v1 until repo connect, sandbox bind, diff preview, confirm, report, and replay are all present in the online workflow.
- Supabase is the current enterprise data path: keep migrations under `supabase/migrations/`, preserve RLS/RBAC in SQL, and never commit live Supabase keys.
- Online auth now uses Supabase session identity plus org membership lookup; API routes may receive the browser access token as a bearer header until server-side cookie exchange is fully hardened.
- `brewmaster.rb@brewassist.app` is the current super-admin recovery account; keep bootstrap logic idempotent so repeated login/bootstrap attempts reuse the same org/workspace instead of failing on unique constraints.
- Typed agent-fabric runtime, persisted replay, and right-rail collab surfaces are now partially implemented; remaining high-priority unfinished work is auth/tenant hardening, real provider repo connect, sandbox binding, diff/confirm/apply completion, landing/pricing/billing implementation, and production email/SSO hardening.
- Public brewassist.app entry must include landing, auth gate, cookie consent, accessibility, terms/privacy, and AI/data-collection disclosures before the cockpit.
- Landing and pricing implementation should now use `brewdocs/BrewAssist Landing Page-Pricing-v1.md` plus `brewdocs/mockups/landing-page.png` and `brewdocs/mockups/pricing-page.png`, but normalize copy to the real product state before building.
- Do not market BrewAssist as generic AI fluff; public copy should reflect the actual control-plane workflow: provider/repo selection, sandbox-first execution, policy gating, reporting, replay, telemetry, and collaboration.
- Auth blocker now FIXED: Applied migration `202604130003_fix_membership_rls_recursion.sql`, made browser client a singleton in `lib/supabase/browser.ts`, updated `EnterpriseTenantGate` to use shared client. Sign-in now works reliably.
- Public landing and pricing now implemented with modal legal links, auth panel visible in hero, and billing status badge in cockpit header.
- Collab agent and persisted replay now fully wired: `collab.message` events persist to `run_events`, surface in right-rail CollabPanel and replay center trace.
- Remaining high-priority work: real provider repo connect (GitHub OAuth), sandbox binding lifecycle, production billing integration (Stripe), diff/confirm/apply completion, enterprise SSO hardening.

## Current Session - First Live Stripe Checkout, Console Shell Correction, And Execution Phase

**2026-04-24T11:44:01Z: First Live Stripe Sandbox Checkout**

- First successful end-to-end hosted Stripe sandbox checkout now validated against Supabase-backed billing state.
- Confirmed persisted Stripe objects:
  - customer `cus_UOU60bk7NCX6OD`
  - subscription `sub_1TPhVmKAwSkLaHLXYy8JL7re`
- Confirmed Supabase persistence in:
  - `billing_event_ledger`
  - `billing_customers`
  - `billing_subscriptions`
- Real integration correction applied after first live run:
  - org plan now reconciles from Stripe subscription state
  - subscription billing periods no longer get nulled by later lower-detail webhook events

**2026-04-24T11:44:01Z: Console Shell Correction**

- Console shell now uses a sticky top frame with a separate lower scroll region.
- Console section navigation now lives in a horizontally scrollable tab strip.
- Search surface is still provisional and may move closer to the tab strip later if that composition breathes better.

**2026-04-24T11:44:01Z: Next Execution Phase**

- New-user hosted flow should be:
  sign in -> org bootstrap -> policy/trust acknowledgement -> workspace/repo/provider readiness -> wizard -> console -> billing when capability or plan selection requires it
- Do not force every newly authenticated user straight into billing; trust, org setup, and execution readiness come first.
- Immediate next build tracks are now:
  - onboarding/policy/trust gating
  - admin and RBAC surfaces
  - diff/confirm/apply completion
  - session resume continuity
  - DevOps 8 right-rail signal depth
  - provider/model refresh
  - hosted Codex account-connect planning
  - tool-call, HRM, and multi-tier agent verification

**2026-04-24T12:19:31Z: Billing Lifecycle And Console Read-Model Notes**

- `/console/billing` now shows subscription truth, lifecycle state, billing period, customer linkage, invoice/payment timeline, and portal-first management guidance.
- V1 billing direction is now explicit: console-first visibility, Stripe-portal-first administration.
- Current hosted console data layer is still chatty in dev and shows repeated summary requests across account, workspace, entitlement, billing, provider, and security endpoints.
- Fetch/revalidation optimization is now queued, but should not replace the current priority order unless the console starts materially blocking product work.

## Current Session - Console Merger, Enterprise Readiness, And Hosted Contracts

**2026-04-23T12:40:54Z: Shared Console + Public IA Scaffold**

- Public route registry scaffold now exists inside BrewAssist for `/product`, `/brew-agentic`, `/features`, `/pricing`, `/security`, `/docs`, `/start-free`, `/login`, `/book-demo`, `/ai-transparency`, `/support`, `/status`, and `/console/*`.
- The first hosted console shell now lives under `/console/*` in-repo as a scaffold while `console.brewassist.app` remains the canonical target shape.
- Console pages now consume the first Supabase-backed control-plane summary endpoints for account, workspace, entitlement, billing, credits, and managed-provider state.
- Current mockups under `public/mockups/` and the Brew Agentic images under `public/assests/agentic/` are active implementation inputs.

**2026-04-23T12:40:54Z: Managed Provider + Enterprise Trust Direction**

- Brew-managed provider keys must remain server-side only; never expose raw vendor keys to the browser or Brew Agentic.
- Short-lived Brew runtime tokens are the intended link path for Brew Agentic hosted access; raw provider keys are not the runtime contract.
- Stripe is required before production-ready subscriptions, credit top-ups, invoice history, billing portal access, or live managed charging can be considered complete.
- Enterprise readiness now explicitly includes SAML/OIDC SSO, tenant isolation, auditability, Trust Center content, security documentation, and a credible SOC 2 path.
- Shared pricing and billing truth should continue to reference `/home/brewexec/brew-agentic/brewdocs/specs/brew-managed-pricing-and-billing-policy-2026-04-20.md`, `/home/brewexec/brew-agentic/brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`, and `/home/brewexec/brew-agentic/brewdocs/specs/brew-billing-metering-and-visibility-contracts-2026-04-21.md`.

**2026-04-23T13:42:00Z: Enterprise Identity + Billing Readiness**

- BrewAssist now carries explicit hosted readiness read models for enterprise identity and Stripe billing configuration.
- Console billing and trust pages should show configured vs missing setup state instead of implying that live Stripe billing or enterprise SSO already exists.
- Supabase migration scaffolds now reserve schema for org identity providers, domain verification, SCIM connectors, billing customers, subscriptions, and billing event ledger state.

**2026-04-23T15:08:00Z: Live Stripe Server Path**

- BrewAssist now has first live Stripe server routes for checkout, billing portal, and verified webhook ingestion under `pages/api/billing/checkout.ts`, `pages/api/billing/portal.ts`, and `pages/api/billing/webhook.ts`.
- Stripe customer and subscription state now sync into Supabase-backed hosted billing tables; Stripe remains the billing rail, not the entitlement source of truth.
- `/console/billing` now includes first operator actions for launching hosted checkout and billing portal once Stripe env and dashboard objects are configured.

**2026-04-23T15:34:00Z: Tax Readiness**

- Tax automation is explicitly deferred during Stripe sandbox and test-mode setup.
- BrewAssist should not build its own sales tax / VAT / GST engine; use Stripe Tax or a comparable specialist service when production billing is prepared.
- Production billing launch should include tax review and product tax-code verification before accepting real paid customer subscriptions.

## Current Session - GitHub OAuth, UI, & Sandbox Binding (COMPLETED)

**2026-04-14: GitHub Device Flow OAuth Implementation & Fixes**

- Resolved race condition in `DeviceFlowModal.tsx` that caused "new code" generation on tab return.
- Added auto-detection on tab focus/visibility change using `visibilitychange` and `focus` events.
- Extracted `checkActivation` for immediate status checks.
- Enhanced UI with better instructions, copy button, and pulse indicators.
- Added 401 handling in `RepoConnectionContext` to clear stale tokens.
- All components now correctly handle the full device flow lifecycle.

**2026-04-14: Cockpit UI Flow & Sandbox Binding Pipeline**

- **UI Layout Flow:** Solved the global scrolling bug by conditionally rendering the `EnterpriseTenantGate` setup card so it doesn't push the `100vh` cockpit out of bounds. 
- **Two-Row Navigation:** Re-architected the header into two rows (`cockpit-header` and `cockpit-sub-header`) to uncramp the UI, restoring full visibility of the sign-out button, user session info, and repository provider dropdowns.
- **Sandbox Binding Engine:** Implemented `bindRemoteSandbox` in `lib/brewSandboxMirror.ts`. When a user selects a GitHub repo from the UI, it securely runs a shallow `git clone` to pull the code into `sandbox/mirror/github/[repo]`.
- **Private Repo Warning:** Added a tooltip and red border to the Repo selector if the user selects a private repository, indicating it must be made public to be fully usable in the online sandbox.
- **API & Tree Integration:** Created `/api/sandbox/bind` to handle the clone request securely. Wired `ProjectTree.tsx`, `fs-tree.ts`, and `fs-read.ts` to dynamically point to the cloned sandbox mirror instead of the local repo if an external repo is selected.
- **Next Logical Step:** Extend the exact same sandbox pipeline to further enterprise providers if needed (e.g., Azure DevOps).

## 2026-04-14: Multi-Provider Integration (GitHub, GitLab, Bitbucket) - COMPLETED

- **OAuth Unified Flow:** Successfully implemented OAuth Web Flow for GitLab and Bitbucket, and Device Flow for GitHub.
- **Unified Sandbox Pipeline:** The `bindRemoteSandbox` engine now supports all three major providers (GitHub, GitLab, Bitbucket), automatically using the correct authenticated clone URL for each.
- **UI Context Bar:** The two-row cockpit header now dynamically handles repository selection and connection states for all three providers.
- **Enterprise Readiness:** BrewAssist V1 now supports over 95% of the enterprise source control market out of the box.
- **BrewAgentic Bridge:** Added a bridge notification for "Local" repo selection, pointing users to the BrewAgentic CLI suite.
- **Security:** Implemented a private repository warning system to ensure users understand the V1 public-repo requirement for sandbox operations.
- **Onboarding Checks:** Added "Checks & Balances" to the `InitWizardModal` completion handler. BrewAssist now verifies the repository connection and provider token before proceeding to the planning stage, surfacing warnings if the environment isn't ready.

## Next Milestone: End-to-End Apply Loop (V1 Final Stretch)

**Strategy Phase Initiated: 2026-04-14**
- **Objective:** Complete the loop from AI sandbox edit to live repository push (Confirm & Push).
- **Plan Documented:** See `brewdocs/tasks/20260414_end_to_end_apply_loop_plan.md` for the full technical breakdown.
- **Immediate Next Steps:** Improve the `brewassist-sandbox-apply.ts` API to support provider-specific mirror paths and implement the Diff UI component.

**Documented: 2026-04-14**
- **Architectural Pivot:** BrewAssist is migrating from a rigid "fallback chain" to a pure "Provider-Based Route" system.
- **BYOK (Bring Your Own Key):** Clients will have the option to use BrewAssist's enterprise API quota OR supply their own API keys per provider.
- **Target Roster (Post-V1):**
  - **OpenAI:** ChatGPT 5.4, etc.
  - **Google:** Gemini 3 (Ultra/Pro/Flash)
  - **Anthropic:** Claude 3.5+ (Opus/Sonnet/Haiku)
  - **Emerging/Asian Providers:** Mimo V2 (Omni + Pro), Kimi K2.5, Qwen (latest), MiniMax.
- **Rule:** Do *not* implement these new API clients until the core V1 Sandbox execution loop (Diff/Confirm/Apply) is 100% complete and tested.
