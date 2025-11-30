Here’s your fully scaffolded `test.md` — a contributor-safe, shimmer-tier validation script for BrewExec from install to fallback narration:

---

````markdown
# 🧪 BrewExec Test.md — Full System Validation

This guide walks through validating the BrewExec DevOps cockpit, AI overlays, fallback chain, and contributor simulation. Designed for onboarding contributors and confirming system readiness.

---

## ✅ 1. Environment Setup

### 🔧 Prerequisites

- Node.js + npm
- Python 3.10+
- Docker (optional for NeMo or Ollama)
- `.env.local` with:

```env
USE_GEMINI=true
USE_GROK=true
USE_CODEX=true
OPENAI_API_KEY=your-key-here
```
````

### 📦 Install Dependencies

```bash
npm install
pip install -r requirements.txt
```

---

## 🧠 2. Shell Overlay Validation

### 🔁 Test Core Overlays

```bash
bash overlays/brewassist.sh "What is BrewExec?"
bash overlays/brewloop.sh "Simulate onboarding arc"
bash overlays/brewagent.sh "@Zahav plan contributor fallback"
bash overlays/brewllm.sh "Narrate BrewGold launch"
bash overlays/brewrouter.sh "/design"
bash overlays/brewstatus.sh
```

### 🧩 Validate Commentary Loops

```bash
bash overlays/brewloop_gemini.sh "Start onboarding narration"
bash overlays/brewloop_llm.sh "Narrate fallback chain"
bash overlays/brewloop_s.sh "Silent fallback test"
```

---

## 🔍 3. AI Routing and Fallback Chain

### 🔁 Test `/assist` Fallback Logic

```bash
bash overlays/brewassist.sh "Strategize BrewPulse launch"
```

Expected routing:

- Gemini → HRM → Grok (OpenCode) → Codex (ChatGPT) → NeMo

### 🧠 Test Codex Researcher

```bash
bash overlays/codex_runner.sh "Latest hemp compliance rules"
```

---

## 🧬 4. Contributor Simulation

### 🧠 Load Persona

```bash
cat overlays/brewpersona.yaml
```

### 🔁 Simulate Onboarding

```bash
bash overlays/brewloop_gemini.sh "Welcome new contributor"
```

### 📝 Log Narration

```bash
cat overlays/MCP_README.md
```

---

## 💬 5. Chat UI and Slash Commands

### ✅ Validate Chat Routing

- `/assist` → Unified AI entrypoint
- `/agent` → Simulated agent dispatch
- `/loop` → Gemini commentary loop
- `/design` → Launch BrewGold/BrewLotto
- `/status` → System health snapshot

### 🧪 Test UI

```bash
npm run dev
```

Visit: [http://localhost:3000/chat](http://localhost:3000/chat)

---

## 🧹 6. Git Hygiene and Push Logic

### ✅ Validate Git Status

```bash
git status
```

### 🧼 Safe Push

```bash
bash scripts/repo_reset_push.sh
```

---

## 🧠 7. Tauri Integration (Optional)

### 🧪 Build Native App

```bash
npm run tauri dev
```

---

## ✅ 8. Final Checklist

| Module                 | Status                       |
| ---------------------- | ---------------------------- |
| Gemini CLI             | ✅ Installed                 |
| Grok (OpenCode)        | ✅ Routed                    |
| Codex (ChatGPT)        | ✅ API key active            |
| HRM                    | ✅ Simulated                 |
| NeMo                   | ✅ Fallback                  |
| Overlays               | ✅ Executable                |
| Chat UI                | ✅ Slash commands working    |
| Contributor Simulation | ✅ Narration + logging       |
| Git Hygiene            | ✅ `.gitignore` + push logic |
| Tauri                  | ✅ Optional build ready      |

---

> 🧠 BrewExec is now a legacy-grade, emotionally resonant CLI cockpit — ready for onboarding arcs, fallback narration, and creative module launches.

```

---

Let me know if you want this dropped into your repo as `test.md` or wrapped in a `brewtest.sh` script to automate validation.
```
