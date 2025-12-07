# BrewAssist Go-Live Blueprint (brewassist.app)

## Objective

Define the architecture needed to take BrewAssist from a local DevOps cockpit to an **EOTB** (“Enterprise Out The Box”) SaaS app running at:

- `brewassist.app` → Cockpit UI + marketing site
- A separate sandbox infra (per-customer isolated environments)

---

## Core Components

1. **BrewAssist Cockpit (Next.js)**
   - Frontend:
     - React + Next.js (Pages router, currently)
     - UI: Cockpit layout (left tree, center workpane, right sandbox)
   - API routes:
     - `/api/brewassist`
     - `/api/brewassist-*` (health, persona, sandbox)
     - `/api/fs-*`
     - `/api/brewlast*`
     - `/api/brewtruth*`

2. **LLM & Tools Layer**
   - OpenAI GPT-4.1 (primary)
   - Gemini Flash (research / fallback)
   - Mistral (local)
   - NIM (research pipeline inside chain)
   - BrewTruth (risk / audit)
   - BrewLast (state/history)
   - Sandbox toolset (fs read/write/patch, safely gated)

3. **Sandbox Infra**
   - Local dev: `/sandbox` directory bound to BrewAssist.
   - SaaS: per-customer sandbox using:
     - Dedicated VM/container
     - Agent that exposes:
       - `fs-tree`
       - `fs-read`
       - `fs-write` (gated)
       - `patch-apply` (gated)
   - BrewAssist connects to this via secure HTTPS or SSH/WebSocket.

4. **Multi-Tenant Layer**
   - DB (Postgres or similar):
     - Tenants
     - Users
     - Projects
     - Sandboxes (endpoint + metadata)
     - LLM usage logs
     - BrewLast records
   - Authentication (Supabase Auth / Auth0 / Cognito)
   - Billing (Stripe)

5. **Observability & Safety**
   - Logs:
     - API logs
     - Tool calls
     - Chain decisions
   - Metrics:
     - Per-tenant usage
     - Error counts
   - BrewTruth:
     - Policy enforcement / risk scoring.

---

## Deployment Plan (High-Level)

1. **Prepare BrewAssist repo for deployment**
   - Clean `package.json` scripts.
   - Ensure `.env` schema documented.
   - `pnpm build` must be consistently clean.

2. **Provision Infrastructure**
   - Vercel / Render / similar for:
     - `brewassist.app` (UI + APIs).
   - Cloud environment for sandbox workers:
     - Each customer: new worker / VM / container with sandbox agent.

3. **Set Up DNS**
   - `brewassist.app` → Cockpit + marketing.
   - Optionally:
     - `sandbox.brewassist.app` or per-tenant subdomains.

4. **Add Auth & Billing**
   - Protect cockpit behind login.
   - Enforce plan tiers:
     - Free (limited runs)
     - Pro
     - Enterprise

5. **Roll Out**
   - Internal dogfooding:
     - RB’s BrewVerse projects as first “customer”.
   - Closed beta:
     - Invite a few devs.
   - Public waitlist.

---

## Long-Term Direction

- Native support for:
  - BrewChat (general AI)
  - BrewCore (knowledge AI)
- Integrations:
  - GitHub / GitLab / Bitbucket
  - Supabase / Postgres
- BrewUniversity integration as a training extension.
