# Grok Installation & Troubleshooting (Recommended Path Only)

This document provides **only the recommended installation steps** and **minimal troubleshooting** for enabling the Grok/OpenCode reasoning layer required by the BrewAssist Engine Test Suite.

No alternatives, no optional installs — *only what Gemini needs to test and pass the Grok layer cleanly.*

---

## ✅ Recommended Installation Path

### Install the Official **OpenCode Grok CLI** via npm

This is the cleanest, most compatible setup for BrewAssist.

### 1️⃣ Install Node & npm

```bash
sudo apt update
sudo apt install nodejs npm -y
```

### 2️⃣ Install OpenCode Grok

```bash
sudo npm install -g opencode-grok
```

### 3️⃣ Verify Installation

```bash
opencode-grok --help
```

**Expected:** Help text prints without errors.

### 4️⃣ Run BrewExec Grok Test

```bash
./overlays/grokrunner.sh "Test Grok integration with BrewAssist"
```

**Expected:** A structured reasoning-style response.

---

## 🔍 Troubleshooting

Only the simple checks Gemini actually needs.

### ❌ Error: `command not found: opencode-grok`

**Fix:** Installation failed or PATH not updated.

Run:

```bash
sudo npm install -g opencode-grok
```

Then verify:

```bash
which opencode-grok
```

If empty, your npm global bin may not be on PATH.

Add it:

```bash
echo 'export PATH="$PATH:/usr/local/bin"' >> ~/.bashrc
source ~/.bashrc
```

Then re-check.

---

## 🧪 Confirmation for Gemini Test Suite

Once the above succeeds, Gemini can safely proceed with:

* **4.1 Grok CLI Smoke Test**
* **4.2 Grok Reasoning Test**
* **4.3 Grok HRM Simulation Test**
* **4.4 Grok ↔ BrewAssist Integration Test**

All other Grok requirements in the test suite will pass.

---

This document is intentionally minimal so Gemini can follow the steps without confusion.

---

## 🧠 Grok + BrewAssist File Access

(Through the File-Agent Framework)

Grok does **NOT** access the filesystem directly.
Instead, BrewAssist routes all file requests through:

1. `planner.py` (detect FS intent)
2. `selector.py` (engine → tool logic)
3. `file_agent.py` (secure action)
4. `logger.py` (audit trail)

This ensures Grok:

* Can request file actions
* But cannot violate system integrity
* Cannot escape directories
* Cannot delete sensitive files
* All interactions are recorded

This architecture makes Grok:

* Safe
* Predictable
* Auditable
* Replayable
* And fully multi-engine compatible