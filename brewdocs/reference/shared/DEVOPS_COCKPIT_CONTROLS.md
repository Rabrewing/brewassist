# BrewAssist DevOps Cockpit Controls

**Root:** `~/brewexec`

**Scope:** All BrewAssist-related overlays in `~/brewexec/overlays/`, their `/commands`, and how to test them so Gemini, Co‑P, and RB share one source of truth.

---

## 1. Mental Model

BrewAssist sits at the center of a **command cockpit**:

* Front-door: `/assist` via `brewassist.sh` (Gemini → HRM → Grok → Mistral)
* Specialized overlays: `/hrm`, `/llm`, `/agent`, `/loop_*`, `/supa`, `/status`, etc.
* Routing: `/router` via `brewrouter.sh`
* Logging + replay: `brewlog.sh`, `brewreplay.sh`

Every overlay should:

1. Have a clear **slash command**.
2. Print a short **header line** so humans know what ran.
3. Be testable with a **simple, documented command**.

This file defines:

* Command map
* Guide/walkthrough shape for `/guide` + `/help`
* Per-command tests (for Gemini / Co‑P to run and validate)

---

## 2. Command Map (Overlays → Slash Commands)

> Co‑P’s earlier table is mostly correct. This version cleans up naming, aligns with existing docs (Mistral Takeover, Engine Test Suite), and marks stubs.

| Overlay Script           | Slash Command        | Purpose                                               | Status       |
| ------------------------ | -------------------- | ----------------------------------------------------- | ------------ |
| `brewassist.sh`          | `/assist`            | Unified AI entrypoint (Gemini → HRM → Grok → Mistral) | **Core**     |
| `brewagent.sh`           | `/agent`             | Simulate agents ( @Zahav, @Pulse, @brewdocs/reference/brewplay/BrewDocs_File_Management.md, @pages/api/loop.ts)        | **Core**     |
| `brewagent_mistral.sh`   | *(internal)*         | Mistral-backed agent wrapper for codegen_runner       | **Core**     |
| `brewhrm.sh`             | `/hrm`               | Strategic planning / onboarding narration             | **Core**     |
| `brewllm.sh`             | `/llm`               | Primary LLM output (TinyLLaMA / Gemini / Grok)        | **Core**     |
| `brewllm_fallback.sh`    | *(internal)*         | Fallback narration helper (optional)                  | Stub/opt     |
| `brewloop.sh`            | `/loop`              | Generic commentary loop                               | Nice-to-have |
| `brewloop_gemini.sh`     | `/loop_gemini`       | Gemini-based onboarding loop                          | P1           |
| `brewloop_llm.sh`        | `/loop_llm`          | LLM-based commentary loop                             | P1           |
| `brewloop_mistral.sh`    | `/loop_mistral`      | Mistral GGUF loop (from Mistral Takeover)             | **Core**     |
| `brewcommit.sh`          | `/commit`            | Safe Git commit with narration                        | Core/P1      |
| `brewcontainer_check.sh` | `/container_check`   | Docker/container sanity check                         | P2           |
| `brewdesigns.sh`         | `/design`            | Launch BrewGold/BrewLotto/BrewExec creative modules   | P2           |
| `breweval.sh`            | `/eval`              | Evaluate model output / fallback quality              | Stub/P2      |
| `grokrunner.sh`          | `/grok`              | Direct Grok / OpenCode runner                         | P1           |
| `brewguide.sh`           | `/guide`             | BrewGuide walkthrough page                            | **Core**     |
| `brewhelp.sh`            | `/help`              | Command reference + tone examples                     | **Core**     |
| `brewinit.sh`            | `/init`              | Initialize contributor environment                    | P1           |
| `brewlaunch.sh`          | `/launch`            | Launch modules or agents                              | P2           |
| `brewopt.sh`             | `/opt`               | Optimization / tuning overlay                         | Stub/P2      |
| `brewport.sh`            | `/port`              | Check/clear port collisions (11434, 3000, etc.)       | P1           |
| `brewrouter.sh`          | `/router`            | Core command router                                   | **Core**     |
| `brewstatus.sh`          | `/status`            | System health snapshot + tone                         | **Core**     |
| `brewsupa.sh`            | `/supa`              | Supabase CLI + token health                           | P1           |
| `brewstack.sh`           | `/stack`             | Show active model stack + fallback chain              | P1           |
| `brewtest.sh`            | `/test`              | Run structured tests (Mistral, engines, overlays)     | P1           |
| `brewupdate.sh`          | `/update`            | Pull latest overlays / configs                        | P2           |
| `brewlog.sh`             | `/log` (optional)    | Logged Mistral loop (session_*.log)                   | **Core**     |
| `brewreplay.sh`          | `/replay` (optional) | Replay logged sessions                                | **Core**     |

