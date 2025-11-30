# Case Study: `brewenv` Restoration and Enhancement

**Date:** 2025-11-18

## 1. Problem Analysis

A critical file, `/home/brewexec/brewenv`, was accidentally deleted. My previous automated fix attempted to recreate it based on incomplete information, leading to further instability. The absence of this core script caused a cascading failure across the BrewAssist Cockpit, manifesting as:

- The `/switch` command failed with a "No such file or directory" error.
- Environment variables were not loading, preventing AI engines (`/llm`, `/hrm`, `/agent`) from functioning.
- The cockpit lost its awareness of the active project (`BREW_ACTIVE_PROJECT`).
- BrewPulse emotional tiers and model selection flags were not being set, breaking UI and agent-chain logic.

The root cause was a failure in process: I assumed the file needed a simple recreation without first investigating its critical role and dependencies.

## 2. Resolution Plan

To fix this permanently and improve the system's robustness, I will execute the following precise steps, based on your detailed instructions. I will ask for permission before overwriting any existing files.

### Step 2.1: Implement Hardened `brewenv.sh`
- **Action:** Create or overwrite the low-level environment manager script.
- **Path:** `/home/brewexec/brewenv.sh`
- **Purpose:** This script will be a simple, reliable key-value store manager for `.env` files. It will be responsible for the `get`, `set`, and `list` commands.

### Step 2.2: Implement Project-Aware `/switch` Controller
- **Action:** Create the high-level controller script that manages project switching.
- **Path:** `/home/brewexec/brewenv/brewenv`
- **Purpose:** This script will be the target of the `/switch` alias. It will handle the logic for:
    1.  Creating project-specific `.env` files (e.g., `.env.brewexec`).
    2.  Symlinking `/home/brewexec/.env.local` to the active project's env file.
    3.  Using `brewenv.sh` to populate the environment file with `BREW_ACTIVE_PROJECT`, `BREWPULSE_TIER`, and `BREW_MODEL_*` variables (including the `NEXT_PUBLIC_` prefixes for browser access).

### Step 2.3: Configure Shell Alias
- **Action:** Modify `~/.bashrc` to create a persistent alias for `/switch`.
- **Details:** I will add `alias /switch='/home/brewexec/brewenv/brewenv switch'` to your `.bashrc` file, ensuring the command is available in your shell.

### Step 2.4: Integrate Environment into Frontend
- **Action:** Create a configuration loader in the Next.js app.
- **Path:** `/home/brewexec/lib/brewConfig.ts`
- **Purpose:** This file will contain a `getBrewEnv()` function to safely read the environment variables on both the client and server.

### Step 2.5: Update Cockpit UI
- **Action:** Modify the main cockpit component to display the active environment information.
- **Path:** `/home/brewexec/components/BrewCockpitCenter.tsx`
- **Purpose:** The UI will be updated to show the active project, BrewPulse tier, and model selection, making the current context visible at a glance. I will also add the necessary CSS to `styles/globals.css`.

## 3. Outcome
Upon completion, the BrewAssist Cockpit will have a robust, project-aware environment system. The `/switch` command will be fully functional, and the UI will dynamically reflect the active context, resolving the previous cascading failures and preventing future occurrences.
