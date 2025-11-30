# BrewAssist Engine Architecture  
**Version:** S4.5  
**Updated:** 2025-11-26  
**Status:** Stable / Implements S4.1 → S4.4  
**Next Phase:** S4.5 Sandbox Integration
 
---
 
## 🧠 High-Level Vision
BrewAssist is the **central AI co-pilot** for the BrewVerse ecosystem.  
The engine combines:
 
- **Conversation → Action loops**
- **Toolbelt execution**
- **Memory (BrewLast)**
- **Truth scoring (BrewTruth)**
- **Safety routing**
- **Persona behavior**
- **UI interaction (Workpane + Preview Pane)**
- **Sandbox Mode (S4.5)**
 
This document details how all modules connect internally.
 
---
 
# 🏗️ 1. Core Layers Overview
 
┌─────────────────────────────────────────────┐ │                UI LAYER                     │ │   Workpane • Preview Pane • Hotkeys         │ └─────────────────────────────────────────────┘ │ ▼ ┌─────────────────────────────────────────────┐ │               API LAYER                     │ │  /api/brewassist                            │ │  /api/brewassist-persona                    │ │  /api/brewtruth                             │ │  /api/brewlast                              │ │  /api/llm-tool-call                         │ └─────────────────────────────────────────────┘ │ ▼ ┌─────────────────────────────────────────────┐ │           EXECUTION ENGINE                  │ │   Persona Engine • Safety Layer             │ │   Memory Manager (BrewLast)                 │ │   Truth Engine (BrewTruth)                  │ └─────────────────────────────────────────────┘ │ ▼ ┌─────────────────────────────────────────────┐ │               TOOLBELT                      │ │        (Tier 1 → Tier 2 → Tier 3)           │ │ overlays/*.sh • Python tools • Shell        │ └─────────────────────────────────────────────┘ │ ▼ ┌─────────────────────────────────────────────┐ │              FILESYSTEM                     │ │      repo actions • logs • sandbox          │ └─────────────────────────────────────────────┘
 
---
 
# 🎛️ 2. BrewAssist Modules (S4.1–S4.4)
 
## 2.1 Persona Engine
File:  
`pages/api/brewassist-persona.ts`
 
Controls:
- tone  
- emotionTier  
- memoryWindow  
- safetyMode  
- model + temperature  
- persona rules  
 
Modes implemented:
- **RB Mode** (high-energy, real, multi-modal dev partner)  
- **Standard Mode** (neutral assistant)  
- **Safety Mode** (strict)  
- **Hard Stop Mode** (factual-only)  
 
Responsibilities:
- Generates responses  
- Applies persona filters  
- Stores last 12 turns (S4.4)  
- Routes to BrewTruth for correction  
- Routes to Safety Layer  
 
---
 
## 2.2 Safety Layer
Baked into:
- brewassist-persona.ts  
- brewassist.ts  
- BrewTruth validation  
- Soft-stop vs. hard-stop  
 
Determines if a message:
- should pass
- should be rewritten
- should be blocked
- needs factual correction  
- needs tone correction  
- needs emotion-tier shift
 
---
 
## 2.3 BrewTruth Engine (S4.1)
File:  
`pages/api/brewtruth.ts`
 
Functions:
- truthScore (0–1)  
- contradictions  
- flags  
- risk classification  
- better alternatives  
- summarization  
 
Used in:
- persona replies  
- toolbelt summaries  
- BrewAssist idea evaluation  
- Sandbox idea risk scoring  
 
---
 
## 2.4 BrewLast Memory Engine (S3)
File:  
`lib/brewLast.ts`  
`lib/brewLastServer.ts`  
API: `/api/brewlast`
 
Stores:
- tool runs  
- persona usage  
- safety overrides  
- conversational memory  
- sandbox actions  
- file paths + working directory  
- timestamps  
 
Format: `.brewlast.json`
 
History entries remain until manually cleared.
 
---
 
# 🔧 3. Toolbelt Architecture (Tier 1 → Tier 3)
 
## 3.1 Tier 1 — Core Ops
Shell scripts in `/overlays/`
 
- write_file  
- read_file  
- list_dir  
- search_code  
- run_shell  
 
Each has:
- path safety
- error handling
- BrewLast logging
 
---
 
## 3.2 Tier 2 — DevOps & Tests
Scripts include:
 
- run_lint  
- run_tests  
- run_typecheck  
- git_status  
 
These provide:
- developer workflow automation  
- UI → Toolbelt → Filesystem link-up  
- safe execution boundaries  
 
---
 
## 3.3 Tier 3 — BrewVerse-Aware Tools
- brew_status_snapshot  
- brew_open_last_action  
- brew_log_update  
 
Enables:
- visible system state  
- historical recall  
- dynamic UI integration  
- workpane intelligence  
 
---
 
# 📦 4. API Specifications
 
### `/api/brewassist`
Main conversation → tool-driver.  
Routes:
- persona select  
- truth scoring  
- tool-call dispatch  
- BrewLast memory  
 
### `/api/brewassist-persona`
Persona configuration + behavioral outputs.
 
### `/api/brewtruth`
Truth evaluation engine.
 
### `/api/llm-tool-call`
Central toolbelt runner.
 
### `/api/brewlast`
Memory engine.
 
---
 
# 🧪 5. S4.4 & S4.5 Readiness
 
### Completed in S4.4:
- Persona engine
- Memory windowing
- Tone-shift logic
- Safety routing
- Toolbelt logging
- BrewTruth integration  
 
### S4.5 requirements:
- Sandbox Mode
- Repo isolation layer
- Auto-fix proposal engine
- Idea risk → fix scoring  
- Commit-prep previews
- Persona-directed code rewrite mode
 
---
 
# 🧨 6. Risks & Constraints
 
### Known limitations:
- Dynamic emotionTier shifting not fully wired  
- Sandbox commit safety requires S4.5  
- BrewAssist repo is still merged with brewexec  
- No multi-model orchestration yet  
- No permissions system on toolbelt  
 
---
 
# 🚀 7. Roadmap After S4.5
 
**S5 – Repo Separation**
- brewassist/ created as standalone repo  
- Submodule or NPM package for BrewExec  
 
**S6 – SaaS Activation**
- tenant IDs  
- API keys  
- billing  
- BrewAI Cloud  
 
**S7 – Multi-model AI**
- OpenAI + Gemini + Mistral + local models  
 
**S8 – BrewAI Studio**
- Full GUI for building assistants
 
---
 
# ✅ Status: Complete (Doc 2/10)
 
 
---
 
Reply “Next” for Document 3 of 10 — BrewAssist Toolbelt (Tiers 1–3) Full Spec.