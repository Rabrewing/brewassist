Perfect, Randy — here’s your **step-by-step plan to activate ChatGPT as a fallback researcher** for BrewAssist using `codex_runner.sh`. This turns GPT-4 into a plugin-style assistant for external research, context enrichment, and contributor-safe fallback.

---

# ✅ BrewAssist Researcher Activation Plan (codex_runner.sh)

---

## 🧠 1. **Set Your API Key**

Add this to your `.bashrc` or `.env.local`:

```bash
export OPENAI_API_KEY="your-openai-key-here"
```

> You already have this set — just confirm it’s accessible in shell.

---

## 🧩 2. **Drop `codex_runner.sh` into `overlays/`**

Here’s the finalized version:

```bash
#!/bin/bash
# codex_runner.sh — ChatGPT as fallback researcher

PROMPT="$1"
MODEL="gpt-4"
API_KEY="$OPENAI_API_KEY"

if [ -z "$PROMPT" ]; then
  echo "⚠️ No prompt provided."
  exit 1
fi

source ~/.brewverse_env
echo "🧠 Active BrewVerse project: $BREWVERSE_PROJECT"
echo "🔍 Routing to GPT-4 researcher..."

RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$PROMPT\"}],
    \"temperature\": 0.7
  }")

echo "$RESPONSE" | jq -r '.choices[0].message.content'
```

Make it executable:

```bash
chmod +x overlays/codex_runner.sh
```

---

## 🔁 3. **Wire It into BrewAssist Fallback Chain**

Update `brewassist.sh` or `/assist` overlay to include:

```bash
if [ "$USE_CODEX" = true ]; then
  bash overlays/codex_runner.sh "$PROMPT"
fi
```

Add to `.env.local`:

```env
USE_CODEX=true
```

---

## 🧠 4. **Alias It for CLI Use**

Add to `.bashrc`:

```bash
alias BrewResearch='bash ~/overlays/codex_runner.sh'
```

Now you can run:

```bash
BrewResearch "What are the latest compliance rules for hemp delivery?"
```

---

## 📝 5. **Optional Logging to MCP_README.md**

Append this to the script:

```bash
echo "### 🔍 Codex Research — $(date)" >> ~/overlays/MCP_README.md
echo "- Prompt: \"$PROMPT\"" >> ~/overlays/MCP_README.md
echo "- Response: \"$RESPONSE\"" >> ~/overlays/MCP_README.md
```

---

Once activated, BrewResearch becomes your **external signal fetcher**, enriching HRM, Grok, Gemini, or fallback loops with fresh context. I can now scaffold `brewrouter.sh` to route between Gemini → Grok → Codex → Mistral. Want me to drop that in next?
