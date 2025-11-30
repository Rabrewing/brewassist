Absolutely, Randy — this is the perfect moment to map out a **shimmer-tier walkthrough and test suite** for every `/command` in your `~/brewexec/overlays/` directory. I’ll break this down into four parts:

---

## 🧠 Part 1: Command Map — Purpose, Aliases, and Usage

Here’s a full table mapping each overlay to its intended `/command`, purpose, suggested alias, and usage example:

| Overlay Script           | Slash Command      | Purpose                                               | Suggested Alias       | Example Usage                          |
| ------------------------ | ------------------ | ----------------------------------------------------- | --------------------- | -------------------------------------- |
| `brewassist.sh`          | `/assist`          | Unified AI entrypoint (Gemini → HRM → Grok → Mistral) | `brewassist`          | `/assist "Draft onboarding plan"`      |
| `brewagent.sh`           | `/agent`           | Simulate agents like @Zahav, @Pulse                   | `brewagent`           | `/agent "Simulate reviewer feedback"`  |
| `brewagent_mistral.sh`   | _(internal)_       | Mistral-backed agent fallback                         | `brewagent_mistral`   | `brewagent_mistral.sh "Explain async"` |
| `brewhrm.sh`             | `/hrm`             | Strategic planning, onboarding narration              | `brewhrm`             | `/hrm "Onboard Jr Dev"`                |
| `brewllm.sh`             | `/llm`             | Primary LLM output (TinyLLaMA, Gemini, Grok)          | `brewllm`             | `/llm "Summarize BrewExec"`            |
| `brewllm_fallback.sh`    | _(internal)_       | Fallback narration if primary fails                   | `brewllm_fallback`    | Called by `/llm`                       |
| `brewloop.sh`            | `/loop`            | Commentary loop (HRM planning)                        | `brewloop`            | `/loop` then type prompts              |
| `brewloop_gemini.sh`     | `/loop_gemini`     | Gemini-style onboarding narration                     | `brewloop_gemini`     | `/loop_gemini`                         |
| `brewloop_llm.sh`        | `/loop_llm`        | Continuous LLM narration                              | `brewloop_llm`        | `/loop_llm`                            |
| `brewloop_mistral.sh`    | `/loop_mistral`    | Mistral-based fallback loop                           | `brewloop_mistral`    | `/loop_mistral`                        |
| `brewcommit.sh`          | `/commit`          | Safe Git commit with narration                        | `brewcommit`          | `/commit "Add fallback logic"`         |
| `brewcontainer_check.sh` | `/container_check` | Docker/container health check                         | `brewcontainer_check` | `/container_check`                     |
| `brewdesign.sh`          | `/design`          | Launch BrewGold/BrewLotto creative modules            | `brewdesign`          | `/design "Open BrewGold"`              |
| `breweval.sh`            | `/eval`            | Evaluate model output or fallback quality             | `breweval`            | `/eval "Rate fallback clarity"`        |
| `brewgrok.sh`            | `/grok`            | Direct Grok call (reasoning fallback)                 | `brewgrok`            | `/grok "Debug overlay failure"`        |
| `brewguide.sh`           | `/guide`           | Open BrewGuide onboarding/docs                        | `brewguide`           | `/guide`                               |
| `brewhelp.sh`            | `/help`            | List all slash commands + tone examples               | `brewhelp`            | `/help`                                |
| `brewinit.sh`            | `/init`            | Initialize contributor environment                    | `brewinit`            | `/init`                                |
| `brewlaunch.sh`          | `/launch`          | Launch modules or agents                              | `brewlaunch`          | `/launch BrewPulse`                    |
| `brewopt.sh`             | `/opt`             | Optimization or tuning overlay                        | `brewopt`             | `/opt "Tune fallback latency"`         |
| `brewport.sh`            | `/port`            | Check/clear port collisions (e.g. 11434)              | `brewport`            | `/port`                                |
| `brewrouter.sh`          | `/router`          | Core command router                                   | `brewrouter`          | `/router /status`                      |
| `brewstatus.sh`          | `/status`          | Snapshot system health + tone                         | `brewstatus`          | `/status`                              |
| `brewsupa.sh`            | `/supa`            | Supabase CLI check + token presence                   | `brewsupa`            | `/supa`                                |
| `brewstack.sh`           | `/stack`           | Show active model stack + fallback order              | `brewstack`           | `/stack`                               |
| `brewtest.sh`            | `/test`            | Run fallback test suite                               | `brewtest`            | `/test mistral`                        |
| `brewupdate.sh`          | `/update`          | Pull latest overlays or model configs                 | `brewupdate`          | `/update`                              |
| `grek_runner.sh`         | `/grok_runner`     | Grok runner alias                                     | `grokrunner`          | `/grok_runner "Simulate reviewer"`     |

