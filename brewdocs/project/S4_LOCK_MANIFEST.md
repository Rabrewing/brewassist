# S4 Lock Manifest

**Phase Stamp:** S4 LOCK
**Commit Hash:** [To be filled at lock time]
**Date:** [To be filled at lock time]

## Frozen Surfaces (No Changes Allowed)

The following code surfaces are locked and cannot be changed without breaking S4 Lock tests:

### 1. Personas

- **File:** `lib/brewIdentityEngine.ts`
- **Frozen:** persona definitions (admin, dev, support, customer), side mappings, default cockpit modes
- **No Changes:** persona semantics, risk profiles, default modes

### 2. Capability Semantics

- **File:** `lib/capabilities/registry.ts`
- **Frozen:** capability IDs, intent categories, minTier, personaAllowed, sandboxRequired, confirmApplyRequired
- **No Changes:** capability meanings, gating rules, action permissions

### 3. DevOps8 Meanings

- **File:** `lib/devops8/semantics.ts`
- **Frozen:** DevOps8 principle IDs, labels, signal meanings
- **No Changes:** DevOps8 operational semantics

### 4. Cockpit Structure

- **Files:** `components/WorkspaceSidebarRight.tsx`, tab registry
- **Frozen:** cockpit layout, right panel tabs, admin/customer visibility
- **No Changes:** panel structure, tab ordering, visibility rules

## Required Green Checks

S4 Lock is valid only if all commands pass:

- `pnpm lint` - ESLint passes
- `pnpm typecheck` - TypeScript compilation succeeds
- `pnpm test` - All unit tests pass
- `pnpm test:ui` - All UI tests pass
- `pnpm audit:capabilities` - No missing capability IDs
- `pnpm build` - Production build succeeds

## No-Change Clauses

1. **No new personas** without updating all tests and documentation
2. **No new capabilities** without registry entry and full test coverage
3. **No DevOps8 changes** without semantics test updates
4. **No cockpit layout changes** without UI gating test updates
5. **No tier/rule changes** without matrix test failures

## Evidence Links

- Lock Report: `brewdocs/project/S4_LOCK_REPORT.md`
- Policy Tests: `tests/policy/handshake.policy.matrix.test.ts`
- UI Gating Tests: `tests/ui/ActionMenu.gating.test.tsx`, `tests/ui/MCPToolsSidebar.gating.test.tsx`, `tests/ui/RightPanel.tabs.visibility.test.tsx`
- Semantics Tests: `tests/devops8/semantics.lock.test.ts`
- Tab Registry Test: `tests/ui/rightPanel.registry.test.ts`

## Emergency Override

In case of critical security fix or blocking bug, S4 Lock can be temporarily lifted by:

1. Updating this manifest with override reason
2. Updating affected tests
3. Re-running full lock check
4. Documenting in lock report
