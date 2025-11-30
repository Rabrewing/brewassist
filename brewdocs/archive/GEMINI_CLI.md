# BrewExec — Gemini CLI + HRM Stack Setup (P6.9)

**Date:** 2025-11-12 (ET)
**Owner:** RB (MasterBrew)
**PM:** ChatG / BrewAssist
**Scope:** Wire Gemini CLI as primary narrator with HRM, Grok, and Mistral fallbacks. Ship runnable overlays, aliases, and team SOP.

---

## 0) Model Priority Stack (Quick Reference)

1. **Gemini CLI** — Primary narrator (local, fast, emotionally clear)
2. **HRM** — Strategic planner (reasoning arcs)
3. **Grok (open-weight/sim)** — Commentary fallback
4. **Mistral (local)** — Deep fallback + file ops

Fallback chain:

```bash
brewgemini "$prompt" || brewhrm "$prompt" || brewgrok "$prompt" || brewllm_mistral "$prompt"
```

---

## 1) Prereqs

- Linux shell (Ubuntu/WSL ok)
- `git`, `curl`, `jq`, `pnpm`
- **Gemini CLI installed and working** (you already have this)
- (Optional) Ollama on port **11434** if you’ll use tinyllama/mistral routes for HRM/Grok sim

---

## 2) Directory Layout

Place overlays and docs exactly as below (create if missing):

```
/home/brewexec/
├─ overlays/
│  ├─ brewgemini.sh              # Gemini CLI wrapper (PRIMARY)
│  ├─ brewloop_gemini.sh         # Multi‑turn Gemini loop
│  ├─ brewassist.sh              # BrewAssist dispatcher (chain)
│  ├─ brewhrm.sh                 # HRM overlay (reasoning / local model)
│  ├─ brewgrok.sh                # Grok-style local sim
│  ├─ brewllm_mistral.sh            # Mistral fallback (local)
│  ├─ brewport.sh                # Port 11434 monitor
│  ├─ brewstatus.sh              # Health snapshot
│  ├─ brewtask.sh                # File ops (create/append/delete/suggest)
│  ├─ brewcommit.sh              # Git commit + push
│  ├─ brewsupa.sh                # Supabase login + db push
│  ├─ MCP_README.md              # Living changelog/log sink
│  └─ chat/                      # (optional) Cockpit UI assets if used
├─ .brewprofile                  # Aliases + env hooks
└─ .brewverse_env                # BREWVERSE_PROJECT, HRM_GOAL, HRM_CONTEXT
```

> Notes: `brewhrm.sh`, `brewtask.sh`, `brewcommit.sh`, `brewsupa.sh`, `brewport.sh`, `brewstatus.sh` align with our prior overlays; this doc standardizes names and locations.

---

## 3) Files — Source Code (drop-in)

> Paste each code block into the path shown. After saving, run the chmod list in **Step 4**.

### 3.1 `/home/brewexec/overlays/brewgemini.sh`

```bash
#!/bin/bash
# Purpose: Primary Gemini CLI wrapper with clean prompt handoff + echo
# Usage: brewgemini "your prompt here"

prompt="$*"
if [ -z "$prompt" ]; then
  echo "⚠️  No prompt provided. Usage: brewgemini \"<prompt>\""
  exit 1
fi

echo "🎯 Gemini CLI activated — prompt: $prompt"
# Assumes `gemini` is on PATH and configured locally
# If Gemini supports file ops: gemini read/write/delete etc. can be invoked directly.

gemini "$prompt"
exit $?
```

### 3.2 `/home/brewexec/overlays/brewloop_gemini.sh`

