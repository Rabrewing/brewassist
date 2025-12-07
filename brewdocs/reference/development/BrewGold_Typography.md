# ⭐ BrewGold Typography System (Official Spec)

This document outlines the canonical, locked-in BrewGold Typography System. It is the official brand standard for all BrewVerse products, including BrewAssist, BrewPulse, and BrewExec.

---

## 1. Logo / Emblem Typeface

- **Font:** Great Vibes (Script)
- **Usage:**
  - BrewAssist cursive variants
  - BrewGold brand signature strokes
  - Hero accent text
  - Emblem sub-lines and ornamentation
- **Identity:** This is the shimmer script that gives BrewGold its elegance and premium identity.

---

## 2. Heading Typeface

- **Font:** Montserrat (Bold / Semi-Bold)
- **Usage:**
  - Dashboards
  - Cockpit headers
  - Sidebar section titles
  - Cards + feature titles
  - Buttons (uppercase / spaced lettering)
- **Identity:** This is the clean, modern structural foundation used across all BrewVerse products.

---

## 3. Body Typeface

- **Font:** Inter (Regular / Medium)
- **Usage:**
  - Logs
  - Narration
  - Modal text
  - Settings
  - Dynamic content
  - Anything long-form or UI-heavy
- **Identity:** Inter is the industry standard for clarity and legibility in DevOps dashboards.

---

## 🟡 The BrewGold "Look"

The typography works in concert with the broader BrewGold design system:

- **BrewGold Color:** `#FFD700`
- **Backgrounds:** Soft Black / Abyss Black
- **Accents:** Teal glow (BrewTeal `#00C7B7`)
- **Highlights:** LED White
- **Gradients:** Cosmic gradients (navy/abyss → black)

Combined, the BrewGold typography style feels:
- Premium
- Futuristic
- Clean
- Command-center oriented
- Instantly recognizable as a BrewVerse design.

---

## 🧷 Usage Rules (Official Brand Guide)

#### Headlines
- **Font:** Montserrat ExtraBold / Bold
- **Size Range:** 24px – 48px
- **Spacing:** Slight tracking (+2%–4%)
- **Case:** UPPERCASE for cockpit-level headers

#### Subheaders
- **Font:** Montserrat SemiBold
- **Size:** 14px – 18px
- **Color:** BrewTeal or LED White (low opacity)
- **Case:** Uppercase or Title Case

#### Body Text
- **Font:** Inter Regular
- **Size:** 13px – 15px
- **Line-height:** 1.55–1.7

#### System / Log Text
- **Font:** Inter Medium / Regular
- **Color:** LED white with 85% opacity
- **Style:** Must look like a high-end monitoring console.

#### Signature Text (Accent Only)
- **Font:** Great Vibes
- **Usage:** Used VERY sparingly to avoid noise.
- **Examples:** "Cockpit", "The Architect of Gold", Hero screens, Key brand pages.

---

## 🎨 Quick Example of BrewGold Font Stacking

```css
:root {
  --font-logo: "Great Vibes", cursive;
  --font-heading: "Montserrat", sans-serif;
  --font-body: "Inter", sans-serif;
}

/* Headers */
h1, h2, .cockpit-title {
  font-family: var(--font-heading);
  font-weight: 700;
}

/* Body */
body, p, span {
  font-family: var(--font-body);
}

/* Signature / Accent */
.signature-text {
  font-family: var(--font-logo);
  font-size: 2rem;
  color: #FFD700;
}
```

---

## 🏛 BrewGold Typography Summary (Commit-Ready)

| Purpose                  | Font       | Weight            |
| ------------------------ | ---------- | ----------------- |
| Branding / Signature     | Great Vibes| Regular           |
| Headers / UI Labels      | Montserrat | Bold / Semi-Bold  |
| Body / Logs / Forms      | Inter      | Regular / Medium  |
| Console / System Output  | Inter      | Medium            |
