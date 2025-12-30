# Action Menu Popup Styling Issue Log

**Date:** December 29, 2025

## Issue Description:
The Action Menu popup (`.brew-action-menu`) is persistently displaying an unwanted linear gradient background and an incorrect hover effect, despite aggressive CSS overrides applied in `styles/cockpit-action-menu.css`. Additionally, the mouse cursor on hover over menu items was initially a 'pointer' instead of 'default'.

## Root Cause Identified:
Conflicting CSS styles for `.brew-action-menu` and its child elements were found in `styles/cockpit-layout.css` under the `/* S4.9e: Brew Action Menu Redesign */` section. Due to the CSS cascade order (where `cockpit-layout.css` is imported before `cockpit-action-menu.css`), these conflicting styles were overriding the intended design.

## Steps Taken to Diagnose and Attempt Resolution:
1.  **Initial Fixes in `cockpit-action-menu.css`:**
    *   Changed `.brew-action-item-btn` cursor from `pointer` to `default`.
    *   Added aggressive `!important` rules to `.brew-action-menu` and its pseudo-elements to force a solid navy background and disable `background-image` and `filter`.
    *   Refined `.brew-action-item-btn:hover` to include a BrewTeal glow using `box-shadow`.
2.  **User Feedback:** User reported that the popup still had a gradient and incorrect hover, and the cursor was still 'pointer'.
3.  **Re-evaluation:** Re-read `cockpit-action-menu.css` and confirmed the aggressive overrides were present.
4.  **Broader CSS Search:** Searched for `action-menu` across all CSS files, revealing styles in `cockpit-layout.css` and `cockpit-base.css` in addition to `cockpit-action-menu.css`.
5.  **Import Order Confirmation:** Confirmed that `cockpit-layout.css` is loaded before `cockpit-action-menu.css` in the CSS cascade.
6.  **Conflicting Section Identified:** Pinpointed the `/* S4.9e: Brew Action Menu Redesign */` section in `styles/cockpit-layout.css` as the source of the overriding styles.

## Proposed Solution:
Remove the entire `/* S4.9e: Brew Action Menu Redesign */` section from `styles/cockpit-layout.css`. This will eliminate the conflicting styles and allow `styles/cockpit-action-menu.css` to be the single source of truth for the action menu's styling.

## Current Status:
Attempting to remove the conflicting section from `styles/cockpit-layout.css`. The `replace` tool has failed twice due to exact string matching issues with the large block of CSS.

## Next Action:
Read the entire content of `styles/cockpit-layout.css`, manually construct the new content by removing the problematic CSS block, and then use the `write_file` tool to overwrite the file. This approach is expected to be more robust for removing large, specific sections of text.
