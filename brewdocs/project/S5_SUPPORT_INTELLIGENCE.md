# S5.6 Support Intelligence Hardening

## Overview

The Support Intelligence system provides observational-only intelligence from support interactions. It captures, evaluates, and triages support traces for human review, generating read-only insights without any automated execution or fixes. All actions are deferred to human operators and S6+ phases.

## Components

### 1. Support Trace Intake (`lib/support/intake.ts`)

Captures every support/help interaction and normalizes into SupportTrace format.

**Responsibilities:**

- Normalize support interactions
- Sanitize PII
- Validate required fields
- Append-only, deterministic

**Required Fields:**

- persona, cockpitMode, activeMode, capabilityIds[], input, response, devOps8Snapshot, brewTruthScore, flags, timestamp

### 2. BrewTruth Evaluation (`lib/support/evaluate.ts`)

Attaches quality evaluation to each SupportTrace for support assessment only.

**Outputs:**

- trustScore (0-1)
- riskTier (low/medium/high)
- confidenceDelta
- flags[]

### 3. Support Triage Engine (`lib/support/triage.ts`)

Classifies traces into exactly one category with confidence threshold.

**Categories (EXACTLY ONE):**

- DAILY_RESOLVABLE
- SANDBOX_MAINTENANCE_CANDIDATE
- PHASE_RELEASE_CANDIDATE
- RISK_BLOCKER

**Rules:**

- No overlap
- No automation
- Confidence >= 0.6 required

### 4. Filesystem Persistence (`lib/support/store.ts`)

Stores triaged traces in append-only logs.

**Targets:**

- /support-intel/daily.log
- /support-intel/unresolved.log
- /support-intel/candidates.log
- /support-intel/deferred.log

### 5. BrewDocs Proposal Bridge (`lib/support/brewdocs-bridge.ts`)

Converts PHASE_RELEASE_CANDIDATE traces into read-only Tier 2 proposals.

**Process:**

- Generate proposal objects only
- No writes to docs
- Admin-only visibility

### 6. Daily Digest Generator (`lib/support/digest.ts`)

Creates deterministic daily summaries for human review.

**Contents:**

- Critical risks
- Recurring issues
- Suggested actions (non-executing)

## Safety and Governance

### Observational Only

- **No Auto-Fix**: Zero automated execution or fixes
- **Human-in-the-Loop**: All insights require explicit human action
- **Read-Only Operations**: No mutations to system state
- **Deferred Execution**: All actions postponed until S6+

### Isolation and Privacy

- **Persona Scoping**: Strict isolation between personas
- **PII Sanitization**: Automatic redaction of sensitive data
- **No Customer Visibility**: Support traces never exposed to customers
- **Append-Only Persistence**: Immutable log storage

## Integration Points

### BrewDocs (Read-Only)

- **Tier 2 Proposals**: Generated but not applied
- **No Direct Writes**: Proposals remain in memory/objects

### Filesystem Storage

- **Append-Only Logs**: /support-intel/ directory
- **Survives Restart**: Persistent across sessions
- **No Database**: Filesystem-based only

### DevOps8 Compatibility

- **Snapshot Integration**: Includes DevOps8 data in traces
- **No Direct Coupling**: Observational data only

### S4 + S5 Lock Guards

- **Frozen Surfaces Untouched**: No modifications to locked areas
- **Guard Compliance**: Cannot bypass existing protections

## Operational Flow

1. **Intake**: Capture and normalize support traces
2. **Evaluate**: Attach BrewTruth quality assessment
3. **Triage**: Classify into governance categories
4. **Store**: Persist in filesystem logs
5. **Bridge**: Generate read-only BrewDocs proposals
6. **Digest**: Create daily human-readable summaries
7. **Review**: Human operators assess and act (deferred to S6+)

## Governance Metrics

- **Trace Coverage**: 100% of support interactions captured
- **PII Protection**: Zero PII leaks in logs
- **Triage Consistency**: Deterministic classification
- **Proposal Quality**: Human-validated proposal generation

## S6+ Deferred Actions

- Execution of RISK_BLOCKER resolutions
- Application of SANDBOX_MAINTENANCE_CANDIDATE patches
- Implementation of DAILY_RESOLVABLE fixes
- Activation of PHASE_RELEASE_CANDIDATE features
- Automated proposal application to BrewDocs
