# 🧠 BrewAssist DevOps Cockpit

Welcome to BrewAssist, an AI-powered DevOps Cockpit designed to streamline development workflows through a conversational, tool-augmented command-line interface.

This platform integrates a sophisticated AI agent directly into your local environment, providing assistance with code analysis, file operations, task automation, and more. It is designed to be a safe, stable, and powerful assistant for developers.

For a complete and detailed technical overview, please see the **[Comprehensive Data Dump](brewdocs/reference/BrewAssist_Data_Dump.md)**.

## 🚀 Core Architecture

BrewAssist is built on a multi-layered architecture to ensure stability, safety, and extensibility:

1.  **Frontend Cockpit**: A Next.js web interface (`brewgold/`) that serves as the primary user interaction point.
2.  **API Layer**: Next.js API routes (`pages/api/`) that bridge the frontend to the AI core, handling tool calls and agent communication.
3.  **Shell Overlay Layer**: A secure set of shell scripts (`overlays/`) that represent the agent's foundational "Tier 1" tools, performing direct, auditable actions on the system.
4.  **AI Layer (Agent Brain)**: A Python-based core (`brewassist_core/`) that houses the agent's primary logic, including a planner and tool selector.

## ✨ Key Features

-   **The Toolbelt**: A tiered system of tools, from low-level shell scripts to high-level, LLM-orchestrated functions.
-   **"Locked Chain" Engine**: A reliable fallback mechanism for the AI, starting with an OpenAI tool-user and falling back to a Gemini reasoning engine to ensure high availability.
-   **BrewLast Memory**: A JSON-based action log (`.brewlast.json`) that serves as the agent's short-term memory, providing context and a clear audit trail.
-   **BrewTruth Engine**: A truth-guided routing system that validates the agent's actions for safety and correctness.
-   **Risk-Aware Personality**: An advanced personality layer that enables the agent to manage tasks, handle failures gracefully, and communicate more naturally.

## 🗺️ Project Roadmap

The project follows a phased stabilization plan (S1-S5) to ensure robust and incremental development. We are currently in **S4.5**, focusing on documentation and preparing for the next phase of feature enhancements.

For the complete roadmap and project history, refer to the documentation in the `brewdocs/` directory.

## 🧪 Testing

*   `pnpm test:chain`: Runs the Chain Gates regression suite to verify API contract, mode splitting, tool gating, and router integrity.

---

🧠 *Every overlay is narratable. Every fallback is teachable. Every contributor arc is legacy-grade.*
