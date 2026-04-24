# Enterprise Identity And Billing Phase Plan

**Date:** 2026-04-23  
**Updated:** 2026-04-23 13:42 America/New_York  
**Status:** Active

## Objective

Turn the current hosted control-plane scaffold into an enterprise-ready foundation for identity, trust, and billing without breaking the existing BrewAssist workflow or drifting from Brew Agentic’s canonical specs.

## Now In Scope

- enterprise identity readiness read model
- Stripe readiness read model
- Supabase schema scaffolds for identity and billing state
- console wiring for trust and billing setup truth
- documentation alignment to upstream Brew Agentic pricing and monetization specs

## Explicitly Not Yet In Scope

- live `SAML 2.0` or `OIDC` onboarding UX
- live `SCIM` provisioning sync
- live Stripe checkout
- live Stripe portal
- live webhook application logic
- customer-visible invoice history backed by Stripe

## New Build Order

1. Surface readiness truth in console and docs
2. Lock schema direction for enterprise identity and billing state
3. Configure Stripe and publish plan/price IDs
4. Implement checkout, portal, webhook verification, and local sync
5. Implement tenant SSO setup and verified-domain flows
6. Add SCIM and audit export

## Upstream Canonical Inputs

- `/home/brewexec/brew-agentic/brewdocs/specs/brew-managed-pricing-and-billing-policy-2026-04-20.md`
- `/home/brewexec/brew-agentic/brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`
- `/home/brewexec/brew-agentic/brewdocs/specs/brew-billing-metering-and-visibility-contracts-2026-04-21.md`
- `/home/brewexec/brew-agentic/brewdocs/specs/brewassist-console-connector-contracts-2026-04-22.md`

## Verification Expectations

- `pnpm typecheck`
- focused Jest coverage for readiness builders
- console routes should continue rendering without Stripe or SSO env configured
