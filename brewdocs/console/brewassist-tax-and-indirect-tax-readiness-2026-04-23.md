# BrewAssist Tax And Indirect Tax Readiness

**Date:** 2026-04-23  
**Updated:** 2026-04-23 15:34 America/New_York  
**Status:** Deferred until live billing launch  
**Related:** `brewassist-stripe-rollout-2026-04-23.md`, `brew-billing-metering-and-visibility-contracts-2026-04-21.md`, `/home/brewexec/brew-agentic/brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`

## Current Decision

Tax automation is intentionally deferred during Stripe test-mode and sandbox-only billing work.

BrewAssist should not build its own tax engine.

When live billing is introduced, BrewAssist should strongly prefer:

- `Stripe Tax` or an equivalent specialized tax service
- accountant or CPA review before public paid launch

## Why This Is Deferred Right Now

Current phase goals:

- subscription checkout in test mode
- billing portal wiring
- webhook verification
- local billing-state sync into Supabase

Tax registration, calculation, and filing are not required to validate those sandbox flows.

## Launch Requirement

Before BrewAssist accepts real paid customer subscriptions in production, review:

1. sales tax obligations in relevant US states
2. VAT obligations for EU/UK sales if applicable
3. GST or similar indirect tax rules in other selling regions if applicable
4. whether `Stripe Tax` is enabled and configured correctly
5. whether product tax code selection has been reviewed
6. whether invoices and checkout language align with the tax configuration

## Implementation Guidance

- keep BrewAssist as the source of truth for plans and entitlements
- let Stripe handle tax calculation and collection if Stripe Tax is enabled
- do not embed custom tax logic in BrewAssist application code unless a real legal/accounting requirement forces it

## Trigger To Revisit

Revisit this document when any of the following become true:

- production Stripe keys are being configured
- public self-serve billing is about to launch
- real customer invoices are about to be issued
- international billing is being enabled

## Practical Rule

Testing and sandbox mode:

- tax can remain deferred

Production billing:

- tax cannot remain an afterthought
