# BrewDocs Tiers Implementation

## Overview

BrewDocs implements a three-tier system for documentation management with increasing levels of automation and governance.

## Tier 1: Manual Documentation (Current)

- **Human-written**: All documentation created and maintained by humans
- **No automation**: Changes require manual editing
- **Governance**: Peer review and approval processes
- **Scope**: Static content, guides, references

## Tier 2: Assisted Documentation (Propose/Preview Layer)

- **AI-assisted proposals**: System generates documentation change suggestions
- **Human review required**: All proposals must be reviewed before application
- **Sandbox previews**: Changes can be previewed without affecting live docs
- **Sources**: Audit findings, support interactions, repo analysis

### Implementation

- **Proposal Engine**: `lib/brewdocs/proposals/engine.ts`
- **Diff Renderer**: `lib/brewdocs/diff/render.ts`
- **Validation**: Ensures no frozen surface modifications
- **Storage**: `.brewdocs/proposals/` with phase/source indexing

### Safety Guarantees

- Proposals are inert until approved
- Confidence scoring prevents low-quality suggestions
- Persona-based access control
- Audit trail of all proposals

## Tier 3: Governed Write Documentation (Apply Layer)

- **Controlled application**: Approved proposals can be applied to live docs
- **Governance required**: Multi-step approval process
- **Atomic writes**: Changes are reversible and logged
- **Integration**: Updates BrewLast and emits telemetry

### Implementation

- **Apply Engine**: `lib/brewdocs/apply/apply.ts`
- **Guards**: Permission and safety checks
- **Ledger**: Immutable audit trail with hashes
- **Backup**: Automatic rollback capability

### Safety Guarantees

- Admin-only application
- Explicit approval tokens required
- Frozen surface protection
- Full audit logging

## Human-in-the-Loop Requirements

1. **Tier 1**: Human creation, optional AI assistance
2. **Tier 2**: AI proposal generation, human review mandatory
3. **Tier 3**: Human approval required for application

## Integration Points

- **Support Intelligence**: Converts issues to documentation proposals
- **BrewLast**: Records documentation state changes
- **DevOps8**: Surfaces documentation status
- **S4 Lock**: Protects frozen surfaces from modification

## Future Evolution

- **Tier 4**: Autonomous documentation updates (post-S5)
- **Tier 5**: Self-healing documentation (post-S6)
- Enhanced ML-based proposal quality
- Cross-system documentation synchronization
