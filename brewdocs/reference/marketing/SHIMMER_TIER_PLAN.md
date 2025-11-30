# BrewRouter — Shimmer‑Tier Plan, Risks, and TODOs (v1, 2025‑11‑11 ET)

## Vision in One Line

A cockpit‑grade command router that turns chat commands into safe, logged shell actions across HRM, LLM, Supabase, and Git — with emotional fallback narration and Markdown auto‑logging.

---

## Why This Matters

- **Single mental model**: One slash command surface for everything (\hrm, \llm, \agent, \supa, \commit, etc.).
- **Contributor‑safe**: Centralized guardrails; nothing runs without clear routing.
- **Self‑documenting**: Every action logs to `~/.brewagent.log` + `MCP_README.md`.
- **UI parity**: Works in Web (Next), Tauri, and CLI.

---

## What We Shipped in This Drop

- **Shell**: `overlays/brewrouter.sh` — canonical command dispatcher with logging + fallback.
- **Server Layer (Next App Router)**: `/app/api/{hrm,llm,agent,router}/route.ts` endpoints.
- **Lib Runners**: TypeScript wrappers for HRM/LLM/Agent/Loop/Router.
- **Chat Parser Snippet**: Minimal handler to route chat input → API.
- **Memory Log Stub**: `.memory.md` for human summary/state.

---

## Execution Flow (Happy Path)

1. Chat UI receives input → parses command token (e.g., `/hrm do X`).
2. Next API calls the corresponding lib runner (child_process `exec`).
3. Shell overlay executes (HRM/LLM/Agent/Router).
4. Output is returned to UI and appended to logs.
5. If a runner fails, `brewrouter.sh` triggers fallback narration via `brewloop_llm.sh` and logs the incident.

---

## Guardrails

- All shell calls are **opaque to the browser** (server‑side only).
- Command white‑list enforced in `brewrouter.sh`.
- Log lines include timestamp + command + short args hash.
- Errors always return a **safe string** to the UI; stack traces stay server‑side.

---

## Known Risks & Mitigations

1. **Shell injection**: Args are quoted and commands are whitelisted. Keep it that way.
2. **Port collisions (11434)**: `brewport.sh` included; `brewrouter` exposes `/port` to check/clear.
3. **Env gaps**: `.env.local` loader in BrewShell helps; API returns clear error if runner not found.
4. **Permission issues**: Make sure `chmod +x ~/overlays/*.sh` and shells are on PATH.

---

## Immediate TODOs (P0‑P2)

- **P0**: Wire streaming responses for LLM endpoints (server‑sent events) to reduce latency.
- **P0**: Add `--dry-run` on dangerous routes (task delete, commit push) with explicit confirm token.
- **P1**: Add `/settings` schema (JSON) so router can toggle models (tinyllama/grok/openai) at runtime.
- **P1**: Ship minimal PWA for Web cockpit parity (install prompt + offline chat log cache).
- **P2**: BrewPulse audit hooks — emit structured telemetry for success/failure, latency, and tone.

---

## Test Matrix (Smoke)

- `/hrm` → returns reversed echo from HRM sim if Ollama absent.
- `/llm` → returns tinyllama output (or fallback narration).
- `/agent` → `brewagent intro` prints guardrail banner.
- `/router /status` → overlay presence & versions.
- `/router /supa` → Supabase CLI reachable and token present.

---

## Rollout Notes

- This is a **drop‑in** enhancement; no breaking changes to existing overlays.
- If Next API is App Router (recommended), endpoints live under `app/api/*/route.ts`.
- Web, Tauri, and CLI will share the same router surface.

---

## Future (Shimmer+)

- **Command macros**: user‑defined aliases with parameter prompts.
- **Conversation‑bound memory**: attach logs to project contexts and phases.
- **Live status sidebar**: model uptime, ports, last commit, last supabase push.
- **Role‑aware tone**: recruiter vs dev vs admin.

---

# 📣 Pivot Addendum — BrewAssist + Mistral + Agentic Chaining (2025‑11‑11 ET)

## Call: Good Idea? **Yes — with eyes open on ops.**

**Why**: Unifies brand and routing under one emotionally‑aware assistant, adds local/owned fallback (Mistral), and enables true multi‑agent orchestration. **Watchouts**: GPU/serve costs, Mistral ops, model drift, and chain‑of‑thought complexity.

### Benefits

- Single identity: **BrewAssist** orchestrates HRM, LLM, Mistral, and task agents.
- Fallback‑resilient: brewllm → brewllm_mistral → narrative fallback.
- Agentic: HRM → Task Agent (@Zahav) → Mistral escalation.

### Risks & Mitigations

- **Infra/GPU costs** → start with small Mistral, autoscale, batch long jobs.
- **Latency** → stream (SSE) and parallel probe primary + fallback.
- **Auth/keys** → Use `.env.local` and workspace‑scoped service accounts.
- **Observability** → emit BrewPulse telemetry: model, tokens, latency, outcome.

### Immediate TODOs (P0‑P2)

- **P0**: Ship `brewassist.sh` dispatcher; add `/api/brewassist`.
- **P0**: Add `brewllm_mistral.sh` (REST) with env checks + graceful failure.
- **P1**: Router macro: `/assist chain:"HRM>Agent>Zahav>Mistral" prompt:"…"`.
- **P1**: SSE streaming for `/api/{hrm,llm,brewassist}`.
- **P2**: BrewPulse cards: success rate, fallback rate, avg latency.

### Test Plan (Smoke)

- `/api/brewassist` w/ `mode:"auto"` → returns HRM or LLM response.
- Force fail primary → Mistral fallback path returns content + audit line.
- Chain to `@Zahav` agent → response contains agent tag and summary.

---

---
