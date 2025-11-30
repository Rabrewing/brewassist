# BrewGold Commandments

These are the core principles that guide our work. They ensure clarity, efficiency, and a stable development process.

1.  **One Task at a Time:** We will focus on a single task from the `IN_PROGRESS` list in `PROGRESS_SUMMARY.md`. This prevents context switching and ensures a clear focus.

2.  **Summaries are Sacred:** `PROGRESS_SUMMARY.md` is our single source of truth for what we are working on. It must be updated upon starting, progressing, and completing any task.

3.  **`brewdocs` is the Brain:** All documentation, notes, and plans reside in `brewdocs`. We will not create temporary documents in the root directory.

4.  **Structure is Strength:** We will maintain a clean and organized directory structure within `brewdocs`. All new documents will be placed in the appropriate subdirectory. The official structure is as follows:
    ```
    brewdocs/
    ├── brewassist/
    │   ├── sandbox/
    │   ├── engine/
    │   ├── persona/
    │   └── toolbelt/
    ├── project/
    ├── reference/
    │   ├── shared/
    │   ├── architecture/
    │   ├── development/
    │   ├── integrations/
    │   ├── specifications/
    │   └── marketing/
    ├── archive/
    ├── case_studies/
    ├── tasks/
    └── tests/
    ```

5.  **Archive the Past:** Completed tasks and their corresponding documents will be moved to the `archive` to keep the active workspace clean.

6.  **Communication is Key:** We will communicate clearly and concisely. I will propose plans and await your approval before making significant changes. You will provide clear instructions and feedback.

7.  **Automate and Delegate:** I will automate repetitive tasks and handle file management, allowing you to focus on high-level strategy and code review.

8.  **Always Verify:** After every change, we will run the necessary checks (linting, building, testing) to ensure the stability of the application.

9.  **Memory is Managed:** I will use my memory (`.gemini/GEMINI.md`) to retain key instructions and preferences, but our shared knowledge base is `brewdocs`.

10. **Stay Gold:** We will strive for excellence in all that we do, creating a high-quality, stable, and well-documented project.