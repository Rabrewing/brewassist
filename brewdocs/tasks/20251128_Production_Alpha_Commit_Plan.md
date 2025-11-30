# BrewAssist Engine v2 — Production Alpha Commit Plan

**Trigger:** All S4.4, S4.5, and S4.6 tests GREEN.  
**Branch:** main  
**Tag:** v2.0.0-alpha (optional)

---

## 1. Pre-Commit Checklist

- [ ] `pnpm lint` → PASS  
- [ ] `pnpm test` (or minimal suite) → PASS  
- [ ] `pnpm typecheck` → PASS  
- [ ] `curl /api/brewassist-health` shows:
  - `personaStatus.enabled = true`
  - `sandbox.ready = true`
  - `identityStatus.enabled = true`
  - `hrmStatus.enabled = true`
- [ ] Latest sandbox maintenance run:
  - `riskLevel != HIGH`

---

## 2. Git Status Review

```bash
git status
# confirm only expected files are changed
```

If any stray files in `sandbox/`, `home/`, or local artifacts:
- [ ] Remove or ensure they are ignored.



---

## 3. Commit

```bash
git add .
git commit -m "BrewAssist Engine v2: Identity + HRM v3 + Sandbox self-repair (Production Alpha)"
```


---

## 4. Push

```bash
git push origin main
```

Optional tag:
```bash
git tag v2.0.0-alpha
git push origin v2.0.0-alpha
```


---

## 5. Post-Commit Tasks

- [ ] Update `brewdocs/BrewUpdates.md` with S4.6 completion entry.
- [ ] Snapshot `/api/brewassist-health` JSON and save under `brewdocs/reference/health_snapshots/20251128_production_alpha.json`.
- [ ] Note commit SHA in:
  - `brewdocs/PROGRESS_SUMMARY.md`
  - BrewUniversity documentation (later).