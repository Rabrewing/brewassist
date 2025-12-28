# 🔷 GEMINI EXECUTION PROTOCOL (G.E.P.)

## Task ID: **BREWASSIST-S4.11-UX-CLEANUP**

**Mode:** Strict G.E.P.
**Scope:** UI / UX / Layout only
**No new features. No logic expansion. No refactors beyond layout & presentation.**

---

## 🎯 OBJECTIVE (NON-NEGOTIABLE)

Stabilize and clean BrewAssist UI after **S4.10c.4 completion**, preparing for **S4.11 Tab Infrastructure** without adding logic.

**This task exists to REMOVE clutter, FIX layout drift, and ENFORCE separation between:**

* Customer experience
* Admin / Dev experience
* MCP tools
* Sandbox
* Cognition surfaces

---

## 🧭 CURRENT PHASE TRUTH

* **S4.10c.4 is COMPLETE**

  * BrewDocs add-on integrated
  * DevOps 8 Principles panel integrated
  * Capability registry live
  * Deprecated files moved to `/deprecated/*.bak`
  * All tests passing, committed

* **We are now executing S4.11 (Layout & UX only)**

❌ **Do NOT implement**:

* Repo auth
* MCP execution logic
* Wizards
* Support Intelligence
* BrewLast
* BrewOps automation

---

## 🧩 OPTION A — LOCKED DESIGN DECISION

**Option A is FINAL and LOCKED**

> **Right-edge icon-only folder tabs → glass overlay panels**

No inline stacking
No words on the rail
No persistent right column for customers

---

## 🧱 REQUIRED UI STRUCTURE (AUTHORITATIVE)

### 1️⃣ LEFT SIDE (MCP TOOLS)

**Applies to both Customer & Admin**

* MCP Tools remain **left**
* MCP buttons **do not execute**
* MCP buttons open **Guide / Explain state only**
* MCP tools must never “do nothing”

If not wired:

* Show guide text
* Show “Coming soon” badge
* Allow “Send to BrewAssist” prompt

---

### 2️⃣ CENTER (PRIMARY WORK AREA)

**The only permanent workspace**

* Chat / prompt input
* File previews (Admin only)
* BrewAssist responses
* Action Menu (+) attached here

❌ No Sandbox
❌ No Cognition states
❌ No Repo tree

---

### 3️⃣ RIGHT EDGE — FOLDER TAB RAIL (ICON-ONLY)

**Always icons, never text**

Allowed tabs by mode:

#### Customer Mode

* Docs
* Help / Guide
* History (read-only)

❌ Files
❌ Sandbox
❌ Cognition internals

#### Admin / Dev Mode

* Files (repo tree)
* Sandbox
* Cognition
* Docs
* History

Each tab:

* Opens **glass overlay panel**
* One panel at a time
* Click outside closes

---

### 4️⃣ GLASS OVERLAY PANEL RULES

* Floating
* Transparent / blurred
* Scrollable internally
* NOT resizing the center pane
* NOT stacking vertically

---

### 5️⃣ ACTION MENU (+ BUTTON)

**Customer-facing, clean, minimal**

* Styled like modern command palette
* No dev terms
* No raw tool names
* Descriptive, human labels

Examples:

* Upload file
* Attach screenshot
* Ask BrewAssist to analyze
* Use deep reasoning
* Compare with web research

---

## 🚫 EXPLICITLY FORBIDDEN IN THIS TASK

Gemini **must not**:

* Add tabs logic
* Add routing
* Add persistence
* Add repo auth
* Add MCP execution
* Add new settings
* Add onboarding flows
* Add BrewLast hooks

If tempted → STOP.

---

# ✅ UX ACCEPTANCE CHECKLIST — S4.11 (MANDATORY)

Gemini must self-validate **every item** before declaring completion.

---

## 🟢 GENERAL UI

* [ ] No horizontal overflow at any viewport size
* [ ] No duplicated panels
* [ ] No nested scroll bars fighting each other
* [ ] No text truncation in action menu
* [ ] No layout jumps when panels open/close

---

## 🟢 CUSTOMER MODE

* [ ] Repo tree is **not rendered**
* [ ] Sandbox is **not visible**
* [ ] Cognition internals are **hidden**
* [ ] MCP tools open guide/help (never dead)
* [ ] Action Menu (+) is visible and usable
* [ ] UI reads as “assistant”, not “IDE”

---

## 🟢 ADMIN / DEV MODE

* [ ] Repo tree appears **only** inside Files tab
* [ ] Sandbox appears **only** inside Sandbox tab
* [ ] Cognition states appear **only** inside Cognition tab
* [ ] No admin elements leak into customer view
* [ ] Mode toggle does not break layout

---

## 🟢 RIGHT-SIDE TABS (OPTION A)

* [ ] Tabs are icon-only
* [ ] Hover tooltips exist
* [ ] Active tab is visually distinct
* [ ] Only one panel open at a time
* [ ] Clicking backdrop closes panel
* [ ] Panels do not resize center content

---

## 🟢 ACTION MENU

* [ ] Visual style matches cockpit theme
* [ ] Items have title + subtitle
* [ ] No raw technical wording exposed to customers
* [ ] Menu never covers input text
* [ ] Menu closes cleanly on selection or outside click

---

## 🟢 DEVOPS 8 PRINCIPLES PANEL

* [ ] Visible only in Admin / Dev context
* [ ] Read-only
* [ ] Scrollable independently
* [ ] Does not dominate vertical space
* [ ] Acts as reference, not control surface

---

## 🟢 STABILITY CHECK

* [ ] Reload does not break layout
* [ ] Switching modes does not duplicate panels
* [ ] No console errors
* [ ] No unused UI rendered off-screen

---

## 🧾 DEFINITION OF DONE (STRICT)

S4.11 is DONE when:

* UI feels **clean, intentional, and calm**
* Customers never see dev internals
* Admins never feel constrained
* Nothing feels “temporary” or “hacky”
* The system is visually ready for S5.x without rewrites

---

If you want next:

* **GEP for S4.12 (UI Behavior Fix Pack)**
* **GEP for S4.13 (Mode Wizards)**
* **Appendix: BrewDocs Tier 2 & 3 Specs**

Just say which one to drop.
