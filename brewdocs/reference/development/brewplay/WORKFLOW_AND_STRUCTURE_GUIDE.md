# Brewdocs: Workflow and Structure Guide

This document outlines a standardized structure for the `brewdocs` directory to ensure clarity, maintain focus, and provide a consistent project management workflow.

## 1. Directory Structure

The `brewdocs` directory is organized into three primary folders:

### `/reference`

**Purpose:** Contains all non-task-related documentation. These are high-level guides, architectural blueprints, process flows, and other materials that provide context and direction for the project.

**Contents:**

- Architectural diagrams (`UI_ARCHITECTURE.md`)
- Project blueprints (`BREWEXEC_BLUEPRINT.md`)
- Development process guides (`workflow_process.md`)
- Any document that serves as a reference rather than an actionable task.

---

### `/tasks`

**Purpose:** Contains all active, actionable tasks for the project. Each task should have its own markdown file.

**Structure:** This directory is sub-divided by task type:

- `/tasks/issues/`: For bug reports and active debugging logs.
- `/tasks/feature_updates/`: For notes and plans related to new features.
- `/tasks/refactoring/`: For tasks related to improving existing code.

---

### `/archive`

**Purpose:** A single location for all completed, closed, or resolved tasks.

**Workflow:** When a task from the `/tasks` directory is completed, its corresponding file is moved into `/archive`. This keeps the `/tasks` directory clean and focused only on active work while preserving a complete history of all work done.

## 2. The `PROGRESS_SUMMARY.md` Workflow

The `PROGRESS_SUMMARY.md` file is the single source of truth for what is currently being worked on.

**Purpose:** To provide an at-a-glance overview of all active tasks and prevent context loss between sessions.

**Structure:**
The file contains two main sections:

- `## IN_PROGRESS`
  - A list of tasks that are currently active.
  - Each item includes a link to its corresponding file in the `/tasks` directory.

- `## RECENTLY_COMPLETED`
  - A list of the last few tasks that were completed.
  - When a task is finished, it is moved from `IN_PROGRESS` to this section.

**How it Works:**

1.  **Start Task:** A new file is created in the relevant `/tasks` subdirectory. A link to this file is added under the `IN_PROGRESS` section of `PROGRESS_SUMMARY.md`.
2.  **End Task:** The task file is moved to the `/archive` directory. The entry in `PROGRESS_SUMMARY.md` is moved from `IN_PROGRESS` to `RECENTLY_COMPLETED`.

This system ensures that anyone (or any AI assistant) can immediately identify the current work priorities by reading a single file.
