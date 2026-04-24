# BrewAssist First Live Stripe Checkout Case Study

**Date:** 2026-04-24  
**Updated:** 2026-04-24 07:44 EDT  
**Status:** Completed sandbox milestone

## Objective

Validate the first end-to-end BrewAssist hosted billing flow with:

- Stripe Checkout
- Stripe webhook delivery
- Supabase billing persistence
- Console billing state visibility

## What Was Configured

- Stripe sandbox keys, publishable key, webhook secret, and six self-serve price IDs
- Supabase billing foundation migrations
- BrewAssist billing API routes:
  `checkout`, `portal`, `webhook`, `summary`
- Console billing launch surface under `/console/billing`

## First Successful Flow

The first successful completed checkout used:

- org: `a307d421-6b5c-44dc-a57d-4a7f5e76f9e4`
- workspace: `0effffb6-7e74-4144-873e-ebb289215053`
- plan: `starter`
- interval: `monthly`

Persisted Stripe identifiers:

- customer: `cus_UOU60bk7NCX6OD`
- subscription: `sub_1TPhVmKAwSkLaHLXYy8JL7re`

Webhook events recorded in Supabase included:

- `customer.created`
- `customer.updated`
- `checkout.session.completed`
- `customer.subscription.created`

## What Worked

- Checkout session creation
- Stripe-hosted payment completion
- Verified webhook ingestion
- Supabase writes to:
  - `billing_event_ledger`
  - `billing_customers`
  - `billing_subscriptions`

## What Broke On First Pass

Two real integration gaps surfaced:

1. The organization row still showed `plan = free` after checkout.
2. `current_period_start` and `current_period_end` were overwritten to `null`
   because `checkout.session.completed` arrived after the richer subscription event.

## Corrections Applied

- `lib/billing/webhook.ts`
  - subscription events now update the organization plan
  - subscription plan extraction prefers metadata plan IDs over Stripe price nicknames
- `lib/billing/controlPlane.ts`
  - subscription upserts now preserve existing billing periods when a later event is less complete
- One-time backfill applied to the current org and subscription record so the console reflects the successful checkout immediately

## Resulting State

Current corrected subscription state:

- org plan: `starter`
- subscription status: `active`
- period start: `2026-04-24T11:03:02Z`
- period end: `2026-05-24T11:03:02Z`

## Why This Matters

This is the first proof that BrewAssist is no longer only presenting billing UI. The hosted control plane now has a functioning sandbox path for:

- plan purchase
- webhook verification
- billing persistence
- plan/state reconciliation

## Follow-On Work

- surface active subscription details directly in `/console/billing`
- sync invoice history and portal status into console summaries
- add explicit downgrade/cancel handling and plan-change transitions
- add broader regression tests around webhook ordering and subscription updates
- keep V1 invoice handling portal-first rather than rebuilding Stripe invoice
  administration inside BrewAssist too early
