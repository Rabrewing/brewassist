# BrewVerse UI Design Constitution (BrewAssist DevOps Cockpit)
Version: v1.0 (S4.10c.4 → S4.11 baseline)
Status: LOCKED (applies to all S4.11 UI work)

---

## 1) Prime Directive
BrewAssist must feel **enterprise-grade + cosmic-glass** at the same time:
- **Enterprise**: calm, legible, consistent, low-noise
- **BrewVerse**: glass, shimmer, aura edges, subtle dust — never loud gradients or toy UI

If a UI element feels playful, bubbly, or “mobile-game-ish,” it violates this constitution.

---

## 2) Visual DNA (Non-Negotiables)
### 2.1 Glass Language
All overlays, panels, and menus use:
- Translucent dark glass background
- Backdrop blur
- Thin stroke borders (blue/teal)
- Soft shadow depth
- Controlled glow (edge aura only)

### 2.2 “Cosmic Dust” Rule
Cosmic dust is **subtle texture**, not visible blobs:
- Allowed: faint radial gradients, low-opacity speckle/shine patterns
- Forbidden: thick gradient fills, rainbow slabs, neon pill stacks

### 2.3 Color Discipline
Gold + Teal are accents, not fills.
- Gold = “approval/primary/brand”
- Teal = “active/online/secondary highlight”
Use in strokes, icons, small highlights, focus rings.

---

## 3) Layout Constitution (S4.11)
### 3.1 Option A (Locked)
Right-edge **glass tab rail**:
- Tabs are icons only
- Clicking a tab opens a **floating glass overlay over the chat**
- Overlay must **NOT** resize or shift chat
- Overlay dismiss: outside click, ESC, click tab again

### 3.2 Customer vs Admin (Hard Gates)
**Customer Mode must include:**
- Action menu (+)
- HRM/LLM/AGENT/LOOP selector
- Tier badge + safe/locked indicators
- Help/Docs/History overlays (read-only where required)

**Customer Mode must NOT include:**
- Repo tree / file explorer
- Sandbox panels
- Cognition internals (engine states list)
- Dev-only labels like “Sandbox Available”

Admin Mode can show additional dev surfaces.

---

## 4) Component Behavior Constitution
### 4.1 Menus
- Menus are **compact glass dropdowns**
- Rows are icon + title + subtitle (where applicable)
- Close on outside click + ESC
- Never obscure the composer typing area

### 4.2 Buttons & Controls
- Avoid oversized pill buttons
- Prefer rounded-rectangle (10–14px radius)
- Hover = subtle lift + stroke brightening
- Active = minimal, controlled gold/teal hint

### 4.3 Scroll & Density
- Scroll is allowed, but UI must not feel cramped
- Use spacing + grouping before adding more controls
- Avoid “stacked layers of controls” competing for attention

---

## 5) Typography Constitution
- Titles: clear, compact, semi-bold
- Subtext: muted and smaller
- No loud letter spacing or novelty fonts inside cockpit UI
- Preserve readability at laptop widths

---

## 6) Motion Constitution
Motion must be **calm and short**:
- 120–180ms transitions
- Ease-out / smooth
- No bouncing, elastic overshoots, or flashy transforms
Overlay animation: fade + small lift only.

---

## 7) Accessibility & UX Guardrails
- Focus visible styles required (teal/blue ring)
- Hover states must not be the only indicator (keyboard support)
- ESC must close overlays and menus
- Click-outside must close overlays and menus
- No critical actions hidden behind hover-only affordances

---

## 8) “Professional Test” (Instant Pass/Fail)
A feature fails if:
- It looks like stacked neon pills or “bubble menu”
- It pushes/resizes the chat when it should overlay
- Customer Mode exposes dev internals
- A menu blocks typing or the send button
- Visual noise increases (too many accents, big gradients)

---

## 9) S4.11 Acceptance Gates (Must Pass All)
- [ ] Action menu (+) matches glass dropdown spec (no bubble stack)
- [ ] Right-edge icon rail tabs exist (Option A)
- [ ] Tab click opens overlay **over** chat (no layout shift)
- [ ] Outside click + ESC dismiss overlay/menu
- [ ] Customer Mode shows Action menu + Help/Docs/History overlays
- [ ] Customer Mode hides repo tree + sandbox + cognition internals
- [ ] Visual style consistent with BrewVerse glass + subtle aura

---

## 10) Implementation Boundaries (Gemini Rules)
- Do NOT add new features
- Do NOT change MCP logic
- Do NOT introduce permanent right sidebars
- Only adjust: CSS + conditional rendering + overlay behavior

---

## 11) Source of Truth
This constitution governs:
- Action menu styling
- Glass tabs / overlays
- Customer/Admin gating for right-side surfaces
- Any S4.11 UI adjustments
