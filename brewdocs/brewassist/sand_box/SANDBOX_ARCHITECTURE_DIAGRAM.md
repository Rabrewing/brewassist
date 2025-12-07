# BrewAssist Sandbox — Architecture Diagram (S4 → S5)

┌───────────────────────────────┐
                  │      BrewAssist Cockpit        │
                  │  (customer-facing interface)   │
                  └───────────────┬───────────────┘
                                  │
                                  ▼
                   Trigger: Patch, Fix, Explain, Review
                                  │
                                  ▼
   ┌────────────────────────────────────────────────────────┐
   │                   BrewAssist Chain                     │
   │  (Identity → HRM → LLM Router → BrewTruth → BrewLast)  │
   └───────────────┬────────────────────────────────────────┘
                   │
                   ▼
   ┌────────────────────────────────────────────────────────┐
   │                     SANDBOX ENGINE                      │
   │  - Project Mirror                                       │
   │  - Sync Controller                                      │
   │  - Patch Builder                                        │
   │  - Diff Engine                                          │
   │  - Safety & Risk Module                                 │
   └───────────────┬────────────────────────────────────────┘
                   │
                   ▼
   ┌────────────────────────────────────────────────────────┐
   │                    SANDBOX FILESYSTEM                   │
   │     /sandbox/active/...                                 │
   │     (isolated, never exposed to customers)              │
   └───────────────┬────────────────────────────────────────┘
                   │
                   ▼
     Patch Output → Diff → Risk Score → HRM Explanation → Customer UI
