# S4.xx — New BrewAssist UI Spec (Gemini-Style Minimal Cockpit)

## Goal

After Phase 1 stability, we will implement a **new minimal UI** inspired by Gemini CLI:

- No always-visible preview pane.
- Clicking a file in the tree opens a **code modal** with:
  - Syntax-highlighted code
  - Download as `.txt`, `.md`, `.pdf`, `.docx`
  - BrewAssist chat box (task context)
- The right column becomes a **larger Sandbox / Status panel**.
- Footer stripe added for versioning and legal links.

This spec is applied **only after** S4.5 UI Repair & Lock-In is complete.

---

## Files to Update

- `components/BrewCockpitCenter.tsx`
- `components/WorkspaceSidebarLeft.tsx`
- `components/WorkspaceSidebarRight.tsx`
- `components/ProjectTree.tsx`
- `components/SandboxPanel.tsx`
- `components/CodeModal.tsx` (new)
- `components/ToolbarFooter.tsx` (new or simple footer block)
- `pages/index.tsx`
- `styles/globals.css` (UI layout, hover, modal)
- Optional: `styles/cockpit-layout.css` if we re-split styles intentionally

---

## High-Level Behavior

1. **Project Tree (Left)**:
   - Shows repo hierarchy.
   - Clicking on a file:
     - Triggers `/api/fs-read?path=<file>`.
     - Opens `CodeModal` in center overlay.

2. **CodeModal**:
   - Displays:
     - File path
     - Syntax-highlighted content
     - Buttons:
       - Close
       - Download as:
         - `.txt`
         - `.md`
         - `.pdf`
         - `.docx` (placeholder for now)
   - Contains BrewAssist chat box scoped to that file:
     - “Summarize this file”
     - “Propose refactor”
     - etc.

3. **Sandbox Panel (Right)**:
   - Shows:
     - Current sandbox root
     - Last BrewLast snapshot timestamp
     - Last BrewAssist tool run (status)
     - Placeholder for diff preview

4. **Footer**:
   - Very thin bar at bottom:
     - `© Brewington Exec Group Inc. | BrewAssist vS4.x | Status: Dev`
     - Links for:
       - Terms
       - Privacy
       - Docs (future)

---

## Implementation Order

1. Implement `CodeModal.tsx` (standalone, no routing).
2. Wire `ProjectTree` to open `CodeModal` on file click.
3. Enhance `SandboxPanel` with better layout and static placeholders.
4. Add footer and CSS updates to support the new layout.

---

## Notes

- The new UI **must not** break the stable behavior from Phase 1.
- Start with static behavior (no NIM, no HRM Identity yet).
- This spec will be refined while S4.5 is being stabilized.