> If script names differ slightly on disk, this table represents the **desired canonical names** going forward.

---

## 3. What `/guide` Should Look Like

`/guide` (via `brewguide.sh` or `/api/guide`) should render a **high-level walkthrough**:

* What BrewAssist is
* How to start (`/init` → `/assist` → `/commit` → `/status`)
* Where to find logs
* How to ask for help (`/help`)

### 3.1 Minimal `/guide` Content (Markdown)

When `/guide` is called from the chat UI or CLI, it should return something *shaped like*:

```markdown
# BrewAssist DevOps Cockpit — Quick Start

1. **Initialize your session**
   - Run `/init` to set project context and create a `.memory.md` if needed.

2. **Talk to BrewAssist**
   - Use `/assist "Describe what I'm building"` to get a narrated summary.
   - Use `/assist --engine gemini` or `--engine mistral` when you want a specific model.

3. **Plan and debug**
   - Use `/hrm` for onboarding and strategy narration.
   - Use `/grok` for deep reasoning / reviewer-style feedback.
   - Use `/llm` for general LLM responses.

4. **Run tests and check status**
   - `/test` to run the engine + overlay health tests.
   - `/status` to see system health and emotional tone.
   - `/stack` to see which models are active in the fallback chain.

5. **Log and replay sessions**
   - `/log` (or run `brewlog.sh`) to record a session.
   - `/replay` to replay a previous session from `~/brewexec/logs/`.

For more detail, run `/help`.
```

> In the chat UI, this Markdown can be rendered as a scrollable help block; in CLI, it can be printed as plain text.

---

## 4. What `/help` Should Look Like

`/help` is the **command reference**. It doesn’t need to explain architecture, just:

* command → one-line purpose
* emoji tone
* minimal example

### 4.1 Minimal `/help` Output Shape

```text
📜 BrewAssist Cockpit — Command Reference

/assist      🎯 Unified AI entrypoint (Gemini → HRM → Grok → Mistral)
/hrm         🧭 Strategic onboarding & planning narrator
/llm         🧠 Generic LLM output (TinyLLaMA / Gemini / Grok)
/agent       👥 Simulate agents ( @Zahav, @Pulse, @brewdocs/reference/brewplay/BREWDOCS_FILE_MANAGEMENT_INSTRUCTIONS.md, @pages/api/loop.ts)
/loop        🔁 Generic commentary loop
/loop_mistral 🧠 Mistral GGUF loop (local fallback)
/commit      📦 Git commit with narrated message
/status      🩺 System health + emotional tone snapshot
/supa        🗄  Supabase CLI + token health
/router      🔀 Route commands to correct overlay
/stack       🧱 Show model stack & fallback chain
/test        ✅ Run BrewAssist + Mistral test suites
/help        📜 Show this help menu
/guide       📘 Show full walkthrough
```

> Co‑P’s concept here was good; this version just aligns with your Mistral pivot and logging plan.

---

## 5. Per-Command Test Suite (For Gemini / Co‑P)

Below are **concrete tests** Gemini, Co‑P, or RB can run to validate each command. These sit on top of:

* **Mistral Takeover** test matrix (GGUF/agents)
* **BrewAssist Engine Test Suite** (Gemini/Grok/HRM/TinyLLaMA)

### 5.1 `/assist` — Unified AI Entry

**CLI Test:**

```bash
/assist "Explain what the BrewExec DevOps cockpit does in 3 bullet points."
```

**Expected:**

* Narrated answer about BrewExec cockpit.
* Mentions routing, overlays, or fallback chain.
* If you log JSON from `/api/brewassist`, it should include `tone`, `emoji`, `persona`, and `chain`.

**Failure modes to log:**

* No output → check `/api/brewassist` route.
* Missing tone/emoji → check `selector.build_chain()` wiring.

---

### 5.2 `/agent` — Agent Simulation

**CLI Test:**

```bash
/agent "Simulate @Zahav reviewing the BrewAssist fallback design."
```

**Expected:**

* Output reads like a persona ( @Zahav) giving critique.
* May reference risks, improvements, or phase tags.

If using `brewagent_mistral` under the hood, you can also run:

```bash
./overlays/brewagent_mistral.sh "Write a Python helper for logging fallback events."
```

---

### 5.3 `/hrm` — Strategic Narration

**CLI Test:**

```bash
/hrm "Onboard a new contributor to BrewExec in 3 steps."
```

**Expected:**

* 2–5 bullet points.
* Uses onboarding / contributor language.
* Aligns with HRM description in `brewpersona.yaml`.

---

### 5.4 `/llm` — Generic LLM

**CLI Test:**

```bash
/llm "Summarize the BrewExec Mistral Takeover in one paragraph."
```

**Expected:**

* Coherent summary of Mistral pivot (no mention of NeMo).
* If TinyLLaMA is backing it, response may be shorter/rougher but should still be readable.

If you’re using Ollama or a local LLM server, also confirm the port with:

```bash
nc -zv localhost 11434
```

---

### 5.5 `/loop` and `/loop_mistral`

**CLI Test (`/loop_mistral` recommended core):**

```bash
/loop_mistral
# then in the loop:
hello world example
exit
```

**Expected:**

* For each prompt, codegen_runner-based output is printed.
* Includes fallback tags like `# ── Fallback: Mistral (GGUF) ──` when applicable.
* `exit` cleanly terminates.

---

### 5.6 `/commit` — Git Narration

**CLI Test:**

```bash
/commit "Test BrewAssist DevOps cockpit commit path."
```

**Expected:**

* Short header from `brewcommit.sh` (e.g., `# ── BrewExec Commit ──`).
* Under the hood: `git status` + `git commit -m "..."` (logic may be guarded by SAFE_MODE).
* If SAFE_MODE is on, it may just simulate the commit.

**Safety:**

* For first runs, ensure `brewcommit.sh` supports a `--dry-run` mode so Gemini doesn’t accidentally make real commits.

---

### 5.7 `/design` — Creative Launcher

**CLI Test (once `brewdesigns.sh` is implemented):**

```bash
/design "Open BrewLotto design module."
```

**Expected:**

* A header like `# ── BrewDesigns: BrewLotto ──`.
* A message stating where the design artifacts or docs are located (e.g., `/brewgold/`, `/brewlotto/`).

For now, mark as **P2** and ensure script at least prints a friendly TODO and doesn’t crash.

---

### 5.8 `/guide` — Walkthrough

**CLI Test:**

```bash
/guide
```

**Expected:**

* Markdown-style block similar to section **3.1 Minimal `/guide` Content**.
* Mention of `/init`, `/assist`, `/status`, `/test`, `/log`, `/replay`.

If called via `/api/guide`, JSON should include a `response` field with the same text, which the chat UI can display in a help panel.

---

### 5.9 `/help` — Command Reference

**CLI Test:**

```bash
/help
```

**Expected:**

