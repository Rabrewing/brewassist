# BrewDocs + Gemini Workflow Playbook

> This playbook defines how Gemini must interact with `brewdocs/` and project files  
> across all BrewVerse repos (BrewAssist, BrewExec, BrewSearch, BrewPulse, etc.).

---

## 1. Where Gemini Gets Its Instructions

1. **Project Root Protocol**
   - Each repo has a root file:
     - `GEMINI_EXECUTION_PROTOCOL.md`
   - This is the **primary contract** for that project.

2. **BrewDocs as Knowledge Hub**
   - If `brewdocs/` exists, Gemini treats it as:
     - The **knowledge base** for:
       - Phases
       - Roadmaps
       - Case studies
       - Tasks
       - Test plans
   - Gemini must never assume `brewdocs/` content is portable across projects unless:
     - The file explicitly says it is cross-project.

---

## 2. Per-Project Behavior

For **each** BrewVerse app:

- **BrewAssist** (AI DevOps Cockpit)
  - Uses:
    - `brewdocs/project/BrewAssist_Stabilization_Roadmap.md`
    - `brewdocs/project/BrewUpdates.md`
    - `brewdocs/project/PROGRESS_SUMMARY.md`
    - `brewdocs/brewassist/*` (engine, persona, sandbox, toolbelt)

- **BrewExec / BrewATS / BrewCRM / BrewCMS**
  - Uses:
    - Repo-specific `README.md`
    - Repo-specific `brewdocs/project/*` and `brewdocs/tasks/*`

- **BrewSearch / BrewPulse**
  - Have their **own**:
    - Logs
    - Case studies
    - Task docs
  - Gemini must **never**:
    - Reuse BrewAssist-specific docs (engine/persona/sandbox specs) inside BrewSearch or BrewPulse unless explicitly told.

---

## 3. Mandatory Steps for Gemini in ANY BrewVerse Repo

When running in any BrewVerse project, Gemini must:

1. **Locate and Read Project Protocol**
   - Load `GEMINI_EXECUTION_PROTOCOL.md` at the repo root.

2. **Scan Project README**
   - Skim `README.md` for:
     - Description
     - Tech stack
     - Any special warnings (“Do not touch X”, “This directory is generated”, etc.)

3. **If brewdocs Exists: Resolve Context**
   - Look for:
     - `brewdocs/project/PROGRESS_SUMMARY.md`
     - `brewdocs/project/BrewUpdates.md`
     - Matching entries in `brewdocs/tasks/`
   - Determine:
     - Current phase
     - Current in-progress tasks
     - Any “Blocked” or “Do not change yet” areas

4. **Restate Task**
   - Repeat the requested task in 1–3 sentences.
   - Identify:
     - Files to be touched
     - What will not be changed

5. **Execute with Minimal Surface Area**
   - Prefer surgical edits.
   - Avoid global renames/refactors unless explicitly requested.

6. **Report Back With Structure**
   - For each change:
     - **File:** path
     - **Change:** short, concrete description
   - If there are follow-up steps (lint, build, run tests), list them.

---

## 4. File Management Rules for `brewdocs/`

1. **Per-App Documents Stay Per-App**
   - Do not import BrewAssist docs into BrewSearch or BrewPulse automatically.
   - Only use cross-app docs from:
     - `brewdocs/reference/shared/`
     - `brewdocs/reference/development/`

2. **Cross-App Knowledge Lives in `reference/`**
   - Architecture, playbooks, global protocols, and branding:
     - Go into `brewdocs/reference/*`
   - Per-feature or per-phase case studies:
     - Stay inside `brewdocs/case_studies/` for the relevant repo.

3. **Task Docs in `brewdocs/tasks/`**
   - Each task doc:
     - Has a date
     - Has a clear title
     - Can be linked from `PROGRESS_SUMMARY.md` or `BrewUpdates.md`

4. **Archive Old Work**
   - When a task is fully complete:
     - You may move older, noisy docs into `brewdocs/archive/`
   - Never delete history without explicit human approval.

---

## 5. How to Extend This Playbook

When you create a **new project**, you should:

1. Copy this file as-is into `brewdocs/reference/development/`.
2. Create a project-specific `GEMINI_EXECUTION_PROTOCOL.md` at the repo root.
3. Update `.gemini/config.json` to:
   - Always load the protocol.
   - Optionally auto-import `brewdocs/project/PROGRESS_SUMMARY.md` and `BrewUpdates.md`.
4. Keep all future rules and discipline changes in version control.

---

## 6. Short Version for Gemini

> “In every BrewVerse repo, I must:  
> 1) Read `GEMINI_EXECUTION_PROTOCOL.md`  
> 2) Check `README.md`  
> 3) Use `brewdocs/` as the knowledge source  
> 4) Do one focused task at a time  
> 5) Edit surgically, document changes, and respect the existing structure.”