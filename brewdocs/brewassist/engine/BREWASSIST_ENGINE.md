# BrewAssist Engine Architecture

## Final Architecture

### BrewAssist Coding Chain
For `/assist`, plain text prompts, and coding tasks:

1.  **Gemini** (primary)
2.  **ChatG / OpenAI** (fallback)
3.  **Mistral** (backup fallback)
4.  **TinyLLaMA** (local final)

### NIM Research Chain
Triggered ONLY when you run:

*   `/research …`
*   `/sandbox nim …`

NIM is not part of the coding fallback chain unless explicitly desired.

## Model Roles

| Role                     | Engine    | Purpose                                 |
| :----------------------- | :-------- | :-------------------------------------- |
| **Primary Operator**     | Gemini    | Conversational DevOps assistant         |
| **Fallback / Planner**   | Mistral   | clean, structured responses             |
| **Human-Tone Assistant** | ChatGPT   | the “voice” and polished talker         |
| **Local Sandbox**        | TinyLLaMA | offline testing & dev-mode              |
| **Researcher**           | **NIM**   | *deep analysis, R&D, audits, inference* |
