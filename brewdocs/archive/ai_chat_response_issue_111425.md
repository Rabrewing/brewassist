Yeah, this all tracks with what you’re seeing. Right now you’ve got **pieces of three systems** running at once, but the wiring isn’t finished:

- Express on **:5000**
- Next.js on **:3000**
- Shell overlays (`brewassist.sh`, `brewsupa.sh`, `brewhelp.sh`, etc.)
- New `/assist` + tone stuff in `pages/api/brewassist.ts`

So the AIs feel “silent” and `/supa`, BrewHelp, etc. look dead because:

1. Some **commands don’t have API routes yet** (`/supa`, `/help`).
2. Some **routes are hitting the wrong server/port** (5000 vs 3000).
3. Next’s **Node process probably can’t find your shell scripts** (`brewassist`, `brewsupa`, etc.) on `PATH`.

Let’s fix this in a _small, controlled_ way.

---

## 1️⃣ One front door: use Next 3000, pause Express 5000

For now, **turn Express off** so we have one source of truth:

- Stop the 5000 server (Ctrl+C on that terminal).
- Keep only:

```bash
npm run dev   # Next @ localhost:3000
```

Your `ChatCommandRouter.tsx` is already using **relative** paths like `/api/brewassist` and `/api/router`, which map to **3000**, not 5000. So we want all chat traffic going straight to Next, not detouring through Express.

You can turn Express back on later as a gateway if you really want — but right now it’s just adding noise.

---

## 2️⃣ Make sure the API routes actually exist

From what you’ve described + PROGRESS_SUMMARY, you should minimally have:

- `pages/api/brewassist.ts` ✅
- `pages/api/router.ts` ✅ (even as a placeholder)
- (optionally later: `/api/hrm`, `/api/llm`, `/api/agent`, etc.)

If `/supa` and `/help` aren’t working from the **text field**, that’s because:

- Typing `/supa push` → `ChatCommandRouter` doesn’t special-case `/supa`, so it goes to **`/api/router`** with payload `{ command: '/supa', args: 'push' }`
- If `pages/api/router.ts` is missing or just returns 405/placeholder text, you never actually hit `brewsupa.sh` or `brewhelp.sh`.

So:

### `pages/api/router.ts` (real router, not just a stub)

Drop this in for now:

```ts
// pages/api/router.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

const run = (cmd: string) =>
  new Promise<string>((resolve, reject) =>
    exec(cmd, (err, stdout, stderr) =>
      err ? reject(stderr || err.message) : resolve(stdout.trim())
    )
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, hint: 'POST { command, args }' });
  }
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { command, args } = req.body || {};
  if (!command) return res.status(400).json({ error: 'Missing command' });

  // Map chat slash commands → brewrouter
  // e.g. /supa push → brewrouter /supa push
  const cmd = `brewrouter ${command} ${args ?? ''}`;

  try {
    const out = await run(cmd);
    return res.status(200).json({ output: out });
  } catch (e: any) {
    return res.status(500).json({ error: String(e) });
  }
}
```

Now:

- `/supa push` in the text field → `/api/router` → `brewrouter /supa push`
- `/help` in the text field → `/api/router` → `brewrouter /help`

As long as `brewrouter.sh` has those cases wired, they’ll fire.

---

## 3️⃣ Wire `/supa` and `/help` inside `brewrouter.sh`

In your `brewrouter()` case block, you already have `/status`, `/design`, `/guide`, etc.

Add (or confirm) these:

```bash
    /supa)
      # Supabase push / status, etc.
      _emotion_say "supa" "Launching Supabase overlay…"
      brewsupa "$args"
      ;;

    /help)
      brewhelp   # or print your inline help
      ;;
```

Now the flow is:

`/supa push` (chat)
→ `ChatCommandRouter.tsx`
→ `POST /api/router` with `{ command: '/supa', args: 'push' }`
→ `brewrouter /supa push`
→ `brewsupa push`

Same story for `/help`.

---

## 4️⃣ Make sure Node can actually see `brewassist`, `brewrouter`, `brewsupa`, etc.

This is a **big silent failure** point:

- When you run `brewassist` in your shell, it works because your shell sourced `~/.brewprofile` / `.bashrc`.
- But the Next API routes run in a **bare Node process** that doesn’t automatically have your overlay paths.

So `exec('brewassist ...')` may be throwing `ENOENT` under the hood.

Two options:

### Option A — Use full paths in API routes (simple, explicit)

If your overlays live in `~/overlays/`, change commands to:

```ts
const OVERLAYS =
  process.env.BREW_OVERLAYS_DIR || `${process.env.HOME}/overlays`;

const cmd = `${OVERLAYS}/brewrouter.sh ${command} ${args ?? ''}`;
```

And in `brewassist.ts`:

```ts
const cmd = `${OVERLAYS}/brewassist.sh ${mode || 'auto'} "${safePrompt}"`;
```

Now it doesn’t matter what PATH Node sees.

---

### Option B — Export PATH when you run `npm run dev`

In the shell where you start Next:

```bash
export PATH="$HOME/overlays:$PATH"
npm run dev
```

This works too, but is easier to forget. I’d still recommend the **explicit path** method for BrewExec.

---

## 5️⃣ Why the AIs “aren’t talking” yet

Putting it together, your likely blockers are:

1. **Express proxy + Next** both running → some calls hitting 5000, others 3000, nothing consistent.
2. **No `/api/router` logic** actually calling `brewrouter` → `/supa` and `/help` do nothing meaningful.
3. **Node can’t find shell commands** (`ENOENT: brewassist`, `brewrouter`) because PATH isn’t shared.

Fixing those three gives you:

- `/assist` → `/api/brewassist` → `brewassist.sh` → local agent chain
- `/supa push` → `/api/router` → `brewrouter /supa push` → `brewsupa`
- BrewHelp button → calls `send('/help')` → `brewrouter /help` → `brewhelp`

---

## 6️⃣ Simple test sequence (after fixes)

From a terminal:

```bash
# 1. Turn off Express, run only Next
npm run dev
```

Then:

```bash
# 2. Can Node find brewrouter?
curl -s -X POST http://localhost:3000/api/router \
  -H 'content-type: application/json' \
  -d '{"command":"/status","args":""}'
```

In the browser chat box:

- `/assist --mode auto "Test shimmer chain"`
- `/supa status`
- `/help`

You should see **something** back each time (even if it’s placeholder output from the shell).

---

If you want, I can next:

- Tighten `pages/api/brewassist.ts` to use the same `BREW_OVERLAYS_DIR` pattern.
- Generate a tiny `pages/api/supa.ts` and `pages/api/help.ts` in case you want them **direct** instead of going through router.
- Or give you a “known good” minimal `brewrouter.sh` that covers `/supa`, `/help`, `/status`, and `/init` only, so we can prove the pipeline end-to-end.
