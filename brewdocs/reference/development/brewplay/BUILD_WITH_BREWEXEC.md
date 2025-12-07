# BrewExec Build‑With‑ChatG Playbook (Start‑to‑Finish)

A practical, repeatable workflow we’ll use together for every BrewVerse app (BrewSearch, BrewPulse, BrewUniversity, BrewLotto, ATS/CRM, etc.). This turns your Architect vision into a gated pipeline so we don’t skip wiring, DB/RLS, security, or tests.

---

## 0) North Star & Working Agreement (30–60 min)

**Goal:** Align on purpose, scope, and how we’ll collaborate.

**Inputs:**

- Vision one‑pager (why, who, outcomes)
- Success criteria (measurable)
- Timeline/constraints

**Outputs:**

- **Project Charter.md** (stored in repo `/brewdocs/project/charter.md`)
- **Definition of Ready (DoR)** and **Definition of Done (DoD)**
- Roles & tools (GitHub, Supabase, CI, environments)

**DoR checklist:**

- [ ] Problem + users clarified
- [ ] Metrics defined (e.g., TTFB < 300ms, 95% success on flow X)
- [ ] Data domains listed
- [ ] Security posture stated (PII? Multi‑tenant?)

---

## 1) Architecture & Data Design (Design Review Gate)

**Goal:** Lock the architecture before scaffolding.

**Outputs:**

- **System Diagram** (Frontends, APIs, Workers, DB, queues)
- **Data Model** (ERD + migrations plan)
- **Security Model** (RLS, RBAC roles, OAuth providers)
- **Contracts** (API/OpenAPI, Events, Context Cards)
- **Risks** with mitigations

**Deliverables (templates):**

- `/brewdocs/reference/architecture/ARCHITECTURE.md`
- `/brewdocs/reference/specifications/DATA_MODEL.md` (tables, indexes, constraints, ENUMs)
- `/brewdocs/reference/specifications/SECURITY_MODEL.md` (roles, RLS matrix)
- `/brewdocs/reference/specifications/CONTRACTS.md` (schemas, JSON examples)

**Design Gate—must answer:**

1. What user actions map to which write models/tables?
2. How do tenants isolate (RLS policies) and admins override (RBAC)?
3. What are auth flows (email, OAuth, service tokens, webhooks)?
4. What is our migration/rollback story?

---

## 2) Scaffolding & Environments

**Goal:** Create a clean skeleton that enforces structure from day one.

**Tasks:**

- Repo init with standard dirs: `/app`, `/components`, `/lib`, `/api`, `/db`, `/brewdocs`, `/tests`
- Environment strategy: `.env.local`, `.env.dev`, `.env.prod` with example file `.env.example`
- CI init (GitHub Actions): lint, typecheck, test, build
- Secret management policy (e.g., 1Password/GitHub Secrets)

**Artifacts:**

- `/brewdocs/reference/development/ENVIRONMENTS.md`
- `.github/workflows/ci.yml` (lint + tests + build)

---

## 3) Data Layer First (DB + Migrations + Seed)

**Goal:** Build the foundation (schema + migrations) before UI.

**Tasks:**

- Author initial **SQL migrations** (Supabase/Prisma or SQL files) in `/db/migrations`
- Seed scripts: `/db/seed`
- Performance basics: primary keys, foreign keys, unique constraints, indexes on lookups

**Checklist:**

- [ ] Tables created with NOT NULL where appropriate
- [ ] FK constraints + onDelete rules
- [ ] Indexes on frequent filters
- [ ] Migration names timestamped & reversible

**Deliverables:**

- `/brewdocs/project/DB_CHANGELOG.md` (every migration summarized)

---

## 4) Security Hardening Pass (RLS/RBAC/OAuth) — **Do Not Skip**

**Goal:** Lock the door before moving in.

**RLS Matrix:**

- Roles: `anon`, `authenticated`, `user`, `recruiter`, `client_admin`, `platform_admin`
- For each table: SELECT/INSERT/UPDATE/DELETE policies per role

**Template (Supabase‑style RLS):**

```sql
-- Example: applications table
alter table public.applications enable row level security;

create policy "tenant_can_read_their_apps"
  on public.applications for select
  using (tenant_id = auth.jwt() ->> 'tenant_id');

create policy "owner_can_modify_own_app"
  on public.applications for update
  using (created_by = auth.uid());
```

**RBAC:**

- Map UI features to roles (matrix table in `/brewdocs/reference/specifications/SECURITY_MODEL.md`)
- Admin override endpoints audited to `security_audit_logs`

**OAuth:**

- Providers (Google/GitHub/Microsoft)
- Callback URL whitelist
- PKCE + CSRF protections documented

**Deliverables:**

- `/brewdocs/reference/specifications/RLS_MATRIX.md`
- `/brewdocs/reference/specifications/RBAC_MATRIX.md`
- `/brewdocs/reference/specifications/AUTH_FLOWS.md`

**Security Gate—must show:**

- Policies compiled + tested
- Least‑privilege verified on all CRUD routes

---

## 5) “Wiring Week” (Contracts & Integrations)

**Goal:** Connect UI ↔ API ↔ DB with typed contracts before feature grind.

**Tasks:**

- Define API routes + OpenAPI spec (`/brewdocs/reference/specifications/openapi.yaml`)
- Implement server handlers with input validation (Zod/Yup)
- Client SDK generated from OpenAPI (typed)
- Event contracts (webhooks, audit events)

**Artifacts:**

- `/lib/api/client.ts` (generated)
- `/brewdocs/reference/specifications/EVENTS.md` (event types, payloads)

**Wiring Gate:**

- E2E path demoed for **one** golden flow (login → create → read → update → delete)

