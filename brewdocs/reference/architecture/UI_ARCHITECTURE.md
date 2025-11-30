Here’s your fully scaffolded `brewdocs/UI_ARCHITECTURE.md` — a contributor-safe reference for navigating BrewExec’s three UI layers: `chat.html`, Tauri, and TUI. It explains their purpose, how to move between them, and how to unify them for onboarding clarity and fallback narration.

---

````markdown
# 💬 BrewExec UI Architecture — chat.html, Tauri, and TUI

This document outlines the three UI layers in BrewExec, their roles, how to navigate between them, and how to unify them for contributor-safe narration and fallback logic.

---

## 🧠 1. UI Layers Overview

| Layer       | Purpose                                   | Runtime Context                  |
| ----------- | ----------------------------------------- | -------------------------------- |
| `chat.html` | Static web UI (HTML/CSS/JS)               | Served via Express (`server.js`) |
| Tauri       | Native desktop app (Rust + Webview)       | Runs via `npm run tauri dev`     |
| TUI         | Terminal UI (shell overlays, CLI prompts) | Runs via Bash, Gemini CLI        |

---

## 🔁 2. Navigation Between Layers

### ✅ From `chat.html` to Tauri

```bash
npm run tauri dev
```
````

Tauri wraps the frontend into a native app with filesystem access and shell integration.

---

### ✅ From Tauri to TUI

```bash
bash overlays/brewassist.sh "Narrate BrewGold launch"
```

Or use aliases like:

```bash
BrewAssist "Simulate onboarding arc"
```

---

### ✅ From `chat.html` to TUI

Add a button or slash command in `chat.js` that triggers `/api/assist`, which calls shell overlays via `child_process.spawn`.

---

## 🧩 3. Does It Make Sense to Use All Three?

Yes — if each serves a distinct contributor need:

- `chat.html`: Lightweight fallback or static demo
- Tauri: Native app with richer integration
- TUI: Fast, scriptable, emotionally resonant CLI narration

If logic is duplicated, consider unifying under Tauri or React.

---

## 🗂️ 4. Accessing Directory from `chat.html`

### ✅ Option 1: API Route

`pages/api/list-directory.js`:

```js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dirPath = path.join(process.cwd(), 'overlays');
  const files = fs.readdirSync(dirPath);
  res.status(200).json({ files });
}
```

In `chat.js`:

```js
fetch('/api/list-directory')
  .then((res) => res.json())
  .then((data) => console.log(data.files));
```

---

### ✅ Option 2: Tauri Filesystem API

```ts
import { readDir } from '@tauri-apps/api/fs';

const files = await readDir('src/overlays');
```

---

## 🧠 5. Static Serving via `server.js`

To serve `chat-ui/chat.html`:

```js
const path = require('path');
app.use('/chat-ui', express.static(path.join(__dirname, 'chat-ui')));
```

Visit: `http://localhost:5000/chat-ui/chat.html`

---

## 🧪 6. Suggested Enhancements

- Scaffold `brewui_bridge.js` to unify chat.html, Tauri, and TUI
- Add `/api/assist` and `/api/list-directory` routes
- Log UI interactions to `MCP_README.md` for contributor replay

---

> BrewExec now supports multi-layer UI narration — static, native, and terminal — all unified under contributor-safe fallback logic and emotionally resonant commentary.

```

---

Let me know if you’d like me to scaffold `brewui_bridge.js` next or wire this `.md` into your `brewdocs/README.md` index.
```
