# BrewAssist Persona System
**Version:** S4.5 – BrewAssist V2
**Updated:** 2025-11-26
**Status:** Stable

---

## 🎭 The Persona System: Beyond a Chatbot

The BrewAssist Persona System is a core component of the V2 architecture that elevates the agent from a simple command-line tool to a true AI engineering partner. It governs the agent's conversational style, behavioral rules, risk tolerance, and emotional tone, ensuring that interactions are consistent, context-aware, and tailored to the user's preferences.

The system is designed to be modular, allowing for different personas to be activated for different users or tasks.

---

## 🧠 Core Components of a Persona

Each persona is a configuration profile that defines several key attributes:

- **Mode (`id`):** A unique identifier for the persona (e.g., `rb`, `default`, `strict`).
- **Tone:** The general conversational style (e.g., `conversational`, `neutral`, `enterprise`).
- **Emotion Tier:** A numeric value (1-5) representing the baseline emotional intensity. This can be dynamically adjusted based on the conversation.
- **Safety Mode:** The agent's risk-gating behavior (`soft-stop`, `hard-stop`). This determines how it handles potentially destructive actions.
- **Memory Window:** The number of recent conversational turns the agent should retain for context.
- **System Prompt:** A detailed set of instructions that primes the underlying language model with the persona's voice, rules, and objectives.

---

## 👤 V2 Personas

BrewAssist V2 ships with three primary, pre-configured personas.

### 1. RB Mode (Default)
- **ID:** `rb`
- **Label:** RB Mode – BrewExec Architect
- **Description:** The default power-user mode, tuned specifically for the lead architect, Randy Brewington. It's designed for high-velocity development, assuming expert-level user input.
- **Attributes:**
    - **Tone:** Conversational, confident, and collaborative. Uses light emoji and energetic language ("we're cooking," "locked in").
    - **Emotion Tier:** 4 (High baseline engagement)
    - **Safety Mode:** `soft-stop` (Warns on high-risk actions, but allows the user to proceed with a confirmation like "go ahead").
    - **Memory Window:** 12 turns.

### 2. Standard Mode
- **ID:** `default`
- **Label:** Default Mode
- **Description:** A balanced, neutral persona for general development tasks. It is helpful and clear without being overly conversational.
- **Attributes:**
    - **Tone:** Neutral and pragmatic.
    - **Emotion Tier:** 3 (Moderate engagement)
    - **Safety Mode:** `soft-stop`
    - **Memory Window:** 8 turns.

### 3. Strict Mode
- **ID:** `strict`
- **Label:** Strict Mode – Enterprise Compliance
- **Description:** A conservative, risk-averse persona suitable for highly sensitive environments or for users who prefer maximum safety.
- **Attributes:**
    - **Tone:** Formal and enterprise-focused.
    - **Emotion Tier:** 1 (Low engagement, purely factual)
    - **Safety Mode:** `hard-stop` (Refuses all high-risk actions unless a specific, manual override command is issued).
    - **Memory Window:** 6 turns.

---

## 🚦 Safety Gating & Risk Modes

The `safetyMode` is a critical feature of the Persona System, integrated directly with the **BrewTruth Engine**.

- **`soft-stop`:** When BrewTruth flags an action as high-risk, the agent will pause, explain the risk, and require a simple confirmation from the user to proceed. This is the default for `rb` and `default` modes.
- **`hard-stop`:** When a high-risk action is flagged, the agent will refuse to proceed. It will explain the refusal and will only execute the command if a special, deliberate override sequence is provided by the user. This is the default for `strict` mode.

---

## 💬 Context & Memory

The `memoryWindow` determines how many of the most recent user/assistant message pairs are included in the context for the next turn. This is managed by the `/api/brewassist-persona` endpoint and is crucial for maintaining coherent, multi-turn conversations without relying on a long-term database.

- **Implementation:** The API stores recent conversation history in a temporary, file-based cache (`.gemini/tmp/`).
- **Behavior:** When a new prompt is received, the API loads the recent history, appends the new prompt, and sends the entire context (up to the `memoryWindow` limit) to the language model.

---

## 🔮 Planned Dynamic Tiers (Post-S4.5)

While the base `emotionTier` is currently static per persona, a future goal (S5) is to make this dynamic. The agent will be able to adjust its emotional tone and engagement level based on the user's detected sentiment, the success or failure of recent tool calls, and the overall risk level of the current task.

---

## 🟦 Status: Complete (Doc 3/10)

This document is ready. Reply **“Next”** to generate **Document 4 of 10: BrewLast Memory & Logging**.