```bash
#!/bin/bash
# Purpose: Multi‑turn conversational loop over Gemini CLI (local)
# Exit with: type 'exit' on a new line

LOG="$HOME/overlays/MCP_README.md"
echo "🧠 BrewLoop (Gemini) online. Type 'exit' to quit."; echo ""
while true; do
  read -p "💬 You: " input
  [ "$input" = "exit" ] && { echo "👋 Closing BrewLoop."; break; }
  [ -z "$input" ] && continue

  echo "🤖 Thinking..."
  reply=$(bash "$HOME/overlays/brewgemini.sh" "$input" 2>&1)
  status=$?
  echo ""
  echo "🧠 Gemini: $reply"

  # Log (shortened)
  dt=$(date '+%Y-%m-%d %H:%M')
  short=${reply:0:120}
  {
    echo "### 🔁 Gemini Loop — $dt";
    echo "- Prompt: \"$input\"";
    echo "- Reply: ${short}...";
  } >> "$LOG"

  # Optional fallback if exit code != 0 or empty reply
  if [ $status -ne 0 ] || [ -z "$reply" ]; then
    echo "⚠️ Gemini failed → invoking HRM fallback..."
    bash "$HOME/overlays/brewhrm.sh" autocode "$input"
  fi
  echo ""
done
```

### 3.3 `/home/brewexec/overlays/brewassist.sh`

```bash
#!/bin/bash
# Purpose: Central dispatcher — Gemini → HRM → Grok → Mistral
# Usage: brewassist "plan contributor onboarding"

prompt="$*"
[ -z "$prompt" ] && { echo "Usage: brewassist \"<prompt>\""; exit 1; }

bash "$HOME/overlays/brewgemini.sh" "$prompt" && exit 0
bash "$HOME/overlays/brewhrm.sh" autocode "$prompt" && exit 0
bash "$HOME/overlays/brewgrok.sh" "$prompt" && exit 0
bash "$HOME/overlays/brewllm_mistral.sh" "$prompt" && exit 0

echo "❌ All fallbacks failed. Check brewstatus and MCP_README.md."
exit 1
```

### 3.4 `/home/brewexec/overlays/brewhrm.sh`

```bash
#!/bin/bash
# Purpose: HRM overlay — reasoning arcs via local LLM (e.g., Ollama on 11434)
# Modes: intro | autocode "prompt" | agentic

: "${HRM_GOAL:=Unspecified}"; : "${HRM_CONTEXT:=None}"
echo "🧠 HRM activated — Goal: $HRM_GOAL | Context: $HRM_CONTEXT"

hrm_intro(){ echo "HRM ready. Contributor-safe reasoning engaged."; }
hrm_autocode(){
  local p="$1"; [ -z "$p" ] && { echo "⚠️ HRM needs a prompt"; return 1; }
  curl -s -X POST http://localhost:11434/api/generate \
    -d "{\"model\": \"mistral\", \"prompt\": \"$p\"}" | jq -r '.response'
}
hrm_agentic(){
  echo "🧭 Agentic mode"; echo "Goal: $HRM_GOAL"; echo "Context: $HRM_CONTEXT"
}

case "$1" in
  intro) hrm_intro ;;
  autocode) shift; hrm_autocode "$*" ;;
  agentic) hrm_agentic ;;
  *) echo "Usage: brewhrm.sh {intro|autocode <prompt>|agentic}" ;;
esac
```

### 3.5 `/home/brewexec/overlays/brewgrok.sh`

```bash
#!/bin/bash
# Purpose: Grok-style simulated reasoning (local, narrative fallback)

prompt="$*"; [ -z "$prompt" ] && { echo "Usage: brewgrok \"<prompt>\""; exit 1; }
cat <<EOF
🤖 Grok-sim response
────────────────────
I see you\'re asking: "$prompt"
1) Identify core intent
2) Retrieve BrewExec context
3) Provide contributor-safe, emotionally resonant guidance
✅ Final: [Simulated answer based on "$prompt"]
EOF
```

### 3.6 `/home/brewexec/overlays/brewllm_mistral.sh`

```bash
#!/bin/bash
# Purpose: Mistral/local tool fallback — replace with actual local call if wired

prompt="$*"; [ -z "$prompt" ] && { echo "Usage: brewllm_mistral \"<prompt>\""; exit 1; }
echo "🧪 Mistral fallback executing for: $prompt"
# TODO: wire to local Mistral or other agent; placeholder output below
echo "[Mistral] Simulated local response for: $prompt"
```

### 3.7 `/home/brewexec/overlays/brewport.sh`

