BREWDOCS FILE MANAGEMENT INSTRUCTIONS
 
Universal Rules for Documentation Across the BrewVerse
 
These instructions ensure that every BrewVerse project maintains clean documentation without forcing any project to adopt another project’s structure.
 
Gemini must follow these exact rules when generating, organizing, or referencing documentation.
 
 
---
 
1. BrewDocs is Project-Scoped, Not Shared
 
Every BrewVerse application has its own, isolated brewdocs/ directory, located at:
 
<project-root>/brewdocs/
 
Gemini must not expect BrewAssist’s documentation structure in BrewPulse, BrewSearch, BrewExec, or any other project.
 
❗ Rule for Gemini:
 
> Always inspect the current repository’s brewdocs/ directory and build file paths dynamically.
Never assume files from another BrewVerse project exist here.
 
 
 
 
---
 
2. Each Project’s README.md Defines Its Documentation Model
 
Gemini must use the project’s root README.md as its source of truth for:
 
Which directories exist
 
Which documentation modules are relevant
 
Which files should be created
 
Terminology and naming conventions
 
 
❗ Rule for Gemini:
 
> Before creating or referencing any Markdown files, parse the project’s README.md and align file structure accordingly.
 
 
 
This prevents BrewAssist-centric docs from bleeding into BrewPulse, BrewSearch, or other unique modules.
 
 
---
 
3. BrewDocs Structure Is Dynamic and Per-Project
 
Gemini must not assume a universal static structure.
 
Instead, it should use this template, adapting it to the project’s domain:
 
brewdocs/
│
├── project/              # Roadmaps, updates, summaries, plans
│
├── reference/            # Knowledge base (project-specific)
│   ├── architecture/
│   ├── development/
│   ├── integrations/
│   ├── specifications/
│   ├── marketing/
│   └── shared/
│
├── modules/              # Only for apps with multiple engines/modules
│
├── tasks/                # Task breakdowns (project-specific)
│
├── tests/                # Test plans, strategies, results
│
└── archive/              # Outdated documents moved out of active space
 
Notes:
 
BrewAssist may have modules/sandbox, modules/persona, modules/toolbelt.
 
BrewPulse may instead have modules/audit-engine, modules/pulse-metrics.
 
BrewSearch may have modules/sourcing, modules/ranking.
 
 
❗ Rule for Gemini:
 
> Only create module directories that belong to the application currently being worked on.
 
 
 
Never create BrewAssist-specific folders inside BrewPulse or BrewSearch.
 
 
---
 
4. BrewDocs Must NEVER Cause Import Failures
 
Gemini’s global memory should never reference files that don’t exist.
 
❗ Hard rule:
 
> Do not store project-specific paths (like BrewAssist’s structure) inside global .gemini/GEMINI.md.
 
 
 
Instead, store procedural rules, not file paths.
 
Such as:
 
“Load all .md files inside brewdocs/project/ if they exist.”
 
“If a file is missing, do not error — skip gracefully.”
 
“Always confirm file existence before import.”
 
 
This eliminates ENOENT issues forever.
 
 
---
 
5. All BrewDocs Operations Must Be Self-Contained
 
Gemini must always:
 
1. Detect the active project root
 
 
2. Read the local brewdocs/ structure
 
 
3. Create or update files only within this project
 
 
4. Avoid writing outside the repo
 
 
 
 
---
 
6. Cross-Project Shared Knowledge Lives in BrewVerse Root Only
 
If you ever want shared documents — those belong in BrewVerse, not inside individual apps.
 
Examples:
 
brewverse/brewdocs/
  ├── standards/
  ├── guidelines/
  ├── design-system/
  └── ecosystem-architecture/
 
Gemini should treat these as optional references, not auto-imports.
 
 
---
 
7. When Structure Changes, Update the Commandments
 
Any time you add/change:
 
A new module
 
A new folder
 
A new documentation category
 
 
You must update:
 
brewdocs/reference/development/brewplay/BREWDOCS_FILE_MANAGEMENT_INSTRUCTIONS.md
 
Gemini must not update structure unless you approve.
 
 
---
 
8. No Cross-Project Pollution Rule
 
Under no circumstance should Gemini:
 
Port BrewAssist docs into BrewPulse
 
Add BrewPulse logic into BrewAssist docs
 
Assume shared features that don’t exist
 
 
Each project is a universe of its own inside the BrewVerse.
 
 
---
 
9. Only Create What the Project Domain Requires
 
Examples:
 
BrewAssist needs:
 
sandbox docs
 
engine docs
 
persona docs
 
 
BrewPulse needs:
 
audit engine docs
 
telemetry docs
 
pulse logic specs
 
 
BrewSearch needs:
 
sourcing rules
 
ranking models
 
elastic / vector search plans
 
 
Gemini must adapt to the domain automatically.
 
 
---
 
10. Always Verify Structure Before Writing
 
Before Gemini writes or imports anything, it must:
 
1. Verify the directory exists
 
 
2. Verify the file exists
 
 
3. Otherwise gracefully create or skip
 
 
 
 
---
 
11. BrewDocs = Local Project Brain, Not Global Memory
 
The .gemini/GEMINI.md memory component should never map hard file paths.
 
It should only store:
 
rules
 
preferences
 
workflow instructions
 
 
All actual docs stay inside brewdocs/ per repo.
 
 
---
 
12. Stay Gold Rule
 
All BrewDocs must maintain:
 
clarity
 
simplicity
 
discoverability
 
zero errors
 
zero conflicts
 
zero cross-project assumptions
 
 
 
---
 
✅ Confirm: Do you want me to generate a polished README-level section summarizing these BrewDocs rules for each repo?
 
I can also generate:
 
✔ A global template GEMINI config
✔ A BrewAssist-specific BrewDocs structure
✔ A BrewPulse-specific structure
✔ A BrewSearch-specific structure
 
Just say “Generate all repo BrewDocs templates”.
 
 
---
 
Want me to also fix your .gemini/GEMINI.md globally so it never breaks again?