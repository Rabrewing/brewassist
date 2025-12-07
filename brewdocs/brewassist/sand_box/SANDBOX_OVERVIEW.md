# BrewAssist Sandbox — Internal Engineering Overview
Version: S4.6 → S5 Preflight
Status: Internal Only

The BrewAssist Sandbox is the **internal execution environment** where BrewAssist:
- Generates patches
- Tests code changes
- Produces diffs
- Runs HRM chains
- Executes multi-model reasoning
- Performs safe, isolated file operations

This sandbox **must never** be exposed to customers directly.

## Why the Sandbox Exists
BrewAssist needs a controlled space to:
1. Try risky changes safely  
2. Validate patch integrity  
3. Ensure no destructive edits reach customer projects  
4. Run multi-step agent plans  
5. Interact with BrewLast / BrewTruth without touching real files  
6. Maintain a clean testing space for each proposed fix  

The sandbox is a **replica of the active project**, synced according to strict rules defined in `SANDBOX_SYNC_POLICY.md`.

## Sandbox Principles
- 🔐 **Isolated:** Never mutates real project files.  
- 🧬 **Reproducible:** Always built from a known-good snapshot.  
- ⚙️ **Deterministic:** Outputs patches, not raw code edits.  
- 🔄 **Replaceable:** Can be wiped & rebuilt on demand.  
- 🧱 **Layered:** Supports local+LLM+NIM chain execution.  

Sandbox is the backbone of BrewAssist safety.