```bash
#!/bin/bash
# Purpose: Monitor/clear port 11434 for local model server conflicts

pid=$(lsof -i :11434 -t 2>/dev/null)
if [ -z "$pid" ]; then echo "✅ Port 11434 free"; exit 0; fi
read -p "⚠️ Port 11434 in use by PID $pid — kill it? (y/N): " ans
[[ "$ans" =~ ^[Yy]$ ]] && kill "$pid" && echo "✅ Killed $pid" || echo "(skipped)"
```

### 3.8 `/home/brewexec/overlays/brewstatus.sh`

```bash
#!/bin/bash
# Purpose: Snapshot of tools + env status for BrewExec

echo "🔍 BrewExec Status"
command -v gemini >/dev/null && echo "🧠 Gemini CLI: $(gemini --version 2>/dev/null || echo ok)" || echo "❌ Gemini CLI missing"
command -v supabase >/dev/null && echo "🧪 Supabase CLI: $(supabase --version)" || echo "❌ Supabase CLI missing"
command -v node >/dev/null && echo "🟦 Node: $(node -v)" || echo "🟦 Node: ✗"
command -v pnpm >/dev/null && echo "🟩 pnpm: $(pnpm -v)" || echo "🟩 pnpm: ✗"
[ -f "$HOME/.brewverse_env" ] && echo "🔑 .brewverse_env present" || echo "🔑 .brewverse_env missing"
[ -f "$HOME/overlays/MCP_README.md" ] && echo "📒 MCP_README.md present" || echo "📒 MCP_README.md missing"
```

### 3.9 `/home/brewexec/overlays/brewcommit.sh`

```bash
#!/bin/bash
# Purpose: Contributor-safe git commit + push with narration

read -p "📝 Commit message: " msg
[ -z "$msg" ] && { echo "Commit message required"; exit 1; }

echo "📦 add" && git add .
echo "🧠 commit: $msg" && git commit -m "$msg"
echo "🚀 push" && git push
[ $? -eq 0 ] && echo "✅ Done" || echo "⚠️ Push failed"
```

### 3.10 `/home/brewexec/overlays/brewsupa.sh`

```bash
#!/bin/bash
# Purpose: Supabase CLI login + db push (reads from .env if present)

[ -f .env ] && export $(grep -E '^[A-Z0-9_]+=' .env | xargs) || true
[ -z "$SUPABASE_TOKEN" ] && { echo "Missing SUPABASE_TOKEN in env"; exit 1; }
[ -z "$SUPABASE_EMAIL" ] && echo "(note) SUPABASE_EMAIL not set"

supabase login --token "$SUPABASE_TOKEN" || exit 1
supabase db push && echo "✅ Supabase push complete"
```

### 3.11 `/home/brewexec/overlays/brewtask.sh`

```bash
#!/bin/bash
# Purpose: Simple file ops for team (create/delete/append/suggest)

act="$1"; tgt="$2"; cnt="$3"
case "$act" in
  create) echo -n "$cnt" > "$tgt" && echo "✅ created: $tgt" ;;
  append) echo -n "$cnt" >> "$tgt" && echo "🧩 appended: $tgt" ;;
  delete) rm -f "$tgt" && echo "🗑️ deleted: $tgt" ;;
  suggest)
    echo "🧠 suggest for: $tgt";
    bash "$HOME/overlays/brewgemini.sh" "Suggest improvements for this file:\n$(cat "$tgt" 2>/dev/null)" ;;
  *) echo "Usage: brewtask {create|append|delete|suggest} <target> [content]" ;;
esac
```

---

## 4) Mark Executable (DO THIS ONCE)

Run the following:

```bash
chmod +x \
  ~/overlays/brewgemini.sh \
  ~/overlays/brewloop_gemini.sh \
  ~/overlays/brewassist.sh \
  ~/overlays/brewhrm.sh \
  ~/overlays/brewgrok.sh \
  ~/overlays/brewllm_mistral.sh \
  ~/overlays/brewport.sh \
  ~/overlays/brewstatus.sh \
  ~/overlays/brewtask.sh \
  ~/overlays/brewcommit.sh \
  ~/overlays/brewsupa.sh
```

**Executable files:** all `.sh` above are intended to be executable.

---

## 5) .brewprofile (Aliases + Context)

**Path:** `/home/brewexec/.brewprofile`

