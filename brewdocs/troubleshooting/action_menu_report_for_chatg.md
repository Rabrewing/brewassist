```css
/* ================================
   styles/cockpit-action-menu.css
   ================================ */

/* --- 1) Design Tokens (limit color + shape drift) --- */
:root {
  /* Core glass */
  --brew-glass-bg: rgba(10, 16, 26, 0.88); /* Increased alpha */
  --brew-glass-bg-2: rgba(12, 18, 30, 0.80); /* Increased alpha */
  --brew-glass-blur: 14px;

  /* Borders / strokes */
  --brew-stroke: rgba(65, 140, 255, 0.18);
  --brew-stroke-strong: rgba(65, 140, 255, 0.28);

  /* Shadows (depth, not “pop”) */
  --brew-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);

  /* Text */
  --brew-text: rgba(245, 248, 255, 0.92);
  --brew-muted: rgba(245, 248, 255, 0.60);

  /* Accents (sparingly) */
  --brew-gold: rgba(255, 215, 0, 0.92);
  --brew-teal: rgba(0, 199, 183, 0.90);

  /* Radii (NO big pills) */
  --brew-radius-panel: 14px; /* max for panel */
  --brew-radius-row: 10px;   /* row hover background */
  --brew-radius-icon: 10px;

  /* Spacing */
  --brew-pad-panel: 10px;
  --brew-row-pad-y: 10px;
  --brew-row-pad-x: 12px;

  /* Typography */
  --brew-title-size: 0.88rem;
  --brew-subtitle-size: 0.72rem;
  --brew-letterspace: 0.02em;

  /* Motion */
  --brew-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --brew-dur: 140ms;
}

/* --- 2) Hard “Anti-Blob” Constraints ---
   Apply this class to the menu container or root of the popup.
   (It prevents huge pill look and loud gradients.)
*/
.brew-action-menu,
.brew-action-menu * {
  /* Kill big bubble vibe */
  border-radius: inherit;
}

/* The root anchor for the button and menu */
.brew-action-anchor {
  position: relative;
  display: inline-flex; /* To contain the absolute menu */
  align-items: center;
  gap: 10px;
}

/* The + button */
.brew-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: rgba(10, 18, 30, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--brew-gold); /* BrewGold trace */
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(120, 200, 255, 0.08);
  color: var(--brew-teal); /* BrewTeal + sign */
  font-size: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 120ms ease, box-shadow 140ms ease, border-color 140ms ease, background 140ms ease, color 140ms ease;
}
.brew-action-btn:hover {
  border-color: rgba(0, 150, 150, 0.4);
  background: rgba(0, 10, 20, 0.7);
  color: rgba(0, 150, 150, 0.9);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.55),
    0 0 0 3px rgba(80, 160, 255, 0.12),
    inset 0 0 0 1px rgba(120, 200, 255, 0.10);
  transform: translateY(-1px);
}
.brew-action-btn:active {
  transform: translateY(0px);
}

/* Dropdown menu panel */
.brew-action-menu {
  position: absolute;
  z-index: 50;
  width: min(360px, 92vw);
  padding: var(--brew-pad-panel);
  background: linear-gradient(180deg, var(--brew-glass-bg), var(--brew-glass-bg-2));
  border: 1px solid var(--brew-stroke);
  border-radius: var(--brew-radius-panel);
  box-shadow: var(--brew-shadow);
  backdrop-filter: blur(var(--brew-glass-blur));
  -webkit-backdrop-filter: blur(var(--brew-glass-blur));
  overflow: hidden;
  bottom: calc(100% + 10px);
  transform-origin: 80% 100%;
  animation: brewMenuIn var(--brew-dur) var(--brew-ease) both; /* Corrected: brewMenuIn */
  outline: 1px solid rgba(255, 215, 0, 0.06);
}

.brew-action-menu::before { /* Optional dust shimmer */
  content: "";
  position: absolute;
  left: 0;
  bottom: 46px;
  width: 320px;
  z-index: 60;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(
    180deg,
    rgba(0, 10, 20, 0.7),
    rgba(0, 10, 20, 0.6)
  );
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow:
    0 26px 70px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  padding: 10px;
  transform: translateY(10px);
  opacity: 0;
  animation: brewMenuIn 160ms ease forwards;
}

/* Animation: calm lift */
 @keyframes brewMenuIn { /* Corrected: brewMenuIn */
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* --- 3) Row List Layout (icon + title + subtitle) --- */
.brew-action-list { /* Now acts as <ul> container */
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0; /* Handled by margin-bottom on li */
  margin: 0;
  padding: 0;
  list-style: none;
}

.brew-action-item { /* Now acts as <li> wrapper */
  list-style: none;
  margin-bottom: 6px; /* Space between list items */
}
.brew-action-item:last-child {
  margin-bottom: 0;
}

.brew-action-item-btn { /* The actual clickable button */
  width: 100%;
  display: grid; /* For icon + text layout */
  grid-template-columns: 38px 1fr;
  gap: 10px;
  align-items: center;
  padding: var(--brew-row-pad-y) var(--brew-row-pad-x);
  border-radius: var(--brew-radius-row);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  user-select: none;
  text-align: left;
  transition:
    background var(--brew-dur) var(--brew-ease),
    border-color var(--brew-dur) var(--brew-ease),
    transform var(--brew-dur) var(--brew-ease);
}
.brew-action-item-btn:hover { /* Hover on button */
  background: rgba(0, 10, 20, 0.4);
  border-color: rgba(0, 150, 150, 0.3);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.2); /* Subtle gold glow */
  transform: translateX(1px);
}
.brew-action-item-btn:active { /* Active on button */
  background: rgba(255, 215, 0, 0.06);
  border-color: rgba(255, 215, 0, 0.22);
  transform: translateY(0);
}
.brew-action-item-btn:focus-visible { /* Focus on button */
  outline: 2px solid rgba(0, 199, 183, 0.35);
  outline-offset: 2px;
}
.brew-action-item-btn[disabled] { /* Disabled button */
  opacity: 0.6; /* Increased for readability */
  cursor: not-allowed;
}
.brew-action-item-btn[disabled]:hover { /* Disabled button hover */
  background: transparent;
  border-color: transparent;
  transform: none;
  box-shadow: none;
}

/* --- 4) Icon container (no bubble pills) --- */
.brew-action-icon {
  width: 38px;
  height: 38px;
  border-radius: var(--brew-radius-icon);
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(65, 140, 255, 0.14);
  color: var(--brew-text);
}
.brew-action-item-btn:hover .brew-action-icon { /* Hover on button affecting icon */
  border-color: rgba(0, 199, 183, 0.22);
  box-shadow: 0 0 0 1px rgba(0, 199, 183, 0.08) inset;
}

/* --- 5) Text treatment --- */
.brew-action-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  min-width: 0;
}
.brew-action-title {
  font-size: var(--brew-title-size);
  letter-spacing: var(--brew-letterspace);
  color: var(--brew-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.brew-action-subtitle {
  margin-top: 3px;
  font-size: var(--brew-subtitle-size);
  color: var(--brew-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- 6) Divider --- */
.brew-action-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 6px 6px;
}

/* --- 7) “No loud gradient slabs” guardrails --- */
.action-pill, .pill, .menu-pill, .bubble-item {
  border-radius: var(--brew-radius-row) !important;
  background: transparent !important;
}

/* --- 8) Positioning helpers --- */
.brew-action-menu--above-composer {
  bottom: calc(100% + 10px);
  left: 0;
}
.brew-action-menu--right-align {
  right: 0;
  left: auto;
}

/* --- 9) Backdrop (click-outside area) --- */
.brew-action-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
  background: transparent;
}

/* ===== NO GRADIENTS ALLOWED (composer + menu) ===== */
.brew-action-btn, .brew-action-menu, .brew-action-menu * {
  background-image: none !important;
  filter: none !important;
}
.brew-action-btn::before, .brew-action-btn::after, .brew-action-menu::before, .brew-action-menu::after {
  background-image: none !important;
}

/* --- PROBLEM AREAS FOR CHATG ---
  1. The "ActionMenu popup is still not showcasing the pills right inside it"
     This refers to the "⚠" and "sandbox" badges. These use the class '.mcp-badge'
     which is *not* defined in any of the CSS files I have. This means they likely
     have no styling, and thus can contribute to overlapping or invisibility.
     The structure rendering these is in components/ActionMenu.tsx:
     {policy.requiresConfirm && <span className="mcp-badge">⚠</span>}
     {policy.requiresSandbox && <span className="mcp-badge"> sandbox </span>}

  2. "The tab with the plus sign is still barely visible"
     This refers to the '.brew-action-btn'. Its styling is above. It has a
     'border: 1px solid var(--brew-gold);' and 'color: var(--brew-teal);'.
     The hover state darkens the background and subtly changes border/text color.
     The 'background: rgba(10, 18, 30, 0.72);' is quite dark.
     The 'border' itself might be too thin or the colors too subtle for visibility.
     The outer anchor '.brew-action-anchor' is 'display: inline-flex;'.

  3. Overall transparency / "ugly" look:
     While I have increased the alpha of '--brew-glass-bg' and '--brew-glass-bg-2',
     the overall "feel" might still be too transparent, especially for the badges.
     The badges need explicit styling.
*/
```

