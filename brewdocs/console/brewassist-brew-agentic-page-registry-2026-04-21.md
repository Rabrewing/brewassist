# BrewAssist + Brew Agentic Page Registry

**Date:** 2026-04-21  
**Updated:** 2026-04-21 10:05 America/New_York  
**Status:** Active planning spec  
**Depends on:** `brewdocs/specs/brewassist-console-domain-and-ia-2026-04-20.md`, `brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`

## Purpose

Act as the single source of truth for:

- public page inventory
- console page inventory
- legal and trust pages
- product-critical flows
- public-to-console alignment
- strict build order

Scope is intentionally limited to:

- BrewAssist
- Brew Agentic

Do not expand this registry into a broader BrewExec suite document.

## Product Boundary

### `brewassist.app`

Public product site and browser app entry.

### `console.brewassist.app`

Authenticated control plane for:

- BrewAssist web
- Brew Agentic managed access

### `brew-agentic`

Local runtime product that must be represented clearly on the public site and in the console.

## Current Repo Scaffolding Note

While BrewAssist still ships as a single Next.js app, the first hosted-console implementation may use `/console/*` routes in-repo.

Treat that as a temporary delivery detail only. The registry still maps to the eventual `console.brewassist.app` product boundary.

## Public Site Registry

### Homepage

Status: `in progress`

Purpose:

- position BrewAssist as the AI-native DevOps cockpit
- introduce Brew Agentic as the local runtime companion
- route users into pricing, signup, demo, and product detail

Required sections:

- hero
- what is BrewAssist
- capabilities
- local + browser workflow story
- security and trust
- how it works
- CTA

### BrewAssist Product Page

Status: `not started`

Purpose:

- explain the hosted/browser execution model
- explain the staged workflow
- explain why BrewAssist is the control plane

### Brew Agentic Page

Status: `not started`

Purpose:

- explain the local runtime
- explain how it connects to BrewAssist
- explain BYOK vs Brew-managed vs owner-direct in plain language

### Pricing

Status: `not started`

Purpose:

- explain plans
- explain platform fee
- explain BYOK vs managed
- explain usage visibility and cost controls

Dependencies:

- billing model
- provider routing model
- platform monetization model

### Start Free / Signup

Status: `not started`

Purpose:

- account entry
- onboarding trigger
- workspace bootstrap

### Book Demo

Status: `not started`

Purpose:

- enterprise conversion

### Features

Status: `not started`

Purpose:

- full capability breakdown across BrewAssist and Brew Agentic

### Security

Status: `not started`

Purpose:

- RLS
- RBAC
- audit
- encryption
- governance posture

### Integrations / Providers

Status: `not started`

Purpose:

- OpenAI
- Anthropic
- Gemini
- BYOK model
- managed model story

### API / Developer

Status: `not started`

Purpose:

- developer access
- integrations
- future programmatic usage

## Console Registry

### Overview Dashboard

Status: `not started`

Purpose:

- first screen after login

Components:

- usage snapshot
- workspace summary
- activity feed
- quick actions

### Command Center

Status: `not started`

Purpose:

- AI interaction
- execution stream
- workflow control surface

Components:

- prompt input
- execution logs
- multi-step workflows

### Workspaces

Status: `not started`

Purpose:

- project and environment management

### Brew Agentic

Status: `not started`

Purpose:

- manage local runtime connection

Components:

- connection status
- sync state
- execution bridge

### Usage & Logs

Status: `not started`

Purpose:

- transparency
- trust
- hosted usage truth

### Billing

Status: `not started`

Purpose:

- plans
- credits
- invoices
- usage charges

### Providers

Status: `not started`

Purpose:

- model routing
- BYOK keys
- managed provider access

### Support

Status: `not started`

Purpose:

- help
- issue reporting

### Settings

Status: `not started`

Purpose:

- profile
- organization
- permissions

### Trust Center

Status: `not started`

Purpose:

- security posture
- compliance posture
- AI transparency
- audit and governance explanations

## Legal + Trust Registry

### Terms of Service

Status: `partial`

### Privacy Policy

Status: `partial`

### Cookie Policy

Status: `not started`

### Accessibility Statement

Status: `not started`

### AI Transparency

Status: `not started`

Purpose:

- explain model behavior
- explain approvals and execution boundaries
- explain BYOK vs managed billing visibility

### Trust Center

Status: `not started`

Purpose:

- central trust hub
- security
- legal
- AI transparency
- governance positioning

## Critical Flows

### Onboarding

Status: `not started`

Steps:

1. signup
2. plan selection
3. workspace creation
4. first command

### Brew Agentic Connection

Status: `not started`

Steps:

1. install or connect runtime
2. authenticate
3. sync to console

### Issue Reporting

Status: `not started`

Steps:

1. user reports issue
2. AI assists
3. ticket created
4. follow-up

### Provider Setup (BYOK)

Status: `not started`

Steps:

1. add API key
2. validate
3. assign to workspace

## Navigation

### Top nav

- Product
- Brew Agentic
- Features
- Pricing
- Security
- Docs
- Login / Start Free

### Footer

- Terms
- Privacy
- Cookies
- Accessibility
- API
- Status
- Support

## Public To Console Mapping Rule

Every public page must map to a console destination or workflow.

| Public Page | Console / Flow |
| --- | --- |
| Pricing | Billing |
| Features | Command Center |
| Brew Agentic | Brew Agentic console page |
| Security | Trust Center |
| Signup | Onboarding |

This rule is mandatory.

Marketing and product cannot drift into unrelated stories.

## Priority Build Order

### Phase 1

1. Homepage
2. Pricing
3. Signup / Onboarding
4. Console Dashboard
5. Command Center

### Phase 2

6. Brew Agentic Page
7. Providers
8. Billing
9. Security

### Phase 3

10. Trust Center
11. AI Transparency
12. Support Flows

## Product Alignment Rules

1. Public landing must no longer talk as if BrewAssist is the only product.
2. Brew Agentic must be represented as a first-class product surface, not an afterthought.
3. BrewAssist remains the hosted control plane.
4. Brew Agentic remains the local runtime.
5. Pricing language must match the shared monetization model:
   - platform fee
   - optional usage-priced Brew intelligence
   - managed API margin
6. Public pricing must map directly to console billing views.
7. Security/trust messaging must map directly to Trust Center content.

## Immediate Use

Use this registry as the planning source before:

- pricing-page redesign
- console IA design
- Trust Center design
- Brew Agentic public-product page design
