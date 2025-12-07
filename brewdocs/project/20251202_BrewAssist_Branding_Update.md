# 2025-12-02 BrewAssist Branding Update

## Summary
This update integrates new branding assets into the BrewAssist Cockpit UI, enhancing its visual identity and aligning with the specified design decisions.

## Changes
- **Image Assets:** Verified the presence of `brewassist-mark.png` and `mcp-tools-logo.png` in the `public/` directory.
- **`components/McpToolsColumn.tsx`:**
    - Added `import Image from "next/image";`.
    - Replaced the plain "MCP Tools" `<h2>` header with a `div` containing the `mcp-tools-logo.png` and a styled title.
- **`components/BrewCockpitCenter.tsx`:**
    - Added `import Image from "next/image";`.
    - Wrapped the main content in a `div` with `className="cockpit-root"` (previously `brew-center`).
    - Added the `brewassist-mark.png` badge at the bottom-left of the cockpit.
- **`styles/globals.css`:**
    - Added new CSS rules for `.mcp-column`, `.mcp-header`, `.mcp-header-logo`, `.mcp-header-title` to style the MCP Tools header.
    - Added new CSS rules for `.cockpit-root`, `.brewassist-mark`, and `.brewassist-mark:hover` to style the main cockpit layout and the BrewAssist badge.
    - Updated `.cockpit-left` to use `flex: 0 0 260px;` for a fixed left width.
    - Updated `.cockpit-center` to use `flex: 1 1 auto;` to ensure it takes up available space.
- **`pages/index.tsx`:** No direct changes were needed as the existing structure with `cockpit-root`, `cockpit-left`, and `cockpit-center` classes correctly leverages the updated CSS for the desired layout.

## Verification
- The changes will be verified by running `pnpm lint` and `pnpm dev`.
