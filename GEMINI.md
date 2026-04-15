# BrewExec Project

This directory appears to be a monorepo for the BrewExec platform, a suite of CLI overlays and tools for DevOps and contributor onboarding.

## Project Overview

The project is named "BrewAssist DevOps Cockpit" and serves as a CLI overlay suite for the BrewVerse ecosystem. It includes several core modules:

- `brewassist`: An agent selector and fallback runner.
- `brewgemini`: A Gemini CLI overlay.
- `brewhrm`: A Hierarchical Reasoning Model for planning.
- `brewgrok`: For commentary and fallback logic.
- `brewllm_mistral`: A local Mistral fallback for file operations.
- `brewloop_*`: Multi-turn commentary loops.

The architecture is modular, with shell overlays and a fallback chain of AI models (Gemini → HRM → Grok → Mistral).

The root of the project is a Next.js application, but it also contains various other modules and subprojects.

## Building and Running

The main application is a Next.js project. Here are the primary commands:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run start:server`: Starts a Node.js server using `server.js`.

### TODO

It's not immediately clear how the other modules (`brewassist`, `brewhrm`, etc.) are run or used. This should be documented.

## Development Conventions

The project uses TypeScript, as indicated by the presence of `tsconfig.json` and `@types/*` dependencies. Tailwind CSS is also used for styling.

There are no explicit linting or formatting configurations visible in the read files, but the use of TypeScript and a modern framework like Next.js suggests that standard practices are likely followed.

## Architectural Notes (Recent Updates)
- **UI Navigation:** The cockpit header uses a two-row navigation system (`.cockpit-header` and `.cockpit-sub-header`) to avoid overcrowding the main header. The top row holds user session data and main navigation; the sub-header holds the Enterprise Context (Org/Workspace) and Repo Connection selectors.
- **Sandbox Binding Pipeline:** Real remote repo binding is implemented. When a provider (e.g., GitHub) is connected and a repo is selected, `/api/sandbox/bind` triggers `bindRemoteSandbox` which shallow-clones the remote code into `sandbox/mirror/[provider]/[repo]`.
- **Right Rail Hook-ups:** The Project Tree (`fs-tree.ts`) and Code Viewer (`fs-read.ts`) are fully hooked up to dynamically read from the `sandbox/mirror` target directory instead of the host project root when an external provider and repo are selected.
- **Onboarding Guardrails:** The Onboarding Wizard includes a post-completion "Checks & Balances" step that verifies the environment state (token presence and repo selection) before transitioning to the planning workflow.

### V1 Final Stretch: End-to-End Apply Loop
- **Objective:** Enable a secure "Confirm & Push" workflow that propagates AI edits from the Sandbox Mirror to the live remote repository.
- **Status:** Planning phase complete.
- **Technical Plan:** `brewdocs/tasks/20260414_end_to_end_apply_loop_plan.md`

### V2 Model Provider Strategy (BYOK)
- **Status:** Planned for Post-V1 (Do not implement until Sandbox loop is complete).
- **Architecture:** Transition from the current multi-tier fallback chain to a Universal Provider Router.
- **Billing/Access:** Implement a "Bring Your Own Key" (BYOK) system where customers can use BrewAssist's managed keys (via SaaS subscription) OR inject their own API keys for zero-markup inference.
- **Required Model Additions:**
  - OpenAI (ChatGPT 5.4+)
  - Google (Gemini 3+)
  - Anthropic (Claude series)
  - Mimo V2 (Omni + Pro)
  - Kimi K2.5
  - Qwen (Latest)
  - MiniMax