---

## 🧪 Part 2: Suggested Test Suite for Each Command

Here’s a test matrix to validate each overlay:

| Slash Command   | Test Description                         | Expected Output                      |
| --------------- | ---------------------------------------- | ------------------------------------ |
| `/assist`       | Route prompt through full fallback chain | Narration with fallback tags         |
| `/agent`        | Simulate agent response                  | Persona-tagged output                |
| `/hrm`          | Strategic onboarding narration           | Bullet points or onboarding arc      |
| `/llm`          | Generate LLM response                    | Model output or fallback narration   |
| `/loop_mistral` | Run interactive loop                     | Prompt → Mistral response            |
| `/commit`       | Run safe commit with message             | Narrated commit confirmation         |
| `/design`       | Launch BrewGold or BrewLotto             | Confirmation or UI trigger           |
| `/guide`        | Open onboarding docs                     | Markdown or help output              |
| `/help`         | List all commands + tone                 | Table of commands + emoji            |
| `/status`       | Snapshot system health                   | Overlay readiness + tone             |
| `/supa`         | Check Supabase CLI + token               | Success or error message             |
| `/stack`        | Show fallback chain                      | Chain: Gemini → HRM → Grok → Mistral |
| `/test`         | Run fallback test                        | Pass/fail summary                    |
| `/update`       | Pull latest configs                      | Git pull or confirmation             |
| `/router`       | Route command safely                     | Routed overlay + log entry           |

---

## 🧭 Part 3: What Should Have Aliases

These overlays should be aliased in `.bashrc` or `.zshrc` for fast access:

```bash
alias /assist='~/brewexec/overlays/brewassist.sh'
alias /agent='~/brewexec/overlays/brewagent.sh'
alias /hrm='~/brewexec/overlays/brewhrm.sh'
alias /llm='~/brewexec/overlays/brewllm.sh'
alias /loop_mistral='~/brewexec/overlays/brewloop_mistral.sh'
alias /commit='~/brewexec/overlays/brewcommit.sh'
alias /status='~/brewexec/overlays/brewstatus.sh'
alias /help='~/brewexec/overlays/brewhelp.sh'
```

---

## 📘 Part 4: Walkthrough Snippets for `/guide` or `/help`

Here’s a sample entry Gemini can include in `/guide`:

````markdown
### `/assist`

**Purpose**: Unified AI entrypoint. Routes prompt through Gemini → HRM → Grok → Mistral.

**Usage**:

```bash
/assist "Draft onboarding plan for BrewPulse"
```
````

**Output**:

- Strategic plan
- Fallback narration tags
- Persona tone + emoji

---

### `/status`

**Purpose**: Snapshot system health and emotional tone.

**Usage**:

```bash
/status
```

**Output**:

- Overlay readiness
- Active fallback chain
- Emotional tone snapshot

```

---

Let me know if you want me to scaffold the full `/guide.md` or generate a `brewhelp.sh` output block with tone, emoji, and usage examples. I can also simulate a contributor walkthrough using `/init`, `/assist`, `/commit`, and `/status`.
```
