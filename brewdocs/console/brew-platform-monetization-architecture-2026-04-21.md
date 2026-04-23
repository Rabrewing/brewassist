# Brew Platform Monetization Architecture

**Date:** 2026-04-21  
**Updated:** 2026-04-21 09:15 America/New_York  
**Status:** Canonical business-model spec  
**Depends on:** `brewdocs/specs/brew-managed-pricing-and-billing-policy-2026-04-20.md`, `brewdocs/specs/brew-managed-console-and-go-live-2026-04-19.md`, `brewdocs/specs/brewassist-console-domain-and-ia-2026-04-20.md`

## Purpose

Define the shared monetization model for:

- BrewAssist web
- Brew Agentic local runtime
- the shared Brew control plane

This is the canonical answer to:

- what Brew charges for
- how BYOK fits into monetization
- how managed AI fits into monetization
- how usage-priced intelligence should work
- what language both products should use publicly

## Core Truth

Brew is **not** primarily selling tokens.

Brew is selling:

- an intelligence platform
- orchestration and routing
- execution workflows
- memory and audit surfaces
- trust, visibility, and operational control

Token resale is only one monetization layer.

## Canonical 3-Layer Revenue Model

### 1. Platform Fee

This always applies.

Even when the customer uses BYOK.

Customers are paying for:

- orchestration engine
- provider routing and fallback logic
- BrewAssist intelligence layer
- Brew Agentic execution engine
- workflow UX
- policy, audit, replay, and trust surfaces

Canonical framing:

> The customer may bring their own model fuel, but they are still paying for the Brew platform and vehicle.

### 2. Usage-Priced Brew Intelligence

This is the second monetization layer.

It may apply to both BYOK and Brew-managed customers.

This is where Brew monetizes platform compute and orchestration rather than raw model tokens.

Candidate billable dimensions:

- agent steps
- execution chains
- memory writes or retained memory volume
- audit scans
- premium routing logic
- deep research passes
- tool executions where Brew infrastructure bears real cost

This layer should be introduced carefully and visibly.

### 3. Managed API Margin

This applies only when the customer uses Brew-managed provider access.

In that case:

- Brew pays upstream vendor costs
- Brew applies its own managed price card
- Brew-managed usage is billed through hosted credits or subscription-linked billing

This is valuable, but it should not be treated as the only revenue strategy.

## Canonical Product Matrix

| Capability | BYOK | Owner-Direct | Brew-Managed |
| --- | --- | --- | --- |
| Platform fee | Yes | No customer billing | Yes |
| Intelligence usage fee | Optional | No customer billing | Optional |
| Token/provider cost | Customer pays vendor | Owner pays vendor | Brew pays vendor |
| Managed token margin | No | No | Yes |
| Routing/orchestration | Yes | Yes | Yes |
| Memory/audit/trust | Yes | Yes | Yes |
| Profit source | Platform + usage | none from customer | Platform + usage + margin |

## What This Means Practically

### BYOK is still monetizable

BYOK does **not** mean:

- free product
- free orchestration
- free memory
- free audit
- free collaboration

BYOK means only:

- the customer pays the upstream model vendor directly
- Brew does not mark up provider token costs

Everything else can still be part of the platform business model.

### Managed AI is a convenience and margin layer

Managed AI should be sold as:

- simpler onboarding
- no vendor key management
- centralized billing
- curated provider/model access
- predictable controls

It should not be the only way Brew makes money.

## V1 Monetization Recommendation

### Required for V1

1. Platform subscription
2. BYOK support
3. Hosted usage tracking dashboard
4. Soft usage limits and alerts
5. Managed AI credit system

### Strong V1.5 Differentiators

1. Smart routing cost optimizer
2. Cost-vs-performance profile controls
3. Explainable routing and model choice
4. audit and memory insights

### Later monetization expansion

1. usage-priced agent execution
2. usage-priced audit or compliance scans
3. memory storage tiers
4. premium orchestration modes

## Recommended Pricing Narrative

Both BrewAssist and Brew Agentic should use the same public language:

### Canonical wording

- Brew is paid software in every meaningful deployment mode.
- Bring-your-own keys remove upstream model charges from the Brew invoice.
- Bring-your-own keys do **not** remove the Brew platform fee.
- Brew-managed access adds convenience, centralized billing, and managed model access.
- Owner-direct usage is operationally visible but excluded from customer managed billing totals.

### Avoid saying

- “BYOK is free”
- “we just charge for tokens”
- “managed AI is the main product”
- “local mode avoids the Brew platform fee”

## Canonical Tier Logic

### Starter

BYOK-first.

Characteristics:

- lower platform fee
- no managed-token margin unless customer opts in
- lower execution depth
- lighter memory and audit limits

### Pro

Hybrid.

Characteristics:

- platform fee
- BYOK or Brew-managed access
- deeper execution
- stronger memory and audit usage
- better routing controls

### Enterprise

Full platform.

Characteristics:

- contract pricing
- governance
- compliance and audit
- advanced routing controls
- workspace and team admin
- SSO and support

## Cost Visibility Requirements

This is mandatory for trust.

Users should be able to see:

- provider used
- model used
- request cost
- whether usage was BYOK or Brew-managed
- agent steps or execution depth used
- memory or audit actions used where billed

### Canonical principle

If cost visibility is weak, trust breaks and pricing feels arbitrary.

## What Brew Already Has

Current alignment already in code/specs:

- BYOK support exists
- owner-direct exists
- Brew-managed exists as a hosted control-plane concept
- billing accounts exist in the local control-plane foundation
- entitlement allowlists exist
- managed price cards exist
- credit ledgers exist
- Stripe event ledgers exist
- provider telemetry now distinguishes:
  - `byok`
  - `owner-direct`
  - `brew-managed`
  - `external-auth`
- owner-direct usage is already excluded from customer managed billing totals

## What Is Still Missing

To fully match this business model, Brew still needs:

### Platform fee layer

- real hosted plan enforcement
- plan-to-entitlement mapping
- seat or workspace subscription logic

### Intelligence usage layer

- metering for agent steps
- metering for execution chains
- metering for memory usage
- metering for audit/deep-analysis usage
- pricing policy for platform compute events

### Trust layer

- hosted cost visibility panel
- usage estimates and alerts
- soft-limit UX

## Canonical Billing Separation

### BYOK

- shows platform subscription
- may show platform usage charges if enabled
- does not show Brew token/provider markup

### Brew-managed

- shows platform subscription
- may show platform usage charges
- shows managed provider/model usage and credit consumption

### Owner-direct

- operationally logged
- never counted as customer managed revenue
- never mixed into customer Stripe billing

## Implementation Order

1. Keep the 3-layer language identical across BrewAssist and Brew Agentic specs
2. Build the hosted platform subscription and entitlement layer
3. Build the cost visibility panel
4. Add soft limits and alerts
5. Add intelligence-usage metering after trust surfaces exist

## Immediate Decision

Yes, Brew is set up in the **right direction** for this monetization model.

No, it is **not fully productized yet**.

The architecture already supports the split.

The next work is to finish:

- platform subscription enforcement
- hosted cost visibility
- platform-intelligence usage metering

## Cross-Product Rule

BrewAssist and Brew Agentic must not tell different monetization stories.

They are two clients of the same Brew platform.

Public and product language should stay aligned around this exact model:

1. platform fee
2. optional usage-priced Brew intelligence
3. managed API margin
