# BrewAssist Console Domain + IA Plan

**Date:** 2026-04-20  
**Updated:** 2026-04-20 11:20 America/New_York  
**Status:** Active planning spec  
**Depends on:** `brewdocs/specs/brew-managed-console-and-go-live-2026-04-19.md`, `brewdocs/specs/brew-managed-pricing-and-billing-policy-2026-04-20.md`, `brewdocs/specs/hybrid-control-plane.md`

## Recommendation

Use `console.brewassist.app` as the shared hosted control plane for:

- BrewAssist web usage
- Brew-managed access for Brew Agentic
- account, workspace, entitlement, billing, and usage administration

Do **not** buy or invent a second product domain for this layer right now.

## Current Repo Implementation Note

Inside the current BrewAssist Next.js app, the first console scaffold may live under `/console/*` routes until domain separation is operationally ready.

That implementation detail does not change the product contract:

- `console.brewassist.app` remains the canonical target shape
- `/console/*` is only the in-repo scaffolding path for the current monolith

That is the right move because:

- the control plane is shared anyway
- it avoids fragmenting account and billing identity
- it keeps pricing, entitlements, and usage truth in one hosted place
- it lets BrewAssist web and Brew Agentic local behave like two clients of the same platform

## Product Split

### `brewassist.app`

Public product surface.

Use for:

- landing
- pricing
- auth entry
- product marketing
- primary browser app entry

### `console.brewassist.app`

Authenticated control plane.

Use for:

- account settings
- workspace/org management
- managed provider access
- usage and billing
- entitlements
- admin and owner controls
- install/download guidance for Brew Agentic local mode

### `brew-agentic`

Local execution client.

Use for:

- local TUI/CLI
- BYOK flows
- local repo and operator workflows
- local session telemetry
- optional sign-in to the BrewAssist control plane when the user wants Brew-managed access

## Why This Fits The Hybrid Plan

BrewAssist online is already the enterprise/browser product, while Brew Agentic is becoming the local runtime.

The clean platform shape is:

1. BrewAssist web is a hosted client
2. Brew Agentic is a local client
3. `console.brewassist.app` is the shared control plane behind both

That means:

- one identity system
- one billing system
- one entitlement system
- one provider/model managed allowlist
- one usage ledger for managed access

## User Flows

### Browser-first customer

1. User visits `brewassist.app`
2. Signs in
3. Works in BrewAssist web
4. Uses `console.brewassist.app` for plan, billing, seats, usage, and entitlements

### Local-first customer

1. User visits `brewassist.app`
2. Signs in or creates account
3. Chooses local mode
4. Installs or launches Brew Agentic
5. Brew Agentic signs in to BrewAssist account
6. Brew Agentic receives:
   - workspace identity
   - managed entitlements
   - credit balance
   - provider/model allowlist
7. User opens `console.brewassist.app` for full account and billing management

### Hybrid customer

1. User works in BrewAssist web for hosted repo-connected workflows
2. User also runs Brew Agentic for local repo workflows
3. Both surfaces share:
   - account
   - workspace
   - billing
   - managed entitlements
   - usage visibility

## Domain Strategy

### Recommended now

- `brewassist.app` = public and app entry
- `console.brewassist.app` = authenticated control plane

### Optional future subdomains

- `api.brewassist.app` = public control-plane API
- `docs.brewassist.app` = product docs
- `status.brewassist.app` = status page

Do not create those until they are operationally justified.

## Control Plane Responsibilities

`console.brewassist.app` should own:

- account profile
- login session state
- organization/workspace membership
- plan and subscription state
- Brew-managed credits
- invoices and receipts
- usage by provider/model/user/workspace
- provider/model entitlements
- admin owner controls
- install and connection guidance for Brew Agentic

It should **not** own:

- local repo execution
- local BYOK secret storage
- local session replay artifacts
- local operator workflow state

## Console IA

Recommended top-level navigation:

