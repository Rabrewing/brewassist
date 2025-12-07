# S4.5 — BrewAssist UI Repair & Lock-In (Phase 1)

## Context

We split BrewAssist into its own repo (`brewassist/`) and reattached:
- `components/`
- `contexts/`
- `lib/`
- `pages/`
- `styles/`

We made several rounds of UI changes (tree, sandbox, preview pane, logos, CSS split, removing props, etc.), and the UI is now visually inconsistent and partially broken:

- Tree sometimes doesn’t expand or scroll correctly.
- Sandbox panel scrolls with the tree instead of staying visually “locked”.
- Chat bar doesn’t reliably send or render responses in the work pane.
- Layout feels “too tall” / non-responsive.
- Old preview pane wiring and logo experiments may still exist in code.

**Goal of Phase 1:**  
Restore a **clean, stable, minimal cockpit UI** that:

1. Renders without hydration errors or runtime exceptions.
2. Shows:
   - Left: project tree (simple, working)
   - Center: workpane with BrewAssist conversation + status
   - Right: sandbox/status panel (fixed column)
3. Has working:
   - `/api/fs-tree`
   - `/api/fs-read`
   - BrewAssist chat request → response pipeline.

No fancy modal, no logo, no @pages/api/list-directory.js tricks yet. Pure stability.

---

## Files In Scope for Phase 1

Focus only on these UI + wiring files:

- `components/BrewCockpitCenter.tsx`
- `components/WorkspaceSidebarLeft.tsx`  (or McpToolsColumn → SidebarLeft)
- `components/WorkspaceSidebarRight.tsx`
- `components/ProjectTree.tsx`
- `components/SandboxPanel.tsx` (or equivalent)
- `contexts/GuideContext.tsx` (if used for help/guide tabs)
- `pages/index.tsx`
- `styles/globals.css` (and any extra CSS files we introduced)

Supporting APIs (read-only for context, no major refactors here unless broken):

- `pages/api/fs-tree.ts`
- `pages/api/fs-read.ts`
- `pages/api/brewassist.ts`
- `pages/api/guide.ts`

---

## Phase 1 Tasks for Gemini (Step-By-Step)

> **Important:** Do not reinvent the UI or add new features. Just restore a clean, working version based on the current components.

### 1. Clean Up Components & Imports

1. Open:
   - `components/BrewCockpitCenter.tsx`
   - `components/WorkspaceSidebarLeft.tsx`
   - `components/WorkspaceSidebarRight.tsx`
   - `components/ProjectTree.tsx`
   - `components/SandboxPanel.tsx`
   - `pages/index.tsx`

2. Remove or fix:
   - Any imports for:
     - `PreviewPane`
     - Any logo components
     - Any props that no longer exist (like `selectedPath`, `onFileSelect`, etc.)
   - Any unused imports that ESLint will complain about.

3. Ensure:
   - `ProjectTree` is a **no-props** component that:
     - Uses a fixed root `"."`
     - Calls `/api/fs-tree` to display the repo tree
   - `SandboxPanel` is a simple, **no-props** component that:
     - Shows sandbox status or a placeholder for now.

### 2. Restore Minimal Layout Structure

In `pages/index.tsx`, ensure the layout is:

```tsx
<div className="cockpit-root">
  <aside className="sidebar-left">
    <WorkspaceSidebarLeft />
  </aside>

  <main className="cockpit-center">
    <BrewCockpitCenter />
  </main>

  <aside className="sidebar-right">
    <WorkspaceSidebarRight />
  </aside>
</div>
```
No modals, no preview pane.

Left = project tree / tools.

Center = BrewAssist title, tier, chat, and log/console.

Right = sandbox info / BrewLast status / basic future hooks.


### 3. Fix BrewCockpitCenter Env Usage

Open components/BrewCockpitCenter.tsx and ensure:

It never crashes if brewEnv is missing pieces.

Example pattern:

```
const activeProject = brewEnv.activeProject || "brewassist";
const primaryModel = brewEnv.primaryModel || "openai-gpt-4.1-mini";
const fallbackModel = brewEnv.fallbackModel || "gemini-flash";
const localModel = brewEnv.localModel || "mistral-local";

<h1 className="cockpit-title">
  BrewAssist DevOps Cockpit · {activeProject.toUpperCase()}
</h1>
<span className="cockpit-tier">
  {brewEnv.emoji || "🛠️"} {brewEnv.tier || "Dev"} ·
  {" "}primary: {primaryModel}
  {" "}· fallback: {fallbackModel}
  {" "}· local: {localModel}
</span>
```
No direct brewEnv.activeProject.toUpperCase() calls without a fallback.

No dynamic code that introduces hydration mismatches unnecessarily.


### 4. Make Tree & Sandbox Scroll Behavior Predictable

In styles/globals.css (or the relevant layout CSS):

1. Ensure:

```css
.cockpit-root {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 320px;
  height: 100vh;
  overflow: hidden;
}

.sidebar-left,
.sidebar-right {
  overflow-y: auto;
}

.cockpit-center {
  overflow-y: auto;
}
```
2. Verify that:

Scrolling inside the center does not move the left/right panes.

Scrolling inside the left/right panes only scrolls that column.

### 5. Restore Working Project Tree

In components/ProjectTree.tsx:

1. Make it a simple self-contained component that:

Calls /api/fs-tree?path=. on mount.

Renders nested nodes.

Toggles open/close on folders.

No external props.

2. If needed, re-add a basic FileNode type and renderNode recursion.

3. Keep styling minimal but correct; no new design experiments.

### 6. Restore Basic SandboxPanel

In components/SandboxPanel.tsx:

1. It should, at minimum:

Show a title (“Sandbox Status”).

Show a placeholder body (“Sandbox tools coming online in S4.6+”).

2. No props, no complex logic in Phase 1.

3. Make sure the import path in WorkspaceSidebarRight.tsx matches.

### 7. Verify API Hooks (Read-Only)

Check:

- `pages/api/fs-tree.ts`
- `pages/api/fs-read.ts`

Confirm that:

- `fs-tree` uses the correct root (no weird */home/brewexec/... joins).
- Given our repo root at /home/brewexec/brewassist, it should treat "." as that root and not double-prefix it.
- You already saw a fixed version via curl /api/fs-tree; keep that behavior.

### 8. Final Sanity Check

1. Run:
```bash
pnpm lint
pnpm build
pnpm dev
```

2. Validate in browser:

- Page loads with no console errors.
- Tree renders.
- Sandbox panel renders.
- BrewAssist chat bar is visible, and hitting enter triggers /api/brewassist.

---

## Out of Scope for Phase 1

Do not implement:

- Modals for code preview.
- Download buttons.
- Multi-model switches.
- NIM integration.
- HRM Identity UI.
- Logos and advanced theming.
- @pages/api/list-directory.js shorthand.

Those belong to later phases (S4.NEW_UI, S5).