* Table/list similar to section **4.1 Minimal `/help` Output Shape**.
* At least: `/assist`, `/hrm`, `/llm`, `/agent`, `/loop_mistral`, `/status`, `/stack`, `/test`, `/help`, `/guide`.

---

### 5.10 `/status` — Health Snapshot

**CLI Test:**

```bash
/status
```

**Expected:**

* Small summary:

  * Overlay availability (check for executable scripts).
  * Model health (Gemini/Grok/TinyLLaMA/Mistral flags).
  * Emotional tone (e.g., `🎯 focused` from persona).

Internally, this can read from the same selectors used by `/api/brewassist` so that chat and CLI agree.

---

### 5.11 `/supa` — Supabase Check

**CLI Test:**

```bash
/supa
```

**Expected:**

* Confirmation that `supabase` CLI is installed.
* Confirmation that `SUPABASE_URL` and `SUPABASE_ANON_KEY` (or `SUPABASE_TOKEN`) are present.

Failure states should be explicit (missing CLI, missing env, etc.), not silent.

---

### 5.12 `/stack` — Model Stack Inspection

**CLI Test:**

```bash
/stack
```

**Expected:**

* Small table or list like:

```text
Active chain (persona=contributor):
- gemini   (primary cockpit)
- hrm      (strategy)
- grok     (reasoning)
- mistral  (local GGUF fallback)
```

Implementation tip: reuse `build_chain()` from `selector.py` so this always matches reality.

---

### 5.13 `/test` — Aggregated Tests

**CLI Test:**

```bash
/test
```

**Expected:**

* A short summary that **invokes**:

  * Mistral Takeover tests (12.x series) or a subset.
  * BrewAssist Engine Test Suite (Gemini/Grok/HRM/TinyLLaMA).
* Output similar to:

```text
✅ Mistral GGUF load
✅ codegen_runner basic
✅ Gemini CLI
✅ HRM overlay
✅ TinyLLaMA connectivity
...
```

For now, it can be a thin wrapper that calls a Python test harness or a set of shell checks and aggregates the result.

---

### 5.14 `/update` — Overlay/Config Refresh

**CLI Test (once implemented):**

```bash
/update
```

**Expected:**

* Either a simulated `git pull` + overlay sync, or a clear TODO.
* Should never silently overwrite local changes without warning.

---

### 5.15 `/router` — Command Router

**CLI Test:**

```bash
/router /status
```

**Expected:**

* Router header (e.g., `# ── BrewRouter ──`).
* Delegated `/status` output.
* If logging is enabled, an entry in `~/.brewpulse_agents.log` or equivalent.

This should mirror the behavior described in **“BrewRouter — Shimmer-Tier Plan, Risks, and TODOs”**.

---

### 5.16 `/log` and `/replay` — Session Management

These are already captured in **Mistral Takeover §9**, but for completeness:

**Log Test:**

```bash
/log
# then in loop
Explain the BrewExec cockpit.
exit
```

Check:

```bash
ls ~/brewexec/logs
cat ~/brewexec/logs/session_*.log
```

**Replay Test:**

```bash
/replay ~/brewexec/logs/session_*.log
```

Expected:

* Full session playback, including prompts and fallback tags.

---

## 6. Guidance for Gemini / Co‑P

When Gemini or Co‑P is working on this project, they should:

1. Treat **this file**, **Mistral Takeover**, and **BrewAssist Engine Test Suite** as the **three pillars** for BrewAssist/BrewExec cockpit behavior.
2. Use the per-command tests in §5 as their **checklist** when wiring or refactoring overlays.
3. Keep `/guide` and `/help` aligned with:

   * Active commands in this file
   * Actual scripts present in `~/brewexec/overlays/`
4. Prefer `python3 -m brewassist_core.agents.codegen_runner` over direct file paths for Mistral.
5. Log any new or changed commands into this document (new section) so RB always has a single source of truth.

Once all commands in §5 pass their tests, BrewAssist’s DevOps Cockpit can be considered **shimmer-tier ready** for both human contributors and AI copilots.
