# GEMINI.md — BrewVerse Global Instructions (Per-Repo)
 
You are Gemini CLI operating **inside a single project repository**.
You must treat each repository as a completely separate universe.
 
Your goals:
 
- Help with code, docs, and planning.
- Respect each project’s own structure.
- Never assume directories or files from other BrewVerse projects exist here.
 
---
 
## 1. Repo-Local Mindset
 
- Always treat the **current working directory** as the project root.
- Never assume this project is BrewAssist, BrewPulse, BrewSearch, or anything else.
- If you need to know what this project is, FIRST:
  - Read `README.md` (if it exists).
  - Infer the project name and purpose from that file.
 
Do **not** import or reference files from other repositories.
 
---
 
## 2. BrewDocs Handling (Documentation Rules)
 
Many BrewVerse projects use a `brewdocs/` directory as their local knowledge base.
 
**Important:**
 
- `brewdocs/` is always **project-scoped**, not global.
- The structure may differ between projects.
- You must not assume BrewAssist’s `brewdocs` layout exists in any other app.
 
When working with docs:
 
1. If `brewdocs/` exists:
   - Use it as the main documentation root.
   - Explore its subdirectories only if they actually exist in THIS repo.
2. If `brewdocs/` does not exist:
   - Do not create it unless the user explicitly asks you to.
3. Never hard-code specific file paths (like `brewdocs/project/BrewUpdates.md`) in your own persistent instructions.
   - Those examples are **patterns**, not guarantees.
 
If the user mentions a document such as:
 
- `brewdocs/project/BrewUpdates.md`
- `brewdocs/project/PROGRESS_SUMMARY.md`
- `brewdocs/reference/development/brewplay/BREWGOLD_COMMANDMENTS.md`
 
You should:
 
- First, verify whether those files exist.
- If they do not exist, ask the user whether to create them.
- Do **not** treat missing files as fatal or repeatedly re-import them.
 
---
 
## 3. File Imports and ENOENT Safety
 
You must avoid causing persistent ENOENT errors.
 
**Rules:**
 
- Before relying on a file path, assume it **might not exist**.
- If an import fails (ENOENT), you must:
  - Stop trying to auto-import that path repeatedly.
  - Treat it as optional context.
  - Ask the user if they want to create that file or adjust the path.
 
You must NOT store project-specific, hard-coded file paths inside your own persistent instructions
that could be invalid for other projects.
 
Examples of paths you must NOT bake into long-term memory:
 
- `brewdocs/project/BrewUpdates.md`
- `brewdocs/project/PROGRESS_SUMMARY.md`
- `brewdocs/reference/development/brewplay/BREWGOLD_COMMANDMENTS.md`
 
These may exist in some projects but not others.
 
---
 
## 4. Per-Project BrewDocs Shape
 
Each project can have its own BrewDocs layout.
 
A **generic** template you can follow (only as a guide, not a requirement) is:
 
- Use `brewdocs/project/` for:
  - Roadmaps
  - Progress summaries
  - High-level plans
 
- Use `brewdocs/reference/` for:
  - Architecture
  - Development guidelines
  - Integrations
  - Specs
  - Shared patterns
 
- Use `brewdocs/tasks/` for:
  - Detailed task breakdowns
  - TODO plans
  - Worklists
 
- Use `brewdocs/tests/` for:
  - Test strategies
  - Test plans
  - Test logs
 
- Use `brewdocs/archive/` for:
  - Old or replaced documents
 
You must adapt this pattern to the current project’s reality and never force it.
 
If the structure doesn’t match, you:
- Respect what exists,
- Propose improvements only if the user asks.
 
---
 
## 5. Coordination With BREWDOCS_FILE_MANAGEMENT_INSTRUCTIONS
 
If this project contains:
 
`brewdocs/reference/development/BREWDOCS_FILE_MANAGEMENT_INSTRUCTIONS.md`
 
then you must:
 
1. Read it fully before doing any large documentation operation.
2. Obey its project-specific rules above all generic assumptions.
3. Use it as the authoritative description of how this repo wants files organized.
 
If that file does not exist:
- Use the generic rules in this GEMINI.md,
- And ask the user before introducing new directory structures.
 
---
 
## 6. Communication & Safety
 
- Always explain what you plan to change before editing multiple files.
- When reorganizing docs or creating new ones:
  - Show the path(s) you intend to use.
  - Ask for confirmation if the operation is large or irreversible.
- Prefer creating **new** Markdown files instead of overwriting existing ones, unless the user explicitly says to update/replace.
 
---
 
## 7. What You MUST NOT Do
 
- Do not assume every project is BrewAssist.
- Do not import or reference BrewAssist-specific paths in other repos.
- Do not keep retrying imports to missing paths and clutter logs with ENOENT errors.
- Do not create undocumented directories without telling the user.
 
---
 
## 8. Mission Summary
 
You are here to:
 
- Help stabilize and upgrade each project in its own context.
- Use `brewdocs/` as a **local project brain**, not a global one.
- Treat README + local BrewDocs instructions as the truth for that repo.
- Avoid cross-project assumptions.
 
Stay safe. Stay consistent. Stay Gold.