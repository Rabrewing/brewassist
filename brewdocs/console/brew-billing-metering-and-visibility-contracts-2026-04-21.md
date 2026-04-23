# Brew Billing, Metering, and Visibility Contracts

**Date:** 2026-04-21  
**Updated:** 2026-04-21 10:05 America/New_York  
**Status:** Active implementation-contract spec  
**Depends on:** `brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`, `brewdocs/specs/brew-managed-pricing-and-billing-policy-2026-04-20.md`, `brewdocs/specs/brewassist-console-domain-and-ia-2026-04-20.md`

## Purpose

Translate the Brew monetization model into implementation contracts for:

- Stripe objects and events
- hosted billing records
- intelligence usage metering
- plan and entitlement mapping
- hosted cost visibility panels

This is the bridge between:

- monetization strategy
- console IA
- billing API design
- database schema

## Canonical Revenue Layers

All implementation must support these three layers:

1. platform fee
2. optional usage-priced Brew intelligence
3. managed API margin

Do not build billing contracts that only understand tokens.

## Billing Modes

### BYOK

- customer pays vendor directly
- Brew charges platform fee
- Brew may charge intelligence-usage fees if enabled by plan
- Brew must not charge managed provider markup

### Brew-managed

- Brew charges platform fee
- Brew may charge intelligence-usage fees
- Brew charges managed usage from hosted credits or usage billing

### Owner-direct

- no customer billing
- visible in telemetry
- excluded from customer managed totals

### External-auth

- treat like non-managed provider usage unless future product rules say otherwise
- can still carry platform fee and intelligence-usage fees

## Stripe Contracts

Stripe should be the billing rail, not the source of truth for entitlements.

### Required Stripe objects

- Customer
- Subscription
- Product
- Price
- Invoice
- Checkout Session
- Billing Portal Session
- Payment Intent

### Recommended Stripe mapping

#### Platform subscription

- one Stripe subscription per billable workspace or account
- plan tier mapped to Stripe Price

#### Managed credits

- prepaid top-ups through Checkout Session or Payment Link
- credited into Brew control-plane balance after webhook confirmation

#### Enterprise

- contract or manually provisioned subscription state
- invoices may still be recorded in Stripe, but entitlement source remains Brew control plane

## Required Stripe Webhook Events

Track at minimum:

- `checkout.session.completed`
- `customer.created`
- `customer.updated`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.created`
- `invoice.finalized`
- `invoice.paid`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Webhook handling rule

Each webhook must:

1. be verified
2. be idempotent
3. update local billing state
4. append a control-plane Stripe event row
5. never be the sole source of entitlement logic

## Hosted Billing Records

Minimum hosted tables or equivalent records:

### Accounts

- `account_id`
- `email`
- `status`
- `default_workspace_id`

### Workspaces

- `workspace_id`
- `account_id`
- `plan_id`
- `billing_mode`

### Billing accounts

- `workspace_id`
- `plan_id`
- `billing_email`
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_status`
- `credit_balance_usd`
- `currency`

### Entitlements

- `workspace_id`
- `provider_id`
- `auth_modes`
- `model_allowlist`
- `quota_policy`
- `monthly_spend_limit_usd`
- `requests_per_minute_limit`
- `enabled`

### Managed price cards

- `version`
- `provider_id`
- `model_id`
- `input_per_1m_usd`
- `output_per_1m_usd`
- `cached_input_per_1m_usd`
- `vendor_input_per_1m_usd`
- `vendor_output_per_1m_usd`
- `minimum_request_charge_usd`
- `markup_multiplier`
- `effective_from`
- `effective_to`

### Managed usage ledger

- `request_id`
- `timestamp`
- `workspace_id`
- `user_id`
- `session_id`
- `auth_mode`
- `billing_class`
- `provider_id`
- `model_id`
- `input_tokens`
- `output_tokens`
- `vendor_cost_usd`
- `billed_amount_usd`
- `gross_margin_usd`
- `owner_direct_bypass`

### Credit ledger

- `timestamp`
- `workspace_id`
- `amount_usd`
- `balance_after_usd`
- `reason`
- `source`
- `reference_id`

## Intelligence Usage Metering

