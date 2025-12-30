# DEPRECATED: GlassOverlayPanel.tsx

**Deprecation Date:** December 28, 2025

**Reason for Deprecation:**
The `GlassOverlayPanel.tsx` component has been deprecated as part of the architectural shift from a floating overlay right pane to a fixed, collapsible right sidebar. The functionality previously provided by `GlassOverlayPanel` (rendering the content of the right pane) has been integrated directly into `components/WorkspaceSidebarRight.tsx`.

**Replacement:**
The content rendering logic for the right pane is now handled within `components/WorkspaceSidebarRight.tsx`.

**Impact:**
Any components or layouts that directly imported or relied on `GlassOverlayPanel.tsx` will need to be updated to use the new `WorkspaceSidebarRight.tsx` structure.
