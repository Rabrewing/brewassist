# BrewAssist Managed Provider Proxy Contract

**Date:** 2026-04-23  
**Status:** Active implementation reference  
**Depends on:** `brewassist-console-connector-contracts-2026-04-22.md`, `brew-billing-metering-and-visibility-contracts-2026-04-21.md`, `brew-platform-monetization-architecture-2026-04-21.md`

## Core Rule

If a customer uses Brew-managed provider access, BrewAssist must never hand the raw vendor API key to:

- the browser
- Brew Agentic
- any customer-controlled client surface

The provider key remains server-side only.

## What The User Gets Instead

### Browser user

- Brew account session
- workspace membership
- entitlement summary
- billing and credit visibility
- hosted responses returned from BrewAssist APIs

### Brew Agentic runtime

- Brew account login state
- workspace link state
- short-lived Brew runtime token for hosted control-plane calls
- never the raw provider key

## Request Path

For Brew-managed usage:

1. user authenticates with BrewAssist
2. BrewAssist checks workspace, plan, entitlement, credits, and provider/model allowlist
3. BrewAssist makes the upstream provider request server-side
4. BrewAssist records usage, cost, billing class, and audit metadata
5. BrewAssist returns the result to the browser or linked runtime

## Explicit Non-Goals

Do not:

- expose the raw OpenAI key in client JavaScript
- send Brew-managed provider keys into Brew Agentic
- treat provider auth as customer account auth
- use a shared provider key as if it were the user identity

## Billing Meaning

### BYOK

- customer uses their own provider key
- Brew still charges platform fee
- Brew may charge intelligence usage where applicable

### Brew-managed

- Brew owns upstream provider billing
- Brew charges platform fee
- Brew charges managed usage through credits or billing
- Brew may charge intelligence usage where applicable

### Owner-direct

- visible in telemetry
- excluded from customer managed billing totals

## Hosted Endpoints To Build

Initial control-plane read surfaces:

- `GET /api/account/session`
- `GET /api/workspaces`
- `POST /api/workspaces/select`
- `GET /api/entitlements/summary`
- `GET /api/billing/summary`
- `GET /api/credits/summary`
- `GET /api/providers/managed-summary`

Required next execution surfaces:

- `POST /api/runtimes/token`
- `POST /api/llm/proxy`

## Stripe Timing

Stripe must be configured before BrewAssist can truthfully support:

- paid subscriptions
- credit top-ups
- invoice history
- billing portal access
- production managed-usage charging

Until Stripe is wired:

- billing summaries may exist as control-plane placeholders
- credits should not be represented as production-ready purchasable balance
- managed provider billing should not be marketed as complete

## Supabase Timing

Supabase is already the enterprise identity and control-plane data path.

Use it now for:

- account session resolution
- org and workspace membership
- usage meter records
- provider key metadata
- policy and audit tables

Do not wait on Stripe to continue the control-plane read model work.
