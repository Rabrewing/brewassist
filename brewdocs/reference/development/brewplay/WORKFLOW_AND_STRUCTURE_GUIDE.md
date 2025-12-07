# Brewdocs: Workflow and Structure Guide

This document outlines a standardized and comprehensive structure for the `brewdocs` directory, ensuring clarity, maintaining focus, and providing a consistent project management workflow across all BrewVerse projects. This guide aligns with the `BREWDOCS_FILE_MANAGEMENT_INSTRUCTIONS.md` to establish a unified file organization system for all human and AI collaborators.

## 1. BrewDocs Directory Structure: The BrewVerse Standard

The `brewdocs` directory serves as the central repository for all documentation, notes, and plans. Its structure is designed for logical organization and easy retrieval of information.

### `brewdocs/` (Root Documentation Directory)

The top-level directory for all project-related documentation.

### `brewdocs/brewassist/`

**Purpose:** Contains documentation specific to the `brewassist` module, detailing its internal workings, configurations, and operational aspects.

*   **`brewdocs/brewassist/sandbox/`**: Documentation related to the BrewAssist sandbox environment, including setup, usage, testing procedures, and feature details.
*   **`brewdocs/brewassist/engine/`**: Comprehensive documentation for BrewAssist's core engine logic, algorithms, decision-making processes, and internal architecture.
*   **`brewdocs/brewassist/persona/`**: Information regarding AI personas within BrewAssist, including their configurations, behavioral guidelines, and development notes.
*   **`brewdocs/brewassist/toolbelt/`**: Documentation for the various tools and utilities utilized by BrewAssist agents, including their functionality, integration, and usage instructions.

### `brewdocs/project/`

**Purpose:** Stores high-level project documentation, including overall progress, roadmaps, and frequently updated status reports.

*   **`brewdocs/project/PROGRESS_SUMMARY.md`**: The single source of truth for current and recently completed tasks. It provides an at-a-glance overview of active tasks and prevents context loss between sessions. (See Section 2 for workflow details).
*   **`brewdocs/project/BrewUpdates.md`**: Contains frequent, short updates on ongoing tasks, often updated every 30 seconds as per the Live Build-Log Mandate.
*   **`brewdocs/project/charter.md`**: Project charter documents, outlining purpose, scope, and collaboration agreements.
*   **`brewdocs/project/DB_CHANGELOG.md`**: Summaries of database migrations and changes.
*   **`brewdocs/project/RELEASE_NOTES.md`**: Consolidated release notes for project versions.
*   **`brewdocs/project/BrewAssist_Stabilization_Roadmap.md`**: Specific roadmaps or plans for project stabilization efforts.

### `brewdocs/reference/`

**Purpose:** A repository for general reference materials, foundational knowledge, and static guidelines that provide context and direction for the project.

*   **`brewdocs/reference/shared/`**: Documents containing information or resources that are shared across multiple projects or modules within the broader BrewVerse ecosystem.
*   **`brewdocs/reference/architecture/`**: Detailed architectural diagrams, design decisions, system overviews, and documentation of component interactions. Examples: `ARCHITECTURE.md`, `UI_ARCHITECTURE.md`.
*   **`brewdocs/reference/development/`**: Guidelines, standards, and best practices for development.
    *   **`brewdocs/reference/development/brewplay/`**: Specific development playbooks, guides, and core commandments. Examples: `BREWDOCS_FILE_MANAGEMENT_INSTRUCTIONS.md`, `BUILD_WITH_BREWEXEC.md`, `LIVE_BUILD_LOG_MANDATE.md`, `TRUTH_ENGINE_PROTOCOL.md`, `WORKFLOW_AND_STRUCTURE_GUIDE.md`.
    *   **`brewdocs/reference/development/ENVIRONMENTS.md`**: Documentation for environment setups, configurations, and deployment strategies.
    *   **`brewdocs/reference/development/RUNBOOKS/`**: Operational runbooks for handling outages, hotfixes, rollbacks, and other operational procedures.
*   **`brewdocs/reference/integrations/`**: Documentation for integrations with external systems, APIs, or third-party services, including setup, configuration, and usage.
*   **`brewdocs/reference/specifications/`**: Detailed functional and technical specifications for features, modules, or systems. Examples: `DATA_MODEL.md`, `SECURITY_MODEL.md`, `CONTRACTS.md`, `RLS_MATRIX.md`, `RBAC_MATRIX.md`, `AUTH_FLOWS.md`, `openapi.yaml`, `EVENTS.md`.
*   **`brewdocs/reference/marketing/`**: Marketing-related documents, branding guidelines, and public-facing content.

### `brewdocs/archive/`

**Purpose:** A single, centralized location for all completed, closed, or resolved tasks and outdated documents. This keeps active directories clean while preserving a complete historical record.

### `brewdocs/case_studies/`

**Purpose:** Contains detailed analyses of specific issues, feature implementations, or development processes. These serve as learning resources and future references.

### `brewdocs/tasks/`

**Purpose:** Houses all active, actionable tasks for the project. Each task should have its own Markdown file, often linked from `PROGRESS_SUMMARY.md`.

*   **`brewdocs/tasks/issues/`**: For bug reports, active debugging logs, and investigations.
*   **`brewdocs/tasks/feature_updates/`**: For notes, plans, and detailed breakdowns related to new features.
*   **`brewdocs/tasks/refactoring/`**: For tasks focused on improving existing code, including refactoring plans and progress.

### `brewdocs/tests/`

**Purpose:** Documentation pertaining to testing strategies, test plans, test cases, and test results. Examples: `TEST_PLAN.md`.

## 2. The `PROGRESS_SUMMARY.md` Workflow

The `brewdocs/project/PROGRESS_SUMMARY.md` file is the single source of truth for what is currently being worked on.

**Purpose:** To provide an at-a-glance overview of all active tasks and prevent context loss between sessions.

**Structure:**
The file contains two main sections:

-   `## IN_PROGRESS`
    *   A list of tasks that are currently active.
    *   Each item includes a link to its corresponding file in the `brewdocs/tasks/` directory.

-   `## RECENTLY_COMPLETED`
    *   A list of the last few tasks that were completed.
    *   When a task is finished, it is moved from `IN_PROGRESS` to this section.

**How it Works:**

1.  **Start Task:** A new file is created in the relevant `brewdocs/tasks/` subdirectory. A link to this file is added under the `IN_PROGRESS` section of `brewdocs/project/PROGRESS_SUMMARY.md`.
2.  **End Task:** The task file is moved to the `brewdocs/archive/` directory. The entry in `brewdocs/project/PROGRESS_SUMMARY.md` is moved from `IN_PROGRESS` to `RECENTLY_COMPLETED`.

This system ensures that anyone (or any AI assistant) can immediately identify the current work priorities by reading a single file, maintaining transparency and focus across the BrewVerse.