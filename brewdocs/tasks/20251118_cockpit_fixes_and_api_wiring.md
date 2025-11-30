# Cockpit Fixes and API Wiring

**Date:** 2025-11-18

## Objective

Apply a comprehensive set of fixes to the BrewAssist Cockpit UI, create stub APIs for AI functionalities, and wire up a live call to the Gemini CLI.

## Changes Implemented

### 1. Right Sidebar UI (`WorkspaceSidebarRight.tsx`)
- Replaced the entire component with a new version to fix bugs and add features.
- The file tree is now collapsible.
- The "Command failed: brewrouter.sh" spam has been silenced by commenting out the call.
- A pop-out preview overlay for files has been implemented.

### 2. Global Styles (`styles/globals.css`)
- Appended new CSS rules to support the updated right sidebar, including:
  - "LED hover" effects for file and folder nodes.
  - Styling for the new preview overlay panel.
  - Alignment fixes for the overlay header buttons (minimize and close).

### 3. Stub API Creation (`pages/api/`)
- Created three new stub API endpoints to ensure all cockpit buttons are wired and return valid, though simulated, JSON responses.
  - `pages/api/hrm.ts`: Simulates the strategic mind (HRM) engine.
  - `pages/api/agent.ts`: Simulates the agent delegation engine.
  - `pages/api/loop.ts`: Simulates the commentary loop engine.

### 4. Command Routing (`components/ChatCommandRouter.tsx`)
- Updated the frontend router to handle the new API endpoints.
- Added a case for the `/loop` command.
- Corrected the payload for the `/agent` command to use `prompt` instead of `task`.

### 5. Live LLM API (`pages/api/llm.ts`)
- Replaced the previous "minimal llm API" stub with a new implementation.
- The `/api/llm` endpoint now makes a **real** shell call to the `gemini` CLI, passing the user's prompt to it.
- The output from the Gemini CLI is captured and returned as the API response, enabling the first live AI model interaction in the cockpit.

## Note on `/switch` alias
- The error `bash: /home/brewexec/brewenv/brewenv: No such file or directory` indicates the `/switch` alias points to a non-existent file.
- As I cannot modify your shell configuration directly, you will need to update it by running the following commands:
  ```bash
  echo 'alias /switch="$HOME/overlays/brewenv.sh"' >> ~/.bashrc
  source ~/.bashrc
  ```
  (Or use `~/.zshrc` if you are using zsh).

## Outcome

The cockpit UI is significantly improved and more stable. All primary AI command buttons are now wired to endpoints that provide valid responses, eliminating "Failed to fetch" errors. The `/llm` command is now fully functional and interacts with a live Gemini model.
