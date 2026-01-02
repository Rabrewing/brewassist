# BrewAssist Changelog

## S5.6 - BrewDocs Tier 2 & 3 + Support Intelligence Engine

### Added

- **BrewDocs Tier 2 (Propose/Preview)**: AI-assisted documentation proposals with human review
  - Proposal engine with confidence scoring
  - Unified diff rendering and validation
  - Frozen surface protection
  - Proposal storage with phase/source indexing

- **BrewDocs Tier 3 (Apply/Governed Write)**: Controlled documentation application
  - Permission-gated apply engine
  - Atomic writes with rollback capability
  - Immutable audit ledger with hash verification
  - Multi-step approval process

- **Support Intelligence Hardening**: Observational support trace processing
  - SupportTrace intake and normalization
  - BrewTruth evaluation for quality assessment
  - Deterministic triage into governance categories
  - Filesystem-based append-only persistence
  - Read-only BrewDocs Tier 2 proposal generation
  - Daily digest for human review

- **Safety & Governance**:
  - Observational-only operations (no execution)
  - Human-in-the-loop enforcement
  - PII sanitization and persona isolation
  - S4/S5 lock compatibility guards
  - CI verification for silent writes and governance

### Technical Details

- New modules: `lib/support/` (evaluate.ts, store.ts, etc.)
- Storage: `support-intel/` (daily.log, unresolved.log, etc.)
- Scripts: `s5-support-verify.sh` (updated for governance)
- Tests: Safety guards and lock compatibility suites

### Breaking Changes

- None - fully backward compatible

### Migration Notes

- Existing documentation remains unchanged
- Support traces now captured observationally
- Proposals generated read-only for human review
- All execution deferred to S6+ phases

---

## S5.0 - BrewLast v1 Foundation

### Added

- BrewLast filesystem snapshot system
- Session state persistence
- Customer mode write blocking
- Integration with BrewAssist engine

### Technical Details

- New module: `lib/brewlast/`
- Atomic file writes with rollback
- TypeScript interfaces for state management

---

## S4.0 - Foundation Lock

### Added

- Complete persona and capability system
- DevOps8 operational intelligence
- Cockpit UI with tabbed interface
- Comprehensive testing and validation

### Locked Surfaces

- Personas, capabilities, DevOps8 meanings, cockpit structure
- Automated integrity guards implemented

---

## S3.0 - Previous Phase

_Legacy phase - foundation established_
