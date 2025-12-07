# BrewAssist Sandbox Sync Policy
Applies To: BrewAssist.app (SaaS), BrewAssist Local Dev, BrewAssist Chain  
Scope: Internal — Do Not Expose to Customers

## Overview
The sandbox is a **virtual project mirror**.  
It must sync from the real project under strict, controlled events.

## Sync Triggers
### The sandbox syncs ONLY on:
1. **User loads BrewAssist Cockpit** (initialization)
2. **User switches active project**
3. **User requests a patch review**
4. **BrewAssist requests internal rebuild** (HRM, Identity, Risk Engine)
5. **Corrupted sandbox detection** (auto-reset)

### The sandbox does *not* sync when:
- Customer writes text  
- Customer clicks preview  
- Customer browses directories  
- BrewAssist is mid-operation  
- The customer refreshes the page  

Those create instability and nondeterministic patch behavior.

---

## Sync Behavior
### 1. Full Sync (Cold Build)
Performed on:
- First-time setup  
- After corruption  
- After identity or HRM mode shift  

Actions:
- Delete old sandbox
- Copy project root → sandbox root
- Rebuild caches
- Reinitialize BrewLast state snapshot

### 2. Partial Sync (Warm Build)
Performed when:
- Switching directories  
- Generating patches  
- Replaying BrewLast state  

Actions:
- Replace only modified files
- Maintain sandbox working memory  

---

## File Types Never Synced
These files are excluded to protect both systems:

**Excluded Patterns**

node_modules/ .next/ .log .env .cache/ dist/ coverage/ .lock files

**Reason:**  
Sandbox must remain minimal, fast, and clean.

---

## Sandbox Integrity Rules
### Rule 1 — Sandbox never writes to real project  
All writes are redirected to `/sandbox/active/`.

### Rule 2 — Sandbox is disposable  
If anything breaks → 100% rebuild.

### Rule 3 — Restore from BrewLast  
Sandbox must restore previous session memory before making new changes.

### Rule 4 — HRM and Identity engines gate all operations  
If HRM fails → sandbox halts.  
If Identity fails → sandbox refuses to run patches.

---

## SaaS Model Behavior
Each customer gets:
- Their own sandbox instance  
- Isolated FS (no cross-customer access)  
- Independent BrewLast  
- Restricted APIs  

Customers never see sandbox internals.
