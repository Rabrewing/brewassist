# HRM v3 Integration Spec — BrewAssist Engine v2

**Goal:** Fuse the Hierarchical Reasoning Model (HRM) with the S4.6 Identity Engine, BrewTruth, and Sandbox, without compromising safety.

---

## 1. HRM Responsibilities

HRM v3 must:

- Decompose complex tasks into structured plans.
- Provide reasoning traces for transparency.
- Estimate risk levels and complexity.
- Suggest which tools / subsystems to use.
- Operate only on **sandbox/mirror** when code is involved.
- Log all runs to BrewLast.

---

## 2. Locations (Python core)

Key files (already present):

- `brewassist_core/chains/hrm_chain.py`
- `brewassist_core/chains/llm_chain.py`
- `brewassist_core/agents/planner.py`
- `brewassist_core/agents/agent_tools.py`
- `brewassist_core/scripts/brewassist.py`

S4.6 adds:

- Clear entrypoint: `hrm_entrypoint(task_packet: dict) -> dict`
- Optional CLI: `python -m brewassist_core.hrm_entry` for JS bridge.

---

## 3. JS ↔ HRM Bridge

New file:

- `lib/hrmBridge.ts`

Responsibilities:

1. Build **task packets**:

```ts
type HRMTaskPacket = {
  personaId: string;
  emotionTier: number;
  goal: string;
  context: string[];
  projectRoot: string;
  sandboxRoot?: string;
  riskHint?: "LOW" | "MEDIUM" | "HIGH";
};
```

2. Call Python HRM via:
   - HTTP (if BrewDaemon exposes it), OR
   - `child_process.spawn` / CLI.

3. Normalize response:

```ts
type HRMResult = {
  ok: boolean;
  plan: string[];
  explanations?: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  truthScore?: number;
  raw?: any;
};
```

4. Log run through `logHRMRun(result)` in `brewLastServer`.




---

## 4. BrewTruth + HRM

After HRM returns a plan, JS side may call BrewTruth:

```ts
const truth = await reviewWithBrewTruth(JSON.stringify(result.plan));
```

If `truth.riskLevel === "HIGH"`:
- Mark run as high risk.
- Clamp emotional tier to 5.
- Require explicit override to continue.




---

## 5. Sandbox Integration

HRM must **never** directly mutate real files.

When plan includes code changes:
- Steps must target `sandbox/mirror` paths only.
- Any generated patch is written under `sandbox/runs/...`.

S4.5 engines (Self-Maintenance + Patch Engine) handle:
- `diff`, `patch`, `bundle`, `insights`.

HRM provides plan & rationale, not raw file writes.


---

## 6. BrewLast Logging

HRM runs are stored as:

```json
{
  "tool": "hrm_run",
  "args": ["identity_engine"],
  "cwd": "/home/brewexec",
  "timestamp": "...",
  "summary": "HRM v3 plan (5 steps) risk=LOW truthScore=0.91",
  "ok": true,
  "hrm": {
    "personaId": "rb",
    "emotionTier": 3,
    "steps": 5,
    "riskLevel": "LOW",
    "truthScore": 0.91
  }
}
```

Identity events are stored with:

```json
{
  "tool": "identity_event",
  "event": "emotion_shift",
  "fromTier": 3,
  "toTier": 4,
  "personaId": "rb"
}
```


---

## 7. Health Reporting

Extend `/api/brewassist-health` with:

```json
"hrmStatus": {
  "enabled": true,
  "entrypoint": "hrm_chain_v3",
  "lastRunAt": "...",
  "lastRiskLevel": "LOW",
  "lastError": null
}
```


---

## 8. Future Extensions

Later phases (S5+):

HRM-driven:
- Auto-refactor suggestions.
- Strategy comparison (OpenAI vs Gemini vs Mistral).
- Teaching mode (explain every step for BrewUniversity).