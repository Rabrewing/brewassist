# BrewAssist Enterprise Security And Trust Readiness

**Date:** 2026-04-23  
**Status:** Active implementation reference  
**Purpose:** Define the minimum enterprise-grade security, identity, trust, and compliance posture BrewAssist needs in order to be taken seriously in customer environments.

## Core Position

Enterprise buyers do not trust AI software because it looks polished.

They trust it when they can verify:

- who can access it
- what data it can reach
- how tenant isolation works
- what gets logged
- how billing and provider access are controlled
- how incidents are handled
- whether the vendor has a credible security program

For BrewAssist, this means both:

1. enterprise security for the company and hosted platform
2. product security for the browser control plane, sandbox path, and Brew Agentic bridge

## Identity And Access Management

### Required for enterprise-readiness

- SSO support for enterprise identity providers
- support at minimum for:
  - `SAML 2.0`
  - `OIDC / OpenID Connect`
- MFA support
- RBAC tied to org and workspace membership
- least-privilege admin model
- session timeout and device/session revocation
- audit trail for identity-sensitive actions

### Strongly recommended next

- SCIM provisioning and deprovisioning
- Just-In-Time provisioning
- domain verification
- group-to-role mapping
- IP allowlists for admin surfaces

### BrewAssist implication

Current Supabase session auth is a valid foundation, but not sufficient alone for enterprise sales. Enterprise trust usually expects SAML/OIDC federation and then SCIM shortly after.

## Tenant Isolation And Data Boundaries

### Required

- strong org/workspace isolation
- documented fail-closed behavior for unsupported cross-repo access
- row-level access controls enforced in the data plane
- separate handling for:
  - hosted account data
  - workspace data
  - sandbox data
  - provider credentials
- explicit data-retention and deletion behavior

### BrewAssist implication

The current org/workspace model and fail-closed cross-repo rule are good signals. These need to be documented as customer-facing trust guarantees and backed by tests.

## Secrets And Key Management

### Required

- customer secrets never exposed to the browser
- Brew-managed provider keys never exposed to customers or Brew Agentic
- server-side secret storage only
- secret rotation procedure
- access review for secret-bearing systems
- break-glass and emergency revocation process

### Strongly recommended

- KMS-backed encryption for stored sensitive material
- customer-managed key roadmap if targeting high-security enterprise buyers later
- provider key inventory and usage attribution

### BrewAssist implication

The managed-provider contract is now explicit:

- raw vendor keys stay server-side
- browser gets Brew session only
- Brew Agentic gets a short-lived Brew runtime token, not the provider key

## Logging, Auditability, And Forensics

### Required

- audit logs for:
  - login and logout
  - workspace membership changes
  - role changes
  - provider access changes
  - billing-sensitive actions
  - runtime link/unlink
  - sandbox apply / live execution events
- replay/report continuity for governed workflows
- tamper-resistant logging posture
- security event review process

### Strongly recommended

- SIEM export path
- structured security logging and event schemas
- alerting for high-risk admin actions

### BrewAssist implication

Replay and run events are already a strong product-security differentiator. They should be expanded into a security story, not left as an internal implementation detail.

## Application And Product Security

### Required

- secure-by-default configuration
- secure sandbox boundaries
- output-escaping and input validation discipline
- dependency and SCA scanning
- secrets scanning
- CI security checks
- vulnerability triage SLA
- secure code review process
- production change management

### Strongly recommended

- third-party penetration test before serious enterprise rollout
- documented remediation workflow
- public vulnerability disclosure channel
- SBOM generation or roadmap

### BrewAssist implication

The product should be positioned as secure-by-design, not just compliant-by-marketing. Sandbox-first execution, preview/confirm gates, and explicit replay already help here if backed by tests and policy enforcement.

## Infrastructure And Operations

### Required

- encryption in transit
- encryption at rest
- backup and restore process
- incident response plan
- disaster recovery expectations
- uptime/status communication path
- production environment segregation
- role-based access to infrastructure and data stores

### Strongly recommended

- routine access reviews
- production change approval trail
- infrastructure hardening baselines
- region and residency roadmap if enterprise buyers ask for it

## Compliance And Trust Program

### Recommended sequence

1. Security page and Trust Center with honest product-state disclosures
2. DPA, subprocessor list, privacy notice, AI/data-use disclosure
3. internal security program and evidence collection
4. SOC 2 Type I
5. SOC 2 Type II
6. ISO 27001 later if market pressure justifies it

### Only add when applicable

- HIPAA only if targeting regulated health data and willing to sign BAAs
- PCI scope only if payment flow architecture puts BrewAssist in scope beyond Stripe-hosted surfaces

### Core buyer expectation

For most B2B SaaS enterprise deals, `SOC 2 Type II` is the real trust threshold, with SSO/SCIM, audit logs, DPA, and incident/security documentation expected around it.

## Customer-Facing Trust Surfaces

These should exist in visible form:

- Trust Center
- security overview page
- status page
- privacy policy
- terms
- subprocessors page
- AI transparency / data handling page
- billing transparency page
- support / incident contact path

## Product-Specific Enterprise Expectations For BrewAssist

Because BrewAssist is an AI-native control plane, buyers will ask extra questions about:

- what data is sent to model providers
- whether prompts, code, and outputs are retained
- whether retained data is used for training
- how BYOK differs from Brew-managed
- how local Brew Agentic and hosted BrewAssist split responsibilities
- whether raw provider keys ever leave Brew servers
- how approvals, previews, and reports reduce unsafe automation

These answers must be explicit, consistent, and documented.

## What Is Already Partially Present In BrewAssist

- Supabase-backed auth and tenant identity foundation
- org/workspace scoping
- row-level access direction
- replay and run-event persistence
- collab event persistence
- sandbox-first execution direction
- fail-closed cross-repo rule
- staged enterprise workflow:
  `Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay`

## Highest-Priority Gaps

### Must address before serious enterprise motion

- SAML / OIDC SSO
- SCIM roadmap
- real Trust Center content
- Stripe-backed billing controls for enterprise-grade transparency
- stronger hosted audit surfaces
- managed-provider proxy implementation
- runtime token issuance instead of any raw provider-key distribution
- security documentation set:
  - DPA
  - subprocessors
  - security contact / incident policy
  - retention and deletion policy

### Must address before security review feels credible

- penetration testing
- dependency/security scanning in CI
- formal incident response process
- vulnerability disclosure process
- test coverage for auth, billing summaries, entitlement summaries, provider gating, and runtime linking

## Recommended Build Order

1. SSO architecture decision: Supabase-compatible OIDC/SAML path
2. hosted account, entitlement, billing, credits, and provider-summary APIs
3. managed-provider proxy and runtime token issuance
4. Trust Center content and customer-facing security docs
5. Stripe setup for subscriptions, credits, invoices, and portal
6. expanded security and billing test suite
7. external pen test and SOC 2 evidence collection

## Bottom Line

If BrewAssist wants enterprise trust, it needs more than “AI works.”

It needs:

- enterprise identity
- tenant isolation
- server-side key handling
- auditable execution
- visible cost and provider controls
- security documentation
- a credible compliance path

SAML 2.0 is part of that, but not the whole story.
