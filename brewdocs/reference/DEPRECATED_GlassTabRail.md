# DEPRECATED: GlassTabRail.tsx

**Deprecation Date:** December 28, 2025

**Reason for Deprecation:**
The `GlassTabRail.tsx` component has been deprecated as part of the architectural shift from a floating overlay right pane to a fixed, collapsible right sidebar. The functionality previously provided by `GlassTabRail` (displaying tabs for the right pane) has been integrated directly into `components/WorkspaceSidebarRight.tsx`.

**Replacement:**
The tab rendering and switching logic is now handled within `components/WorkspaceSidebarRight.tsx`.

**Impact:**
Any components or layouts that directly imported or relied on `GlassTabRail.tsx` will need to be updated to use the new `WorkspaceSidebarRight.tsx` structure.