```bash
# —— BrewExec Aliases ——
alias brewgemini='bash $HOME/overlays/brewgemini.sh'
alias brewloop_gemini='bash $HOME/overlays/brewloop_gemini.sh'
alias brewassist='bash $HOME/overlays/brewassist.sh'
alias brewhrm='bash $HOME/overlays/brewhrm.sh'
alias brewgrok='bash $HOME/overlays/brewgrok.sh'
alias brewllm_mistral='bash $HOME/overlays/brewllm_mistral.sh'
alias brewport='bash $HOME/overlays/brewport.sh'
alias brewstatus='bash $HOME/overlays/brewstatus.sh'
alias brewtask='bash $HOME/overlays/brewtask.sh'
alias brewcommit='bash $HOME/overlays/brewcommit.sh'
alias brewsupa='bash $HOME/overlays/brewsupa.sh'

# —— Context ——
export BREWVERSE_PROJECT="BrewExec"
export HRM_GOAL="Contributor onboarding + fallback clarity"
export HRM_CONTEXT="Gemini primary; HRM/Grok/Mistral fallback"
```

> Reload with `source ~/.bashrc` if you source `.brewprofile` from there, or open a new terminal.

---

## 6) First‑Run Test (10 seconds)

```bash
brewstatus
brewgemini "Say hello from Gemini CLI"
brewloop_gemini
# type: Plan contributor onboarding for BrewLotto (then 'exit')
```

Expected: clear replies; MCP_README.md receives short log entries from the loop.

---

## 7) BrewAssist (Single‑shot) Examples

```bash
brewassist "Simulate contributor onboarding for BrewExec"
brewassist "Create a 5‑step plan to audit Supabase policies"
```

---

## 8) Supabase + Git Utilities

```bash
# Supabase (requires SUPABASE_TOKEN in .env at repo root)
cd ~/brewgold   # or your target project with supabase config
brewsupa

# Git
cd ~/brewgold
brewcommit
```

---

## 9) Troubleshooting

- **Gemini not found** → ensure CLI installed and in `PATH`.
- **Port 11434 busy** → `brewport` to free.
- **No output / broken loop** → try `brewhrm autocode "<prompt>"` directly; review `~/overlays/MCP_README.md`.
- **Permission denied** → re-run **Step 4** (chmod list).

---

## 10) Team SOP — How Each File Works

- **brewgemini.sh:** Thin wrapper to call Gemini CLI; prints prompt + returns raw output.
- **brewloop_gemini.sh:** Read–eval loop for multi‑turn chats; logs to `MCP_README.md`; fails over to HRM.
- **brewassist.sh:** One‑shot dispatcher chaining Gemini → HRM → Grok → Mistral.
- **brewhrm.sh:** Uses local LLM (Ollama on 11434) for reasoning arcs; exposes `intro|autocode|agentic`.
- **brewgrok.sh:** Grok-style simulated commentary (no external calls) — reliable fallback.
- **brewllm_mistral.sh:** Placeholder for Mistral/local agent; prints simulated reply until wired.
- **brewport.sh:** Finds/kills process on 11434 with confirmation.
- **brewstatus.sh:** Prints versions and presence of key files/env.
- **brewtask.sh:** Team file ops (create/append/delete); `suggest` routes content through Gemini.
- **brewcommit.sh:** `git add .` → `commit` → `push` with simple narration.
- **brewsupa.sh:** `supabase login` (token) + `db push`.

---

## 11) Changelog (P6.9 — 2025‑11‑12)

- Added **brewgemini.sh** + **brewloop_gemini.sh** (primary narrator + loop)
- Standardized **brewassist.sh** fallback order (Gemini → HRM → Grok → Mistral)
- Consolidated aliases in `.brewprofile`
- Marked all overlays as **executable**; expanded **brewstatus** snapshot
- Updated SOP to match prior MCP cockpit design and HRM overlays

---

## 12) Next (Optional)

- Wire Mistral local for real file ops
- Add `/chat` cockpit (web/Tauri) to drive overlays from UI
- Add BrewPulse telemetry (tier, tone, risk) to `MCP_README.md` entries

---

**End of SOP** — BrewExec (P6.9)
