# Task: Implement the BrewAssist File-Agent Pack

This task involves setting up a secure and unified file agent system that allows all AI engines (Gemini, Grok, Mistral, etc.) to perform filesystem operations (read, write, append, delete) through a safe, audited, and replayable agent layer.

## 1. Create Core Agent Files

The following Python files need to be created in the `brewassist_core/agents/` directory:

-   `safety_path.py`: Prevents directory traversal and ensures all operations are confined to the `/home/brewexec` directory.
-   `agent_tools.py`: Provides a single, AI-agnostic interface for all tool calls.
-   `file_agent.py`: Contains the core logic for performing the file operations, guarded by the safety layer.

## 2. Update Dispatcher and Planner

The following files need to be created or updated to route AI intent to the new file agent:

-   `selector.py`: Patched to recognize and dispatch `file:` prefixed prompts to the `agent_tools`.
-   `planner.py`: Patched to detect user intent related to file operations.

## 3. Update Grok Documentation

Append the "Grok + BrewAssist File Access" section to the `brewdocs/reference/GROK_INSTALLATION.md` file to document how Grok interacts with the filesystem through this new agent pack.