1. Overview
2. Workspaces
3. Usage
4. Billing
5. Providers
6. Installs
7. Settings
8. Admin

## Route Map

### Public routes

- `/`
- `/pricing`
- `/login`
- `/signup`
- `/legal/terms`
- `/legal/privacy`
- `/security`

### Console routes

- `/overview`
- `/workspaces`
- `/workspaces/:workspaceId`
- `/usage`
- `/usage/providers`
- `/usage/models`
- `/billing`
- `/billing/credits`
- `/billing/invoices`
- `/billing/payment-methods`
- `/providers`
- `/providers/managed`
- `/providers/byok-policy`
- `/installs`
- `/installs/brew-agentic`
- `/settings/profile`
- `/settings/account`
- `/settings/security`
- `/settings/members`
- `/admin`
- `/admin/providers`
- `/admin/pricing`
- `/admin/entitlements`
- `/admin/incidents`

## Page Responsibilities

### Overview

Show:

- current workspace
- current plan
- credit balance
- recent usage
- provider health summary
- Brew Agentic connection status

### Workspaces

Show:

- workspace list
- repo connection mode
- whether workspace is browser-only, local-capable, or hybrid
- member roles
- plan and entitlement summary

### Usage

Show authoritative hosted usage only:

- by provider
- by model
- by day and billing period
- by workspace and member

### Billing

Show:

- current subscription
- invoices
- prepaid credits
- overage estimate if enabled later
- Stripe portal link

### Providers

Show:

- managed provider availability
- model allowlist by plan
- BYOK policy explanation
- which providers/models are usable in BrewAssist web vs Brew Agentic local vs both

### Installs

Show:

- download/install instructions for Brew Agentic
- version compatibility
- local sign-in instructions
- connect and verify steps

### Settings

Show:

- profile
- security
- team or member management
- session management

### Admin

Show:

- managed provider health
- pricing tables
- entitlements
- incident controls
- owner-only overrides

## Shared Data Contracts

The control plane should be the shared source of truth for:

- `account`
- `workspace`
- `membership`
- `subscription`
- `credit_balance`
- `managed_entitlements`
- `managed_price_card`
- `managed_usage_ledger`

Brew Agentic should fetch summaries from this hosted layer.

It should not invent authoritative hosted billing totals locally.

## Brew Agentic Integration

The local app should eventually support:

- `/account`
- `/billing`
- `/credits`
- `/workspace`
- `/login`

But these should be thin client views into `console.brewassist.app` data, not the admin source of truth.

Recommended local behavior:

- TUI can show summary status
- browser opens for full management and Stripe flows
- local runtime keeps BYOK separate from Brew-managed account state

## BrewAssist Web Integration

The web app should treat `console.brewassist.app` as its own authenticated control-plane shell, not as a separate product.

That means:

- same identity
- same workspace objects
- same billing ledger
- same entitlements
- same admin controls

## Information Architecture Rules

1. Keep public marketing and authenticated control-plane pages visually and operationally separate.
2. Keep BYOK messaging distinct from Brew-managed pricing.
3. Never blur hosted billing truth with local `/usage`.
4. Make local-mode install and sign-in obvious from the console.
5. Show whether a workspace is:
   - browser-connected
   - local-only
   - hybrid
6. Keep provider availability and plan entitlement messaging explicit.
7. Keep owner/admin controls out of ordinary member settings.

## Suggested Build Order

### Phase 1

- finalize IA
- finalize route map
- finalize account/session contracts

### Phase 2

- build console shell
- build overview, billing, usage, providers, installs

### Phase 3

- connect Stripe and hosted entitlements
- connect Brew Agentic sign-in and workspace hydration

### Phase 4

- add owner/admin views
- add incident tooling
- add advanced plan controls

## Immediate Decision

Yes, using `console.brewassist.app` for both BrewAssist and Brew Agentic managed administration is the right decision.

It should be treated as the shared control plane for the Brew platform, not as a separate brand or separate domain purchase.
