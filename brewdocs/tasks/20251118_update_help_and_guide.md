# DevOps Cockpit Help and Guide Revamp

**Date:** 2025-11-18

## Objective

Overhaul the `/help` and `/guide` commands and associated UI to provide a more comprehensive and user-friendly experience for the BrewAssist DevOps Cockpit. This includes updating the underlying shell scripts, creating a new UI component, and ensuring alias health is checked and displayed.

## Task Breakdown

- [x] **Update `brewhelp.sh`:** Replace the existing help script with the new version that includes alias health checks.
- [x] **Update `brewguide.sh`:** Replace the existing guide script with the new version that supports multiple sections.
- [x] **Create `HelpGuidePanel.tsx`:** Create the new React component for the Help/Guide UI panel.
- [x] **Integrate `HelpGuidePanel.tsx`:** Add the new component to the main UI layout.
- [ ] **Update Aliases:** (Inform user) Note the recommended alias block for `.bashrc` or `.zshrc`.
- [ ] **Progress Summary:** Update `PROGRESS_SUMMARY.md` upon completion.
