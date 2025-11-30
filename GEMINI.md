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
