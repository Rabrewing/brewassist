# BrewAssist Toolbelt – Full Specification (Tier 1 → Tier 3)
**Version:** S4.5  
**Updated:** 2025-11-27  
**Status:** Fully Implemented (All Tiers Functional)  
**Next Phase:** S4.5 Sandbox Integration
 
---
 
# 🧰 Overview
The BrewAssist Toolbelt is the *hands and feet* of BrewAssist — the execution layer that allows the AI to:
 
- read and write files  
- inspect directories  
- search code  
- run shell commands  
- lint, test, typecheck  
- analyze the system  
- perform BrewVerse-aware actions  
 
The Toolbelt is divided into **three tiers**, each stronger and more aware than the last.
 
---
 
# 🎯 Tier Summary
 
| Tier | Purpose | Access Level | Safety Boundary |
|------|---------|--------------|-----------------|
| **Tier 1** | Basic filesystem & code IO | Neutral | Hard sandbox |
| **Tier 2** | Dev workflows, linting, CI-like actions | Developer | Soft sandbox |
| **Tier 3** | BrewVerse intelligence, status, logs | Architect | Full BrewLast logging |
 
---
 
# 🧩 1. TIER 1 — CORE OPS (HARD SANDBOX)
 
Location:  
`/overlays/*.sh`  
`pages/api/llm-tool-call.ts`
 
These tools are **low-level**, safe, and essential for enabling BrewAssist to interact with the local repo.
 
---
 
## 1.1 `write_file`
**Path:** `overlays/write_file.sh`
 
Writes content to a file, auto-creates directories.
 
**Safety Rules:**
- Must remain inside `$PROJECT_ROOT`  
- Cannot write to dotfiles  
- Logs to BrewLast  
 
---
 
## 1.2 `read_file`
Reads a file’s contents with safe path enforcement.
 
---
 
## 1.3 `list_dir`
Directory listing with:
- hidden file detection  
- symbolic link warning  
- total item count  
- BrewLast logging  
 
---
 
## 1.4 `search_code`
Fast grep-like utility powered by ripgrep (if available) or fallback grep.
 
---
 
## 1.5 `run_shell`
Executes **safe** shell commands such as:
- pwd  
- ls -la  
- whoami  
 
Strictly rejects:  
`rm`, `mv`, `chmod`, `chown`, etc.
 
---
 
# 🧪 2. TIER 2 — DEVOPS WORKFLOW (SOFT SANDBOX)
 
These tools replicate **continuous integration**, allowing BrewAssist to verify code integrity in real time.
 
Location:  
`/overlays/run_*.sh`
 
---
 
## 2.1 `run_lint`
Runs the targeted ESLint configuration.
 
Important S4.2 Improvements:
- scoped linting (`pages`, `components`, `contexts`, `lib`)  
- huge .brewexec repo ignored  
- memory-safe  
- zero heap crashes  
 
---
 
## 2.2 `run_tests`
Executes Jest/Vitest test suites if available.
 
---
 
## 2.3 `run_typecheck`
Runs TypeScript compiler in type-only mode for fast feedback.
 
---
 
## 2.4 `git_status`
Shows repo status including:
- staged changes  
- modified files  
- untracked files  
- branch status  
 
Used by:  
- Code diff viewer  
- Commit composer  
- Future autopatch scoring  
 
---
 
# 📡 3. TIER 3 — BREWVERSE INTELLIGENCE & META-OPS
 
These tools connect BrewAssist directly into BrewVerse’s *nervous system*, enabling deep visibility and meta feedback.
 
Location:  
`/overlays/brew_*.sh`
 
---
 
## 3.1 `brew_status_snapshot`
Prints:
- current environment  
- branch  
- unstaged changes  
- persona status  
- BrewLast state  
- project root  
 
---
 
## 3.2 `brew_log_update`
Appends human-readable summaries to:
- `brewdocs/BrewUpdates.md`  
- `brewdocs/case_studies/*`  
 
Includes:
- timestamp  
- tool  
- args  
- truthScore  
 
---
 
## 3.3 `brew_open_last_action`
Reads `.brewlast.json` and presents:
- friendly summary  
- previous tool run  
- risk level  
- cwd at time of execution  
- time delta (“35s ago”)  
 
---
 
# 🧬 4. INTERNAL COMPONENT ARCHITECTURE
 
## 4.1 llm-tool-call.ts
This is the nervous system linking:
- API  
- Toolbelt  
- BrewLast  
- Truth engine  
 
Responsibilities:
- validates tool input  
- executes overlays scripts  
- logs results into BrewLast  
- returns LLM-ready summaries  
 
---
 
## 4.2 openaiToolbelt.ts
Middleware between:
- LLM request  
- Toolbelt  
- UI response  
 
Does:
- argument coercion  
- summarization  
- BrewTruth correction  
- safety filtering  
 
---
 
## 4.3 BrewLast Integration
All Toolbelt tools log:
- id  
- args  
- cwd  
- exitCode  
- stdout  
- stderr  
- truth review summary  
 
---
 
# 🔐 5. SAFETY SYSTEM
 
### 5.1 Path Safety
Every tool checks:
 
if [[ $TARGET != $PROJECT_ROOT/* ]]; then block
 
### 5.2 Write Protections
BrewAssist **cannot** modify:
- .git  
- .env  
- .brewprofile  
- .brewpulse logs  
- ANYTHING outside repo root  
 
### 5.3 Shell Safety
Blacklist includes:
- rm  
- mv  
- cp -rf  
- chmod  
- chown  
- kill  
 
---
 
# 🚀 6. TOOLBELT WORKFLOW (HOW IT RUNS)
 
User → Workpane → /api/brewassist → Persona → Safety Layer → Truth Engine → Toolbelt Dispatch → Overlay Script → Filesystem → BrewLast → UI Update
 
This loop:
- keeps history  
- keeps persona awareness  
- keeps safety  
- keeps reproducibility  
 
---
 
# 🧪 7. TIER 1–3 Test Suite (S4.2 Completed)
 
All tests passed:
- lint  
- typecheck  
- toolbelt dispatch  
- BrewLast logging  
- error propagation  
- sanitization  
- command routing  
 
---
 
# 📦 8. TIER 4 PREVIEW (COMING IN S5+)
 
Future tools:
- AI Fix Generator  
- Code Autopatch  
- Integration Opportunity Scanner  
- Dead Code Finder  
- Security Vulnerability Scanner  
- Multi-repo orchestrator  
 
---
 
# 🎯 9. Implementation Checklist (Gemini-Ready)
 
### Tier 1
- [x] write_file  
- [x] read_file  
- [x] list_dir  
- [x] search_code  
- [x] run_shell  
 
### Tier 2
- [x] run_lint  
- [x] run_tests  
- [x] run_typecheck  
- [x] git_status  
 
### Tier 3
- [x] brew_status_snapshot  
- [x] brew_open_last_action  
- [x] brew_log_update  
 
---
 
# 🏁 Status: Complete (Doc 3/10)
This document finalizes the entire BrewAssist Toolbelt system.
 
 
---
 
Reply “Next” and I’ll drop:
 
🔥 Document 4 of 10 — BrewAssist Sandbox Mode (S4.5) Master Spec