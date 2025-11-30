# 🧠 BrewExec Blueprint: DevOps Cockpit + AI Overlay System

---

## 🏗️ Core Architecture Overview

| Layer                   | Purpose                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Shell Overlay Layer** | Modular `.sh` scripts that route commands, simulate agents, and trigger AI narration |
| **API Layer**           | `/api/` endpoints mapped to each overlay for web-based or CLI invocation             |
| **AI Layer**            | Fallback chain: Gemini CLI → HRM → Grok → Mistral                                    |
| **Contributor Layer**   | Simulated onboarding arcs, fallback narration, and persona YAMLs                     |
| **Creative Layer**      | BrewDesigns modules for visual storytelling, branding, and UI flows                  |
| **System Layer**        | `.env.local`, `.gitignore`, and BrewStatus for runtime flags and health checks       |

---

## 📁 Directory Structure

```
~/brewexec/
├── brewassist-core/         # Core AI logic and fallback routing
├── overlays/                # All shell overlays (.sh files)
├── scripts/                 # Utility scripts (reporesetpush.sh, brewcommit.sh)
├── components/              # UI components (chat, status, onboarding)
├── pages/                   # Next.js pages (chat UI, onboarding flows)
├── lib/                     # Shared logic and API handlers
├── server.js                # Node server entrypoint
├── .env.local               # Runtime flags (USE_MISTRAL, tone override)
├── .gitignore               # Excludes system folders and legacy modules
└── README.md                # Contributor-safe overview (currently empty)
```

---

## 🧩 Shell Overlays and Slash Commands

| Slash Command | Shell File      | API Route       | Purpose                                                                      |
| ------------- | --------------- | --------------- | ---------------------------------------------------------------------------- |
| `/assist`     | brewassist.sh   | /api/brewassist | 🎯 Unified AI entrypoint — routes prompt through HRM → Agent → LLM → Mistral |
| `/hrm`        | brewhrm.sh      | /api/hrm        | 🧭 Human-Resource Mind — strategy + planning narration                       |
| `/llm`        | brewllm.sh      | /api/llm        | 🧠 Primary model output (TinyLLaMA / Gemini / Grok)                          |
| `/agent`      | brewagent.sh    | /api/agent      | 🧩 Task dispatcher — simulates or delegates to agents (e.g., @Zahav)         |
| `/router`     | brewrouter.sh   | /api/router     | 🔀 Core command router — safe shell execution and overlay selection          |
| `/loop`       | brewloop.sh     | /api/loop       | 🔁 Gemini-style commentary loop (HRM planning)                               |
| `/loop_llm`   | brewloop_llm.sh | /api/loop_llm   | 💬 Continuous LLM narration or thought loop                                  |
| `/loop_s`     | brewloop_s.sh   | /api/loop_s     | 🤫 Silent fallback loop (minimal output)                                     |
| `/design`     | brewdesigns.sh  | —               | 🎨 Launch creative modules (BrewGold / BrewLotto)                            |
| `/guide`      | brewguide.sh    | —               | 📘 Open BrewGuide onboarding or documentation overlay                        |
| `/status`     | brewstatus.sh   | —               | 🩺 System health, overlay readiness, emotional tone snapshot                 |
| `/switch`     | brewenv         | —               | 🔁 Switch active project/environment                                         |
| `/settings`   | .env.local      | —               | ⚙️ Toggle runtime flags (USE_MISTRAL, tone override, etc.)                   |
| `/help`       | brewhelp.sh     | —               | 📜 Display all available commands with tone examples                         |

---

## 🧠 AI Models and Fallback Chain

| Layer       | Model                     | Purpose                                    |
| ----------- | ------------------------- | ------------------------------------------ |
| Primary CLI | Gemini CLI                | Fast, local narration and planning         |
| Fallback 1  | HRM (Human-Resource Mind) | Strategic planning, onboarding clarity     |
| Fallback 2  | Grok                      | Conversational fallback with reasoning     |
| Fallback 3  | Mistral                   | Final fallback — minimal tone, safe output |

> All routed via `/assist` overlay with tone, emoji, and contributor-safe narration.

---

## 🧬 Agent Simulation and Persona Logic

| Agent    | Role                                           |
| -------- | ---------------------------------------------- |
| `@Zahav` | Strategic planner, fallback narrator           |
| `@Pulse` | Contributor insight and emotional tone monitor |
| `@Gold`  | Creative module launcher (BrewGold, BrewLotto) |
| `@Loop`  | Commentary loop engine (Gemini + HRM)          |

> Agents are simulated via `brewagent.sh` and routed through `/agent`.

---

## 🧠 Contributor Simulation Decks

| File               | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------- |
| brewpersona.yaml   | Defines contributor types, fallback preferences, onboarding arcs    |
| brewloop_gemini.sh | Simulates multi-turn onboarding narration with Gemini commentary    |
| brewreplay.sh      | Replays onboarding or debugging sessions with timestamped narration |
| logger.py          | Logs AI commentary, fallback triggers, and emotional tone snapshots |

---

## 💬 Chat UI Variants

| UI                        | Location     | Purpose                                                    |
| ------------------------- | ------------ | ---------------------------------------------------------- |
| chat.html                 | Legacy UI    | Basic prompt + response                                    |
| chat-ui/                  | Modular      | React/Next.js-based — supports slash commands, tone, emoji |
| pages/chat.tsx            | Next.js page | Full BrewAssist cockpit with overlay routing               |
| components/ChatBubble.tsx | UI component | Narratable, tone-aware chat bubbles                        |

---

## 🩺 System Health and Runtime Flags

| File          | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| .env.local    | Flags like `USE_MISTRAL`, `TONE_OVERRIDE`, `SAFE_MODE`       |
| brewstatus.sh | Snapshot of system health, overlay readiness, emotional tone |
| brewenv       | Switch active project (e.g., BrewPulse, BrewGold)            |

---

## 🧹 Git Hygiene and Contributor Safety

- `.gitignore` excludes:
  - `.aws/`, `.azure/`, `.cargo/`, `.nvm/`
  - Legacy modules: `brewexec-platform/`, `brewgold/`, `brewsearch/`, etc.

- `reporesetpush.sh` reinitializes repo, purges embedded Git folders
- `brewcommit.sh` automates safe commits with narration

---

## 🧠 BrewAssist DevOps Cockpit: Concept Summary

> A modular, emotionally resonant CLI cockpit for contributor onboarding, strategic planning, and creative module orchestration. Every overlay is narratable, fallback-safe, and designed to empower contributors with clarity, tone, and teachability.

- 🧠 AI fallback chain ensures resilience
- 🧩 Agents simulate planning, narration, and task delegation
- 🔁 Commentary loops guide onboarding and debugging
- 🎨 Creative modules launch visual storytelling and branding
- 📜 Slash commands unify shell and UI logic
- 🧹 Git hygiene ensures contributor-safe pushes
