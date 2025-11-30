# Task: Stabilize BrewAssist Chain v2.0 - Reset to Clean V1 Baseline

**Date:** 2025-11-22

**Objective:** Perform a full reset of the BrewAssist integration to a clean, minimal, and working version 1. This approach prioritizes stability and a clear execution path using OpenAI (ChatG) as the primary engine, explicitly ignoring other engines for now.

---

## 0. Principle: Lock the Architecture First

For the duration of this stabilization effort, the following rules are in effect:
- **Only OpenAI is allowed to touch tools / overlays.**
- **Gemini = reasoning-only fallback.**
- **Mistral = OFF** (no API until local server is set up later).

The target execution path is:
> Chat → `/api/brewassist` → OpenAI → `/api/llm-tool-call` → overlays (`write_file.sh`, `read_file.sh`, etc.) → `.brewlast` + filesystem.

---

## 1. Step 1: Environment – Clean Baseline `.env.local`

1.  Open **`.env.local`** at `/home/brewexec/.env.local`.
2.  Ensure the minimum core variables are set as follows (update or add if they exist):
    ```env
    # Active project
    BREW_ACTIVE_PROJECT=brewexec
    NEXT_PUBLIC_BREW_ACTIVE_PROJECT=brewexec

    # BrewPulse display
    BREWPULSE_TIER=shimmer
    NEXT_PUBLIC_BREWPULSE_TIER=shimmer

    BREWPULSE_EMOJI=✨
    NEXT_PUBLIC_BREWPULSE_EMOJI=✨

    # Model routing (for display only right now)
    BREW_MODEL_PRIMARY=openai
    NEXT_PUBLIC_BREW_MODEL_PRIMARY=openai

    BREW_MODEL_FALLBACK=none
    NEXT_PUBLIC_BREW_MODEL_FALLBACK=none

    BREW_MODEL_LOCAL=none
    NEXT_PUBLIC_BREW_MODEL_LOCAL=none

    # OpenAI / ChatG (this must be set)
    OPENAI_API_KEY=YOUR_OPENAI_KEY_HERE

    # Optional – if you want to show model name in UI
    OPENAI_MODEL=gpt-4.1-mini
    NEXT_PUBLIC_OPENAI_MODEL=gpt-4.1-mini
    ```
3.  Restart the dev server from the correct root:
    ```bash
    cd /home/brewexec
    pnpm dev
    ```

---

## 2. Step 2: `lib/openaiEngine.ts` – Single, Solid OpenAI Wrapper

Create/replace **`lib/openaiEngine.ts`** with the provided content. This ensures a robust OpenAI wrapper that correctly handles string prompts and constructs the `messages` array internally.

---

## 3. Step 3: `lib/brewassistChain.ts` – **OpenAI-only** BrewAssist Chain

Create/replace **`lib/brewassistChain.ts`** with the provided content. This establishes an OpenAI-only chain as primary, with a simple human-friendly error fallback (no other engines yet).

---

## 4. Step 4: `pages/api/brewassist.ts` – Simple API Handler

Create/replace **`pages/api/brewassist.ts`** with the provided content. This ensures a simple API handler that correctly extracts the `prompt` from `req.body` and calls `runBrewAssistChain`.

---

## 5. Step 5: `components/BrewCockpitCenter.tsx` – Chat + Thinking + Log

Create/replace **`components/BrewCockpitCenter.tsx`** with the provided content. This version matches the `CommandBar` props and talks only to `/api/brewassist`.

---

## 6. Step 6: `components/CommandBar.tsx` – Bring Back Your Bar + Cosmic Tabs

Create/replace **`components/CommandBar.tsx`** with the provided content. This version supports the new thinking/cancel/edit behavior and routes all commands through `/api/brewassist`.

---

## 7. Step 7: Smoke Test

Once all fixes are applied, perform the following test:
1.  Start the dev server from `/home/brewexec`.
2.  In the cockpit at `http://localhost:3000`:
    - Type: `hello`
    - Type: `/assist Tell me what BrewExec does in 2 sentences.`
3.  You should see blue-square 🟦 ChatG bubbles and the **thinking indicator** in the pane + logs updating.