---

## 6) Feature Slices (Thin Vertical Increments)

**Goal:** Ship vertical slices behind feature flags.

**Slice Template:**

1. Update schema/migration if needed
2. Add/adjust RLS & RBAC
3. Implement API (with contract tests)
4. Implement UI (with integration tests)
5. Seed + fixtures
6. Observability hooks (logs/metrics)

**Definition of Done (per slice):**

- [ ] Tests passing (unit + integration + e2e where applicable)
- [ ] Security checks (RLS/RBAC) validated
- Docs updated (API, ERD, user guide in /brewdocs/reference/specifications)

---

## 7) Testing Strategy (What we actually run)

**Unit:**

- Pure functions, adapters, hooks

**Integration:**

- API ↔ DB using test container
- RLS policy tests (positive + negative cases)

**E2E:**

- Critical paths (auth, create candidate, submit application, admin review)
- Voice/UX flows (BrewAssist triggers)

**Non‑functional:**

- Performance budget (Lighthouse/TTFB)
- Security (ZAP/OWASP checks)
- Accessibility (axe)

**Artifacts:**

- `/tests/` organized by layer
- `/brewdocs/tests/TEST_PLAN.md`

---

## 8) CI/CD & Branch Rituals

**Branching:**

- `main` (prod), `develop` (staging), feature branches `feat/*`

**PR Template (snippet):**

```md
## Why

Closes #123 — brief description

## What Changed

- Feature A
- Migration 2025_09_21_add_applications

## Tests

- [ ] Unit
- [ ] Integration
- [ ] E2E

## Security

- [ ] RLS/RBAC updated
- [ ] Secrets unaffected

## Screenshots / Loom
```

**CI gates (required to merge):**

- Lint + typecheck
- Unit + integration tests
- RLS test suite
- Build succeeds

**CD:**

- Staging auto‑deploy on `develop`
- Manual prod promote with changelog

---

## 9) Observability & Operations

**Goal:** Know when it breaks and why.

**Minimum:**

- Structured logs with request IDs
- Error tracking (Sentry/TrackJS)
- Metrics (API latency, DB slow queries)
- Audit logs for security‑sensitive actions

**Runbooks:**

- `/brewdocs/reference/development/RUNBOOKS/*.md` (outages, hotfix, rollback)

---

## 10) Release & Acceptance

**Artifacts:**

- Release notes (`/brewdocs/project/RELEASE_NOTES.md`)
- Migration diff + RLS diff
- Demo script + acceptance checklist

**Acceptance Gate:**

- Stakeholder demo passes
- Monitoring green for 24h

---

## 11) Maintenance & Iteration

- Weekly hardening pass (security + performance)
- Backlog triage (bugs/features)
- Debt budget (10–20%)
- Quarterly architecture review

---

# Working With ChatG (Who Does What)

**You (Architect/Owner):**

- Approve gates, provide business rules, set priorities
- Request RFCs when scope is fuzzy

**ChatG (PM/Architecting Copilot):**

- Draft charters, RFCs, diagrams, schemas, RLS/RBAC matrices
- Generate migrations, seed scripts, OpenAPI specs, test scaffolds
- Review diffs, produce PR comments, write runbooks

**Ceremonies (lightweight):**

- **Kickoff** (Step 0)
- **Design Review** (end Step 1)
- **Wiring Demo** (end Step 5)
- **Release Readiness** (end Step 10)

---

# Reusable Templates & Snippets

## RLS Policy Matrix Table (example)

| Table        | Role           | SELECT         | INSERT | UPDATE    | DELETE | Notes           |
| ------------ | -------------- | -------------- | ------ | --------- | ------ | --------------- |
| applications | user           | ✓ (own tenant) | ✓      | ✓ (owner) | ✗      | Owner edit only |
| candidates   | recruiter      | ✓ (tenant)     | ✓      | ✓         | ✗      | No hard delete  |
| audit_logs   | platform_admin | ✓              | ✗      | ✗         | ✗      | Read‑only       |

## Supabase Policy Skeleton

```sql
-- Replace table_name and role conditions
alter table public.table_name enable row level security;

create policy "role_can_select"
  on public.table_name for select
  using (auth.jwt() ->> 'role' in ('user','recruiter'));

create policy "owner_update"
  on public.table_name for update
  using (created_by = auth.uid());
```

## Migration File Naming

```
/db/migrations/
  2025_09_21_1200_init.sql
  2025_09_21_1215_add_candidates.sql
  2025_09_21_1300_add_applications.sql
```

## Test Pyramid Targets

- Unit: >80% critical modules
- Integration: all APIs with DB
- E2E: golden paths + one error path per feature

---

# Quick Start (Day 1 Checklist)

1. Create `/brewdocs/project/charter.md`, `/brewdocs/reference/architecture/ARCHITECTURE.md` drafts
2. Confirm roles & RLS matrix outline
3. Scaffold repo + CI
4. Author initial migrations + seed
5. Implement auth + one protected route
6. Run security hardening pass
7. Wire golden flow end‑to‑end
8. Lock DoD and enable PR template

---

# Appendix: RFC Template

```md
# RFC: <Title>

Date: YYYY‑MM‑DD  
Owner: <name>  
Status: Draft | Accepted | Rejected

## Problem

## Goals / Non‑Goals

## Proposal

- Architecture
- Data model changes
- RLS/RBAC impact

## Alternatives Considered

## Risks & Mitigations

## Rollout Plan

- Migrations
- Feature flag
- Backout
```

---

Use this playbook as the single source of truth. For each Brew project, we’ll clone it, tweak the RLS matrix/table set, and run the same gates so nothing falls through the cracks again.
