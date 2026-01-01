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

- **Support Intelligence Engine**: Automated support event processing
  - Intake capture from multiple sources
  - Intelligent triage and routing
  - BrewDocs proposal generation from support issues
  - Daily digest with operational insights

- **Safety & Governance**:
  - Persona isolation and privacy protection
  - No auto-execution guarantees
  - S4 lock compatibility verification
  - CI hooks for integrity checking

### Technical Details

- New modules: `lib/brewdocs/`, `lib/support/`
- Storage: `.brewdocs/`, `.brewassist/support/`
- Scripts: `s5-brewdocs-verify.sh`, `s5-support-verify.sh`
- Tests: Comprehensive safety and compatibility suites

### Breaking Changes

- None - fully backward compatible

### Migration Notes

- Existing documentation remains unchanged
- Support events now automatically processed
- New proposal workflow available for documentation improvements

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
