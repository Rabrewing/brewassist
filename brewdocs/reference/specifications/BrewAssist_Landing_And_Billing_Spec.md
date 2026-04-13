# BrewAssist Landing and Billing Spec

Updated: 2026-04-13

## Purpose

Normalize the public landing, pricing, and billing implementation so it matches what BrewAssist actually does today and what v1 still requires.

## Source Inputs

- `brewdocs/BrewAssist Landing Page-Pricing-v1.md`
- `brewdocs/mockups/landing-page.png`
- `brewdocs/mockups/pricing-page.png`
- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md`
- `brewdocs/reference/specifications/BrewAssist_Monetization_And_Team_Spec.md`
- `brewdocs/project/BrewAssist_V1_Execution_Plan.md`

## Product Truth

Public positioning must describe BrewAssist as:

- an AI-native DevOps control plane
- a workflow built around `Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay`
- a repo/provider-aware cockpit
- a sandbox-first execution system
- a policy-gated and replayable work surface
- a collaborative enterprise workspace with telemetry, reporting, and run handoff

Public positioning must not describe BrewAssist as:

- a generic chatbot
- instant live-repo automation without review
- fully production-complete provider/repo binding when that is not yet finished
- compliance-certified when the product is only compliance-oriented today

## Public IA

Signed-out flow should be:

1. Landing page
2. Pricing page
3. Legal/compliance disclosures
4. Auth entry
5. Tenant gate
6. Cockpit

## Landing Requirements

The landing page should communicate these sections in this order:

1. Hero
2. Control-plane explanation
3. Workflow stages
4. Product surfaces
5. Safety and governance
6. Collaboration and replay
7. Provider and sandbox model
8. Pricing CTA
9. FAQ
10. Footer/legal

## Hero Messaging

Hero copy should anchor to the real product:

- primary message: BrewAssist is an AI-native DevOps control plane
- supporting message: connect provider and repo context, work through a staged approval flow, execute safely in a sandbox-first model, and keep replayable reports for teams

Hero CTAs should be:

- `Start Free`
- `Book Enterprise Demo`

Avoid overusing "vibe coding" in the hero. It can appear lower on the page as a builder-oriented subtheme, but enterprise credibility and workflow clarity should lead.

## Core Capability Sections

Landing content should reflect these capability groups:

- Workflow Control Plane: intent, plan, preview, confirm, execute, report, replay
- Provider and Repo Context: provider selection, repo context, workspace scope
- Sandbox-First Execution: mirror-first reads and writes, diff-first changes, guarded apply
- Governance: policy gates, approvals, telemetry, audit-friendly reporting
- Collaboration: shared replay, collab notes, run handoff, right-rail team surfaces
- Enterprise Readiness: org/workspace model, RBAC/RLS direction, billing/admin controls

## Proof Points To Use

Current implementation that can be referenced:

- public landing/auth gate exists
- Supabase-backed auth and tenant bootstrap exist
- typed agent runtime is partially implemented
- replay history persists to `sessions`, `runs`, and `run_events`
- collab notes now persist as `collab.message` events and surface in replay/right rail

Implementation still in progress and should be described carefully:

- real provider OAuth/app installs and repo connect
- real sandbox binding lifecycle
- true diff/confirm/apply execution path
- production billing and plan enforcement
- production-hardened cookie/session exchange and enterprise SSO

## Pricing Principles

Pricing must align with product truth:

- BrewAssist itself is paid software
- hosted model usage may be metered separately
- BYO keys do not make the product free
- enterprise pricing covers governance, team controls, reporting, and support

## Pricing Page Structure

1. Plan comparison hero
2. Tier cards
3. Feature matrix
4. Billing/admin controls
5. Usage and metering explanation
6. Enterprise contact block
7. FAQ

## Initial Tier Model

Use placeholder commercial language until final pricing is approved, but structure the page around:

- Starter: individual builder or evaluator
- Pro: serious individual or small team
- Enterprise: org-wide governance, billing, and support

Plan copy should differentiate by:

- run volume or usage envelope
- collaboration depth
- reporting/replay retention
- governance and approval controls
- support and onboarding
- SSO/billing/admin capabilities

## Billing Scope

The first billing implementation should cover:

- plan selection UI
- billing account and subscription state
- org plan visibility
- usage visibility
- upgrade path from landing/pricing to authenticated org billing

It does not need to ship every advanced billing workflow on the first pass.

## Legal and Compliance Copy

Use careful language:

- say "SOC 2-oriented" or "designed for enterprise governance" rather than claiming certification unless confirmed
- say "supports audit-friendly reporting" rather than claiming full compliance coverage
- keep AI/data collection disclosures visible before sign-in

## Immediate Build Order

1. Fix auth/tenant blockers so signed-in users reliably pass tenant gating
2. Normalize public copy and section structure against this spec
3. Implement landing page using the supplied mockups as visual direction, not literal copy source
4. Implement pricing page and plan comparison
5. Add first billing/admin surfaces tied to org plan state