```tsx
/* ================================
   components/ActionMenu.tsx
   ================================ */

// Simplified rendering for clarity, focusing on problematic areas

export const ActionMenu: React.FC<ActionMenuProps> = ({ /* ...props */ }) => {
  // ... state, handlers ...

  return (
    <div className="brew-action-anchor" ref={menuRef}> {/* The root anchor for the + button and menu */}
      {/* Hidden file input */}
      {/* ... */}

      {/* + button */}
      <button
        type="button"
        className="brew-action-btn" {/* The + button itself */}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open BrewAssist action menu"
      >
        <span className="brew-action-btn-icon">+</span>
      </button>

      {isOpen && (
        <div className="brew-action-menu"> {/* The dropdown menu panel */}
          <ActionMenuItem // Example of one menu item
              kind="upload"
              label="Upload File"
              description="Upload a file for analysis or modification"
              onClick={handleUploadClick}
              policy={evaluateHandshake({ /* ... */ })}
            />
            {/* ... other ActionMenuItem instances ... */}
        </div>
      )}
    </div>
  );
};

// S4.9e: ActionMenuItem component for consistent styling
const ActionMenuItem: React.FC<ActionMenuItemProps> = ({ kind, label, description, onClick, policy }) => {
  const disabled = !policy.ok;
  const tooltip = policy.reason;
  // ... getIcon ...

  return (
    <li className="brew-action-item"> {/* The <li> that wraps each menu item */}
      <button
        type="button"
        className="brew-action-item-btn" {/* The clickable button inside the <li> */}
        onClick={handleClick}
        disabled={disabled}
        title={tooltip}
      >
        <div className="brew-action-text">
          <div className="brew-action-title">{label}</div>
          <div className="brew-action-subtitle">{description}</div>
        </div>
        <div className="brew-action-icon">
          <span className="action-menu-item-icon">{getIcon(kind)}</span>
          {policy.requiresConfirm && <span className="mcp-badge">⚠</span>} {/* The problematic badges */}
          {policy.requiresSandbox && <span className="mcp-badge"> sandbox </span>}
        </div>
      </button>
    </li>
  );
};
```