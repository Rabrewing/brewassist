# BrewAssist Sandbox — Risks & Guardrails (Internal)
Version: S4.6 → S5

## Major Risks

### 1. Sandbox Escape
If poorly isolated, the sandbox could mutate real files.

**Guardrail:**  
- All writes redirected  
- Identity engine checks target path before write  
- Path traversal blocked  

---

### 2. Customer Access
Customer interacting with raw sandbox = catastrophic.

**Guardrail:**  
- No exposed API endpoints  
- No UI elements revealing sandbox internals  

---

### 3. Infinite Patch Loop
LLM may generate recursive edits.

**Guardrail:**  
- Max 3 patch attempts  
- HRM loop breaker  
- BrewTruth sanity evaluation  

---

### 4. Corruption Between Syncs
Sandbox may drift from project state.

**Guardrail:**  
- BrewLast snapshot diff check  
- Auto-rebuild if mismatch > 5%  

---

### 5. Multi-Model Conflict
Mistral, NIM, Gemini may produce contradictory patches.

**Guardrail:**  
- BrewTruth arbitration  
- Risk memory scoring  
- Model provenance tracking  

---

## Future Upgrades (S5+)
- Per-customer virtual sandboxes in cloud  
- Persistent in-memory sandbox  
- Streaming patch previews  
- NIM researcher inside chain
