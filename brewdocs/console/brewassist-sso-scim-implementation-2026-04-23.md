# BrewAssist SSO And SCIM Implementation Plan

**Date:** 2026-04-23  
**Updated:** 2026-04-23 13:42 America/New_York  
**Status:** Active implementation plan  
**Canonical upstream references:** `/home/brewexec/brew-agentic/brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`, `/home/brewexec/brew-agentic/brewdocs/specs/brewassist-console-connector-contracts-2026-04-22.md`, `/home/brewexec/brew-agentic/brewdocs/specs/brewassist-brew-agentic-page-registry-2026-04-21.md`

## Goal

Add enterprise identity capabilities to BrewAssist without replacing the current Supabase session and org bootstrap foundation.

## Current Reality

- Supabase session auth is live.
- Org/workspace bootstrap is live.
- Membership + RLS is the current tenant isolation baseline.
- Enterprise SSO, SCIM, and domain verification are not yet implemented.

## Canonical Rule

BrewAssist and Brew Agentic must not tell different enterprise-control-plane stories.

That means:

- enterprise identity lives in the hosted BrewAssist control plane
- Brew Agentic consumes hosted account and entitlement state
- enterprise login policy is tenant-scoped, not provider-scoped

## Recommended Order

### Phase 1

- `OIDC` or `SAML 2.0` enablement through the Supabase-compatible hosted path
- verified-domain records per org
- org-level identity provider records
- admin-only SSO setup surfaces in `/console/settings` and `/console/trust-center`

### Phase 2

- `SCIM` connector model
- provisioning token lifecycle
- deprovisioning and membership sync logs
- role mapping and invite restriction rules

### Phase 3

- customer-facing audit export
- login-policy enforcement by verified domain
- support/admin recovery workflow for broken IdP configs

## Initial Schema Direction

The first migration scaffold now includes:

- `org_identity_providers`
- `domain_verifications`
- `scim_connectors`

These tables are meant to persist tenant identity state under the same RLS/RBAC approach as the rest of the enterprise control plane.

## Current API Read Surfaces

- `GET /api/identity/sso/summary`
- `GET /api/security/enterprise-readiness`

These are read models only. They intentionally expose readiness and gaps before live SSO onboarding is wired.

## Setup Flags

Current readiness scaffolding looks for:

- `SUPABASE_SSO_OIDC_ENABLED`
- `SUPABASE_SSO_SAML_ENABLED`
- `SUPABASE_SCIM_ENABLED`
- `SUPABASE_SSO_DOMAIN_VERIFICATION_ENABLED`

These flags are not a replacement for real IdP setup. They only let the console tell the truth about what is configured.

## Enterprise Bar

Minimum identity posture for serious enterprise evaluation:

- `OIDC` and/or `SAML 2.0`
- verified domain controls
- tenant RBAC
- audit logging
- SCIM roadmap, then implementation
- admin recovery path

## Alignment Note

Pricing, billing, and entitlement messaging must continue following the shared upstream monetization specs from `brew-agentic/brewdocs/specs/`.
