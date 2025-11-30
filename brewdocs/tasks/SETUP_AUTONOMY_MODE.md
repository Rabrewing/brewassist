# Task: Implement Autonomy Mode

This task involves adding an "Autonomy Mode" to BrewAssist, allowing AI-driven file operations to be executed automatically without user confirmation when the mode is enabled.

## 1. Create Global Flag

-   Create or update the `~/.env.brewassist` file with the following line to control the autonomy mode. It should be `off` by default for safety.
    ```
    BREW_AUTONOMY=off
    ```

## 2. Create Autonomy Agent

-   Create a new Python file `brewassist_core/agents/autonomy.py` which provides a helper function to check if autonomy mode is enabled.

## 3. Update File Agent

-   Modify `brewassist_core/agents/file_agent.py` to incorporate a `_guard` function that checks the autonomy status before executing any write, append, or delete operations.

## 4. Create CLI Toggle

-   Create a new overlay script `~/brewexec/overlays/brewautonomy.sh` that allows toggling the `BREW_AUTONOMY` flag between `on` and `off`.
-   Make the script executable.
-   Add a `/autonomy` alias to `~/.bashrc` for easy access.
