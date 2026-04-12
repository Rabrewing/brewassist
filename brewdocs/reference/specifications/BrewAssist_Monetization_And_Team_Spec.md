# BrewAssist Monetization and Team Capabilities Spec

## Goal

Define how BrewAssist makes money as an online provider while supporting hosted model usage, bring-your-own keys, and enterprise team workflows.

## Pricing Principle

BrewAssist is a paid product in every deployment mode.

## Pricing Modes

1. **Hosted BrewAssist**
   - Customer pays an application subscription.
   - Customer also pays usage-based model/provider charges for hosted keys.

2. **Bring-Your-Own Keys**
   - Customer still pays an application subscription.
   - Customer uses their own API keys for model usage.
   - BrewAssist may still charge a platform or orchestration fee.

3. **Enterprise Contract**
   - Subscription + seat/org pricing or annual contract.
   - Includes team controls, audit, support, and usage governance.

## Non-Negotiables

- The app itself has a base price.
- BYO keys do not make the application free.
- Hosted provider usage has separate consumption cost.
- Team and enterprise features should be priced above the base app subscription.

## Product Components

- usage metering
- billing dashboard
- key management
- provider mode selection
- provider authentication and repo selection
- limits / quotas
- org and team management
- audit trail for usage and access
- team collaboration surfaces: chat, presence, reporting, session handoff
- screen-share launch / meeting entry points

## Team Capabilities

- orgs, teams, roles, and permissions
- shared workspaces
- repo/project access policy
- provider-linked repo access and sandbox mirroring
- usage visibility per team/org
- admin billing controls
- support / operator roles
- collaborative review workflows and report snapshots

## Questions To Resolve

- exact base subscription price
- hosted token/unit pricing
- BYO platform fee structure
- seat-based vs org-based enterprise pricing
- free trial and metering thresholds
- how local `brew-agentic` licensing interacts with online BrewAssist

## Cross References

- `brewdocs/project/BrewAssist_V1_Execution_Plan.md`
- `brewdocs/reference/specifications/BrewAssist_Hybrid_Control_Plane_Spec.md`
- `brewdocs/project/BrewAssist_Go_Live_Blueprint.md`
