# Live Build‑Log Mandate (Every 30 Seconds Update .md files)

### Purpose

Guarantee a steady, truthful stream of build updates so coding and debugging never outrun documentation. Applies to **new files**, **bugfixes**, **migrations**, **RLS changes**, and **refactors**.

## 🔁 Cadence & Trigger Rules

- **Cadence:** Log **every 30 seconds** while actively coding/debugging.
- **Idle Grace:** If no meaningful change occurred, log a **“No‑Diff Heartbeat”** with current focus and blockers.
- **Auto‑Create:** If no log file exists for the task, **create it immediately** on first update.
- **Rotate on Scope Change:** When scope shifts (new file/feature/issue), **close current log** and **open a new one**.

## 📁 File & Path Conventions

- Root folder: `/brewdocs/logs/`
- Task‑scoped log file pattern:
  `LOG_<project>_<scope|issue-id>_<YYYY-MM-DD>_<HHmm-ET>.md`
- One **active** log per scope; reference prior logs in a **Links** section.

## 🧱 Log Entry Template (append every 30 secs)

```md
### ⏱️ <HH:mm:ss ET> — <1‑line status>

**Context:** <file(s) being touched, feature/bug, branch>
**Diff Summary:** <changed/added/removed at a high level>
**Tests:** <new/updated; pass/fail; coverage touchpoints>
**DB/RLS:** <schema/migration IDs; policies touched; risk>
**Perf/Sec/Acc:** <perf budget, ZAP/OWASP notes, axe findings>
**Truth Check:** Factual %: ** | Logical %: ** | Bias %: ** | **Truth Index:** **
**Risks/Blockers:** <what could break / what’s blocking>
**Next 2‑Minute Target:** <micro‑goal before next tick>
```

## 🧪 Testing & Gates (per active scope)

- Unit for new pure logic; Integration for API↔DB; E2E for golden path.
- **RLS Gate:** At least one **positive** and one **negative** policy test per table touched.
- **Wiring Demo:** Keep an up‑to‑date `curl` or `HTTPie` snippet to prove the flow.

## 🔐 Security & Compliance

- **No secrets/PII** in logs. Redact or reference secret names only.
- Add a **Security Delta** line whenever auth/RLS/RBAC changes.
- Log **migrations** with filenames and checksums.

## 🧭 Tie‑ins

- **Truth Engine Protocol:** Each entry computes a Truth Index; drop below **60%** → **Pause coding**, gather evidence, update plan.
- **Release Notes:** End of day, auto‑summarize log into `/docs/RELEASE_NOTES.md`.

## ✅ Close‑Out Checklist (when finishing a scope)

- [ ] Final log entry with status (Done / Deferred / Aborted)
- [ ] Tests green and linked
- [ ] RLS policies listed and validated
- [ ] Migrations merged and DB_CHANGELOG updated
- [ ] PR link + screenshots

---

## 🔧 Universal Prompt: Live Build Log + Truth Guard

Use this **system prompt** across any AI assistant to enforce the 2‑minute logging mandate and truth discipline.

```text
SYSTEM — Enforce Live Build‑Log Mandate
You are a build scribe + critical reviewer. While I code or debug:
1) Every 2 minutes, append an entry to the active Markdown log using the provided template. If none exists, create one following the naming convention. If no material change, write a “No‑Diff Heartbeat.”
2) Apply the Truth Engine Protocol with dual personas (Grump + Sage). Compute Factual %, Logical %, Bias %, and Truth Index for each entry. If Truth Index < 60% or Bias > 20%, stop cheerleading, demand evidence, and propose next steps to raise the score.
3) Track DB schema/RLS changes, migrations, tests (unit/integration/E2E), and wiring proofs. Always list risks, blockers, and the next micro‑goal.
4) Rotate logs when scope changes; never mingle unrelated work. Never leak secrets.
5) On scope completion, produce a Close‑Out Checklist and a summary suitable for RELEASE_NOTES.
Follow a kind‑but‑firm tone (Sage) and a blunt critique (Grump). Honesty over harmony.
```

## 💬 Example “No‑Diff Heartbeat”

```md
### ⏱️ 14:06:00 ET — No code change

**Context:** /lib/supabase.ts — refactor plan
**Diff Summary:** Planning next steps; no commits yet
**Tests:** None
**DB/RLS:** No change
**Perf/Sec/Acc:** N/A
**Truth Check:** Factual 70 | Logical 65 | Bias 10 | **Truth Index:** 62
**Risks/Blockers:** Unclear rollback for new client factory
**Next 2‑Minute Target:** Draft migration plan + rollback notes
```

## 🧩 Optional Automation Hooks

- Git pre‑commit hook: prevent commit if >4 minutes since last log line.
- VS Code task: status bar timer with “Log due” signal.
- CI step: fail PR if day’s active scope lacks a Close‑Out Checklist.

**File:** `/docs/LIVE_BUILD_LOG_MANDATE.md`
**Status:** Adopt across all BrewVerse projects.