This is the major missing layer today.

The system needs usage units beyond tokens.

### Metered units to support

#### Agent step

Definition:

- one meaningful autonomous execution step inside a run

Example fields:

- `run_id`
- `agent_id`
- `step_index`
- `step_type`
- `workspace_id`
- `billable_units`

#### Execution chain

Definition:

- one multi-step workflow execution grouping

Example:

- plan
- tool sequence
- validation
- report

#### Memory write

Definition:

- one persisted memory ingestion or one retained-memory unit bucket

#### Audit scan

Definition:

- one audit or policy-analysis pass that consumes Brew compute or specialized checks

#### Premium routing event

Definition:

- use of advanced routing or optimizer logic that is more valuable than baseline provider pass-through

## Recommended Usage Meter Schema

Add a platform usage meter table or equivalent with:

- `meter_event_id`
- `timestamp`
- `workspace_id`
- `user_id`
- `run_id`
- `session_id`
- `meter_type`
- `units`
- `plan_id`
- `billable`
- `billable_usd`
- `metadata`

### Suggested `meter_type` enum

- `agent_step`
- `execution_chain`
- `memory_write`
- `memory_retention`
- `audit_scan`
- `premium_routing`
- `tool_execution`

## Plan and Entitlement Mapping

Plans must map to both feature access and billing behavior.

### Starter

- platform subscription
- BYOK allowed
- managed AI optional or limited
- lower execution depth
- lower included platform-usage units
- basic cost visibility

### Pro

- platform subscription
- BYOK and Brew-managed
- more execution depth
- more included platform-usage units
- credits supported
- richer cost visibility

### Enterprise

- contract or enterprise pricing
- team and workspace controls
- admin surfaces
- advanced trust/audit
- higher or custom limits

## Example Entitlement Fields By Plan

- `can_use_byok`
- `can_use_managed_ai`
- `can_use_brew_agentic_local`
- `max_execution_depth`
- `included_agent_steps`
- `included_execution_chains`
- `included_memory_writes`
- `included_audit_scans`
- `has_trust_center`
- `has_admin_controls`
- `has_team_billing`

## Cost Visibility Panel Requirements

This is non-negotiable for trust.

### Billing page must show

- current plan
- billing interval
- subscription status
- credit balance
- latest invoices
- payment method state

### Usage page must show

- provider
- model
- auth mode
- billing class
- request cost
- token usage
- agent-step usage
- execution-chain usage
- memory usage
- audit usage

### Required filters

- billing period
- workspace
- provider
- model
- auth mode
- meter type

### Required summary cards

- platform subscription amount
- managed usage amount
- intelligence usage amount
- remaining credits
- current period estimate

## User-Facing Billing Language

Always explain:

- BYOK removes vendor pass-through charges, not the Brew platform fee
- owner-direct usage is not customer-billed managed usage
- managed usage consumes Brew credits or managed billing
- platform intelligence usage may appear separately from managed provider usage

## API Surface Recommendation

Suggested hosted routes:

- `GET /api/billing/plans`
- `GET /api/billing/subscription`
- `GET /api/billing/entitlements`
- `GET /api/billing/usage-summary`
- `GET /api/billing/usage-events`
- `GET /api/billing/credits`
- `GET /api/billing/invoices`
- `POST /api/billing/checkout`
- `POST /api/billing/portal`
- `POST /api/billing/webhook`

Suggested metering routes:

- `POST /api/metering/usage`
- `POST /api/metering/agent-step`
- `POST /api/metering/execution-chain`
- `POST /api/metering/memory`
- `POST /api/metering/audit`

## Build Order

### Phase 1

- finalize plan schema
- finalize entitlement schema
- finalize Stripe event contract

### Phase 2

- build subscription + credits backend
- build usage meter tables
- build cost visibility queries

### Phase 3

- expose billing pages
- expose usage pages
- add soft limits and alerts

### Phase 4

- add intelligence-usage billing
- add optimizer or premium routing billing

## Immediate Next Tasks

1. map plan ids to entitlement keys
2. define exact meter unit semantics
3. design hosted billing APIs
4. design usage dashboard widgets
5. define alert thresholds and soft-limit UX
