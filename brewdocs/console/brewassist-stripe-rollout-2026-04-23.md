# BrewAssist Stripe Rollout Plan

**Date:** 2026-04-23  
**Updated:** 2026-04-23 15:08 America/New_York  
**Status:** Active implementation plan  
**Canonical upstream references:** `/home/brewexec/brew-agentic/brewdocs/specs/brew-managed-pricing-and-billing-policy-2026-04-20.md`, `/home/brewexec/brew-agentic/brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`, `/home/brewexec/brew-agentic/brewdocs/specs/brew-billing-metering-and-visibility-contracts-2026-04-21.md`

## Canonical Pricing Rule

BrewAssist does not define a second pricing model.

BrewAssist billing must mirror the shared Brew model:

1. platform fee
2. optional usage-priced Brew intelligence
3. managed API margin only for Brew-managed provider access

## Current Reality

- billing summary and credits summary APIs exist
- Stripe is not production-wired
- entitlements must remain authoritative in Brew control-plane data, not Stripe alone
- owner-direct usage must stay excluded from customer managed billing totals

## Current Readiness Scaffold

BrewAssist now exposes:

- `GET /api/billing/config`
- Stripe readiness inside `GET /api/billing/summary`
- enterprise readiness inside `GET /api/security/enterprise-readiness`

The console can now show which Stripe prerequisites are configured and which are still missing.

## Live Routes Now Present

The first live Stripe-backed server routes now exist in BrewAssist:

- `POST /api/billing/checkout`
- `POST /api/billing/portal`
- `POST /api/billing/webhook`

These routes now support:

- Stripe customer creation or reuse per hosted org
- hosted subscription checkout for self-serve plans
- billing portal launch for existing Stripe customers
- verified webhook handling against raw request body
- local event-ledger append and subscription/customer sync into Supabase tables

Current UI entry point:

- `/console/billing`

## Required Environment

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_STARTER_MONTHLY`
- `STRIPE_PRICE_STARTER_YEARLY`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_TEAM_MONTHLY`
- `STRIPE_PRICE_TEAM_YEARLY`

## Recommended Rollout Order

### Phase 1

- finalize pricing catalog and versioned price-card source
- create Stripe customer mapping per billable account or workspace
- wire hosted checkout for self-serve platform subscription
- wire hosted billing portal

### Phase 2

- webhook verification and idempotent event ledger
- subscription state sync into local billing records
- invoice visibility surfaces
- prepaid credit top-up flows

### Phase 3

- managed usage debit from control-plane credit ledger
- overage or postpaid policy only after prepaid flow is stable
- enterprise contract billing overrides where needed

## Current Schema Direction

The first migration scaffold now includes:

- `billing_customers`
- `billing_subscriptions`
- `billing_event_ledger`

These persist hosted billing state locally so BrewAssist does not rely on Stripe alone for plan or entitlement truth.

Additional index migration now exists for Stripe subscription identity:

- `202604230002_billing_subscription_indexes.sql`

## Important Constraints

- do not market credits as purchasable until checkout, webhook verification, and credit ledger sync are live
- do not treat Stripe as the source of truth for entitlements
- do not let Brew Agentic calculate authoritative customer billing locally

## When Stripe Setup Is Required

Stripe setup becomes mandatory before:

- public self-serve subscription checkout
- live billing portal access
- invoice history
- credit top-ups
- production Brew-managed charging

Until then, BrewAssist can continue shipping read models, plan mapping, usage visibility, and enterprise trust surfaces.
