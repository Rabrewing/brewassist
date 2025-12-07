# BrewAssist Sandbox API Surface (v2)
Status: Stable
Visibility: Internal Only

These API endpoints allow BrewAssist to interact with the sandbox.

All are internal — NOT customer-facing.

---

## `/api/brewassist-sandbox-apply`
Runs patch changes inside sandbox.

### Accepts:
```json
{
  "path": "string",
  "code": "string"
}
```
### Returns:
- success/failure
- updated BrewLast snapshot
- diff preview

---

## `/api/brewassist-sandbox-debug`
Runs internal diagnostics:
- file existence
- sync validation
- HRM safety checks
- identity drift detection

---

## `/api/brewassist-sandbox-maintenance`
Handles:
- sandbox wipe
- rebuild
- warm sync
- cold sync

Triggered when corruption or HRM gate fails.

---

## `/api/fs-tree`
Returns:
- root directory tree for UI
- safe filtered list (no sensitive files)

---

## `/api/fs-read`
Read-only file access.
Used for:
- Preview pane
- Diff display

---

## NOT ALLOWED IN SANDBOX
- rm -rf behavior
- direct shell execution
- cross-project access
- environment variable mutation

Everything must route through HRM + Identity gates.
