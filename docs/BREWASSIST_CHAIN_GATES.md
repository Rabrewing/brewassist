# BrewAssist Chain Gates

## Definition of “Online”
BrewAssist is considered ONLINE when:
1) `/api/brewassist` accepts a valid payload and returns 200 for chat requests.
2) Customer mode can chat (200) but cannot execute tool actions (403/412).
3) Admin mode can chat (200) and tool actions require confirmations (412) before execution.
4) Router produces at least one route for chat lane when providers are enabled (never “zero routesToTry”).

## The 8 Gates
- **G1 Contract:** valid payload -> 200  
- **G2 Contract:** missing input -> 400  
- **G3 Mode:** customer chat -> 200  
- **G4 Mode:** admin chat -> 200  
- **G5 Toolbelt:** customer tool attempt -> 403/412  
- **G6 Toolbelt:** admin tool without confirmation -> 412  
- **G7 Toolbelt:** admin tool with confirmation -> 200/202  
- **G8 Router:** enabled providers + chat lane must not yield “zero routesToTry”  

## Run
- `pnpm test:chain`

## Troubleshooting
- **400:** API contract mismatch (e.g., `input` vs `prompt`)
- **403/412:** Toolbelt gating working (or over-blocking if safe chat is blocked)
- **500 + “zero routesToTry”:** router filtering/branching issue (mode mismatch, model undefined, or over-gating)
- **500 + “all providers failed”:** provider execution failures; should include a failure list
