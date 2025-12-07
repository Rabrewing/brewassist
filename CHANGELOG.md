## [2025-12-02] S4.5 – Cockpit Layout Stabilization

- Restored three-column grid layout for BrewAssist DevOps Cockpit
  (`.cockpit-left`, `.cockpit-center`, `.cockpit-right`).
- Moved old layout rules into modular CSS files:
  `cockpit-layout.css`, `cockpit-tree.css`, and wired them via `globals.css`.
- Stabilized `WorkspaceSidebarRight` so the Project Tree and AI Sandbox
  share the right column in a predictable flex layout.
- Cleaned up legacy `.cockpit-*` and `.workspace-*` styles to prevent
  conflicts and full-screen collapses.

# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-11-14

This release marks a major stabilization and refactoring of the BrewAssist DevOps AI Cockpit. It addresses numerous underlying bugs, improves the development workflow, and solidifies the application's architecture.

### 🚀 Features

- **Implemented Stubbed Commands:** Core functionalities for `/supa`, `/help`, and `/agent` have been implemented, replacing placeholder stubs with functional shell scripts.
- **Added Development Toolchain:** To improve code quality and prevent future errors, a professional development toolchain has been integrated:
  - **ESLint:** For TypeScript/JavaScript linting.
  - **Prettier:** For consistent, automated code formatting.
  - **Husky:** For running pre-commit hooks to ensure code quality before commits.

### 🐛 Bug Fixes

- **Core Command Router:** Fixed the frontend command parsing logic in `chat.js` to correctly distinguish between `/assist` commands (which go to `/api/brewassist`) and all other slash commands (which go to `/api/router`). This was the root cause of most command failures.
- **Shell Script Syntax:** Corrected multiple syntax errors in `brewassist.sh` (a missing `do` keyword and a missing `;;` terminator) that were causing all `/assist` commands to fail.
- **Emotion Engine Logic:** Fixed a "Negative Modulo Bug" in `lib/utils/emotion.ts` where a hashing function could produce a negative index, causing a runtime `TypeError`.
- **Next.js Port Conflicts:** Permanently resolved the persistent issue where the development server would not reliably start on `localhost:3000`.
  - The legacy Express server (`server.js`) was removed to eliminate the primary source of port conflicts.
  - The `dev` script in `package.json` was updated to permanently use port 3000 (`next dev -p 3000`).
- **Next.js 16 Compatibility:** Addressed startup warnings and errors related to the new version of Next.js and its Turbopack compiler by updating `next.config.js` to be fully compatible.

### 🏗️ Refactoring

- **Architectural Shift to Next.js:** The application's frontend architecture was refactored from a static `chat.html` file served by a legacy Express server to a pure, idiomatic Next.js application. The main entry point is now `pages/index.tsx`, which renders the React component-based UI. This simplifies the architecture, improves maintainability, and allows for full use of the Next.js framework.

### 📝 Documentation

- Created a comprehensive `DEBUG_LOG` to track the entire debugging and resolution process.
- Established a new workflow process document at `brewdocs/brewplay/workflow_process.md`.
- Created a `CHANGELOG.md` to document notable changes for each release.
- Organized and moved completed issue documentation into the `brewdocs/implement/close/` directory.

Major Change in the direction of the supporting AI's

**We're officially pivoting from Nemo/NIMs to Mistral for BrewExec's fallback architecture. This decision prioritizes contributor clarity, terminal-native codegen, and emotionally resonant onboarding.**

---

## 📜 BrewExec Architecture Update: From Nemo to Mistral

### 🧭 Why We're Moving Away from Nemo/NIMs

1. **Terminal-native clarity**: Nemo’s NIMs (NeMo Inference Modules) were designed for cloud-scale orchestration, not contributor-safe CLI fallback.
2. **Contributor bottlenecks**: NIMs required Triton, ONNX, and GPU-bound configs that blocked Jr Dev onboarding and local inference.
3. **Pre-fill mismatch**: Our prefill scaffolds (e.g. `brewagent.sh`, `brewloop.sh`) were gearing up for conversational fallback, but Nemo lacked chat-template support in GGUF or llama-cpp.
4. **Narration gaps**: Nemo’s outputs lacked the structured commentary and fallback tags needed for BrewExec replayability.

---

### 🔄 What We're Replacing

| Artifact            | Status        | Replacement                                  |
| ------------------- | ------------- | -------------------------------------------- |
| `brewagent_nemo.sh` | ❌ Deprecated | `brewagent_mistral.sh`                       |
| `nemo_runner.py`    | ❌ Removed    | `codegen_runner.py` with Mistral fallback    |
| `nemo_prefill.yaml` | ❌ Archived   | `mistral_prefill.yaml`                       |
| `brewloop_nemo.sh`  | ❌ Deprecated | `brewloop_gemini.sh` + `brewloop_mistral.sh` |

---

## 🧠 Why Mistral Is the Right Fit

- **GGUF-ready**: Mistral supports quantized GGUF formats, ideal for `llama-cpp-python` and CPU-bound fallback.
- **Chat-template aware**: `mistral-instruct` format is natively parsed by `llama_cpp`, enabling structured prompts.
- **Fast local inference**: With Q3_K_M variants, Mistral runs contributor-safe on low-resource machines.
- **Narration clarity**: Outputs are clean, teachable, and compatible with BrewExec’s fallback tags.

---

## 🧪 Implementation Plan

### Phase 1: Model Swap

1. ✅ Remove Nemo/NIMs from all fallback scripts
2. ✅ Download `mistral-7b-instruct-v0.2.Q3_K_M.gguf` to `~/brewexec/models/`
3. ✅ Update `deepseek_gguf_test.py` to confirm load
4. ✅ Scaffold `codegen_runner.py` with:
   - `llama_cpp` GGUF fallback
   - `distilgpt2` fallback
   - Stub fallback
   - Narration tags: `# ── Fallback: GGUF ──`, etc.

---

### Phase 2: Prefill & CLI Update

5. 🔄 Replace `nemo_prefill.yaml` with `mistral_prefill.yaml`
6. 🔄 Update `brewagent.sh` and `brewloop.sh` to reference Mistral
7. 🔄 Remove all Nemo references from onboarding docs, README, and contributor guides

---

### Phase 3: Gemini CLI Sync

8. 🧭 Gemini CLI must:
   - Check for GGUF model presence at `~/brewexec/models/`
   - Use `llama_cpp` with `chat_template=mistral-instruct`
   - Log fallback tags for replayability
   - Respect BrewExec’s `brewlog` and `brewreplay.sh` hooks

---

## 🌍 Where Mistral Stands in the Landscape

| Model                                   | Strengths                                        | BrewExec Role         |
| --------------------------------------- | ------------------------------------------------ | --------------------- |
| **Mistral**                             | Fast, quantized, GGUF-ready, chat-template aware | Primary fallback      |
| **Gemini**                              | Multimodal, conversational, cloud-native         | Primary cockpit       |
| **Grok (OpenCode)**                     | Real-time, edgy, math/code heavy                 | HRM simulation layer  |
| **LLaMA**                               | Open-weight, versatile, GGUF-compatible          | Legacy fallback       |
| **HRM (Hierarchical Reasoning Models)** | Simulated contributor arcs                       | Onboarding simulation |