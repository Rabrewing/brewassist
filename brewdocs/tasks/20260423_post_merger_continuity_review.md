# BrewAssist Post-Merger Continuity Review

**Date:** 2026-04-23  
**Updated:** 2026-04-24 07:44 EDT  
**Status:** Working reference

## What BrewAssist Already Had Before The Console Merger Pass

- Supabase auth, org bootstrap, and workspace gating are already present.
- The canonical online workflow remains:
  `Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay`
- Replay history, run events, and collab message persistence are already wired.
- The right rail already has the real `Ops` / DevOps 8, `Files`, `Sandbox`, and `Cognition` host instead of placeholder tabs.
- Provider and repo context already flow through the browser app and API request context.
- Sandbox mirror binding for GitHub / GitLab / Bitbucket is already implemented.

## Shared Source Rules During This Phase

- `brewdocs/console/` is the in-repo mirrored source for current BrewAssist implementation work.
- `/home/brewexec/brew-agentic/brewdocs/specs/` remains the upstream reference set when checking whether BrewAssist drifted from the shared console, provider, billing, runtime-link, or trust contracts.
- If Brew Agentic and BrewAssist disagree, capture the discrepancy explicitly and normalize toward one shared control-plane story rather than letting both products drift independently.

## What Brew Agentic Is Ahead On

- Local account and console summary surfaces:
  `/account`, `/billing`, `/credits`, `/workspace`, `/workspaces`
- Local login/logout and Brew Agentic link/unlink surfaces
- More terminal-native block rendering and lighter assistant output lanes
- Broader provider auth-mode handling and local provider state UX
- A more extensive test suite around runtime, TUI, control-plane, provider, and gating behavior

## What BrewAssist Still Needs

### Hosted control-plane read model

- account session endpoints
- workspace list and workspace selection endpoints
- entitlement summary endpoints
- billing summary endpoints
- credits summary endpoints
- managed provider summary endpoints

### Hosted managed-provider execution path

- short-lived Brew runtime token issuance
- server-side managed provider proxy
- metering and billing-class recording on hosted requests
- provider/model allowlist enforcement before upstream invocation

### Billing

- Stripe checkout
- Stripe portal
- invoice sync
- subscription sync
- webhook verification and idempotent local state updates

### Newly validated and newly exposed gaps

- first live Stripe sandbox checkout is now working end-to-end
- org plan reconciliation from Stripe subscription state needed correction after first live run
- billing period fields need to survive webhook ordering differences
- console shell needs sticky-frame plus lower-region scrolling instead of whole-page drift
- onboarding should add policy/trust checkpoints before execution-sensitive usage rather than jumping users straight from auth to billing
- enterprise admin and RBAC surfaces now need to become explicit instead of implied

### UX parity and alignment

- center-pane rendering should move away from mirrored bubble chat and toward a left-aligned block stream for prose, data, logs, and code
- onboarding/provider auth should resume correctly inside the wizard instead of restarting
- console routes should continue absorbing the public IA and console IA mockups

## DevOps 8 Right Rail Status

Current internal docs indicate the DevOps 8 right rail is **not missing in basic structure**.

What remains is mainly:

- richer runtime data
- better replay/report metadata feeding the signals
- continued compactness and better handoff between DevOps 8 and collab surfaces

So the likely gap is **signal depth**, not the existence of the right-rail host.

## Output Flow Assessment

BrewAssist should keep the enterprise workflow stages.

Those stages are still the correct control-plane model for:

- governed execution
- approvals
- preview and confirm
- replay and auditability

What likely needs to change is **presentation**, not the staged model itself.

Recommended direction:

- keep the enterprise stage machine
- modernize the center-pane rendering closer to Brew Agentic / Codex / terminal-native block output

## Test Direction

BrewAssist should add broader product tests similar in spirit to Brew Agentic for:

- onboarding and provider auth resume
- hosted control-plane summary endpoints
- console route rendering and IA shell stability
- billing and provider summary contracts
- managed-provider proxy gating
- runtime token issuance
- replay, collab, and report continuity
