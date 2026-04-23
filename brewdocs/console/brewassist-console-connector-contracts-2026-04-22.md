# BrewAssist Console Connector Contracts

**Date:** 2026-04-22  
**Updated:** 2026-04-22 09:35 America/New_York  
**Status:** Active planning spec  
**Depends on:** `brewdocs/specs/brewassist-console-domain-and-ia-2026-04-20.md`, `brewdocs/specs/brewassist-brew-agentic-page-registry-2026-04-21.md`, `brewdocs/specs/brew-billing-metering-and-visibility-contracts-2026-04-21.md`, `brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`

## Purpose

Define the concrete contract between:

- `brew-agentic` as the local runtime
- `console.brewassist.app` as the hosted account, billing, entitlement, and workspace control plane

This spec is the missing bridge between the console IA docs and eventual implementation in:

- Brew Agentic TUI and CLI
- BrewAssist console web app
- hosted control-plane APIs

## Product Boundary

### Brew Agentic owns

- local execution
- local provider invocation
- local BYOK storage
- local session state
- local workspace UX
- local offline behavior

### BrewAssist console owns

- account login
- hosted workspace membership
- plan and subscription state
- managed credits and invoices
- hosted entitlement truth
- managed provider/model allowlists
- Brew Agentic device/runtime registration

### Shared rule

The local client may cache or display hosted account state, but it must not invent authoritative billing, entitlement, or account truth locally.

## Connector Surfaces

The minimum hosted surfaces Brew Agentic should be able to consume are:

1. account session
2. workspace list and active workspace
3. entitlement summary
4. billing summary
5. credits summary
6. managed provider/model access summary
7. Brew Agentic runtime registration status
8. sync heartbeat / last-seen metadata

## Required Local Commands

The local runtime should eventually expose first-class account commands:

- `/account`
- `/billing`
- `/credits`
- `/workspace`
- `/workspaces`
- `/login`
- `/logout`
- `/agentic link`
- `/agentic unlink`

These may begin as status overlays or summary modals before becoming richer account-management flows.

## Authentication Model

### Hosted account auth

Recommended path:

- browser-based BrewAssist login
- Brew Agentic receives a short-lived local device/session artifact
- local client stores only the minimum session token material needed for hosted API calls

### Do not do this

- do not reuse provider auth tokens as Brew account auth
- do not mix OpenAI/Codex provider auth with Brew account auth
- do not make local BYOK keys the source of hosted identity

## Device / Runtime Registration

Each Brew Agentic installation should be represented as a registered local runtime.

Minimum fields:

- `runtime_id`
- `account_id`
- `workspace_id`
- `machine_label`
- `client_version`
- `platform`
- `last_seen_at`
- `linked_at`
- `link_state`

### Link states

- `unlinked`
- `link_pending`
- `linked`
- `revoked`

## Hosted Read Models

### Account summary

```json
{
  "accountId": "acc_123",
  "email": "owner@brewassist.app",
  "displayName": "Brew Owner",
  "plan": "pro",
  "accountStanding": "active",
  "ownerMode": true
}
```

### Workspace summary

```json
{
  "workspaceId": "ws_123",
  "name": "Default Workspace",
  "role": "owner",
  "billingMode": "hybrid",
  "active": true
}
```

### Entitlement summary

```json
{
  "platformAccess": true,
  "authSources": ["byok", "brew-managed"],
  "providers": ["openai", "gemini", "anthropic"],
  "models": {
    "openai": ["gpt-5.4", "gpt-5.4-mini"],
    "gemini": ["gemini-2.5-pro", "gemini-2.5-flash"]
  },
  "intelligenceMeters": {
    "agentStep": true,
    "executionChain": true,
    "memoryRetention": true
  }
}
```

### Billing summary

```json
{
  "plan": "pro",
  "platformFeeUsd": 99,
  "currentPeriodStart": "2026-04-01T00:00:00Z",
  "currentPeriodEnd": "2026-05-01T00:00:00Z",
  "managedSpendUsd": 18.42,
  "intelligenceSpendUsd": 7.15,
  "creditsRemainingUsd": 46.18
}
```

### Runtime registration summary

```json
{
  "runtimeId": "rt_123",
  "linkState": "linked",
  "workspaceId": "ws_123",
  "lastSeenAt": "2026-04-22T13:20:00Z",
  "version": "1.0.0"
}
```

## Recommended Hosted Endpoints

These are contract names, not final implementation routes.

- `GET /api/account/session`
- `GET /api/workspaces`
- `POST /api/workspaces/select`
- `GET /api/entitlements/summary`
- `GET /api/billing/summary`
- `GET /api/credits/summary`
- `GET /api/providers/managed-summary`
- `POST /api/runtimes/link`
- `POST /api/runtimes/unlink`
- `POST /api/runtimes/heartbeat`

## Local Cache Rules

Local client may cache:

- last account summary
- last workspace summary
- last entitlement summary
- last billing summary
- runtime registration state

Local client must refresh hosted state:

- on login
- on workspace switch
- on startup when online
- after billing-affecting actions
- after provider/auth-mode changes that affect managed access

## TUI / CLI Display Requirements

At minimum, the local client should visibly distinguish:

- local BYOK state
- owner-direct state
- hosted account login state
- workspace link state
- managed credit state
- plan tier
- current workspace

### `/providers` and status overlays should eventually show

- active hosted account or `not linked`
- current workspace
- billing mode
- allowed auth sources
- whether a model is allowed by hosted entitlement vs only available locally

## Failure States

The client must surface these conditions clearly:

- logged out from BrewAssist
- linked to no workspace
- workspace access revoked
- credits exhausted
- plan inactive
- managed model not entitled
- runtime link revoked
- console unreachable, local mode only

## Phased Implementation Order

### Phase A

- account session contract
- workspace summary contract
- runtime registration contract

### Phase B

- entitlement summary contract
- billing summary contract
- credits summary contract

### Phase C

- local account commands and overlays
- workspace switching in local runtime
- managed model gating in provider UI

### Phase D

- background heartbeat
- richer sync and audit history
- support/debug bundle for account-link issues

## Current Status

As of 2026-04-22:

- public-site and console IA are documented
- billing and metering contracts are documented
- local control-plane foundation exists in Brew Agentic
- hosted connector contracts were the missing piece and are now defined here
- actual hosted API implementation is still pending

