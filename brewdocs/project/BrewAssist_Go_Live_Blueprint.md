# BrewAssist Go-Live Blueprint (brewassist.app)

## Objective

Define the architecture needed to take BrewAssist from a local DevOps cockpit to an **EOTB** (“Enterprise Out The Box”) SaaS app running at:

- `brewassist.app` → Cockpit UI + marketing site
- A separate sandbox infra (per-customer isolated environments)

## Current State

- Signed-out users land on a public marketing/auth entry instead of the cockpit.
- Supabase is the active auth and enterprise data path.
- Email magic-link auth works in-browser; protected API routes currently accept the browser bearer token while server-side cookie exchange is still being hardened.
- Tenant bootstrap is in place for org/workspace creation and now reuses existing records for the super-admin recovery account.
- Typed agent runtime, persisted replay, and collab run notes now exist in the online control plane.
- The launch path is still blocked on real provider repo connect, sandbox binding, and full preview-confirm-apply-report-replay completion.

## Current Auth Risks

- The duplicate `GoTrueClient` warning was caused by multiple browser Supabase clients. Fixed by making `lib/supabase/browser.ts` a singleton and updating `EnterpriseTenantGate` to use it.
- The Supabase 500s on membership lookup were caused by recursive RLS policy in `public.is_active_org_member()`. Fixed by applying migration `202604130003_fix_membership_rls_recursion.sql` which replaces the function with a direct query and narrows the memberships select policy.
- Sign-in now works reliably; the cockpit loads and shows the billing status badge for the org plan.
- The Next.js dev-mode `isrManifest` websocket warning is framework/HMR noise, not a blocker.

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

5. **Public Entry And Billing Layer**
   - Public landing page aligned to the real control-plane workflow
   - Pricing page with normalized tier messaging
   - Billing and plan-visibility surfaces tied to org scope
   - Legal/compliance disclosures before cockpit access

6. **Observability & Safety**
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
   - Add a public landing page and auth gateway before the cockpit loads.
   - Add an org/workspace gate after login so tenant scope is explicit before the cockpit loads.
   - Add cookie consent and legal pages (terms/privacy/cookies/accessibility) for the public entry flow.
   - Include AI usage terms and data-collection disclosure before sign-in.
   - Surface a public support contact (info@brewassist.app) for legal/compliance questions.
   - Allow self-serve email magic link and optional Google/GitHub login; use org-managed SSO/OIDC/SAML for enterprise tenants.
   - Enforce plan tiers:

- Free (limited runs)
- Pro
- Enterprise

## Remaining Go-Live Blockers

1. ~~Fix tenant lookup stability by removing duplicate browser Supabase clients and repairing the recursive `memberships` RLS policy path.~~ (✅ FIXED)
2. Real repo provider auth/connect flow for GitHub (✅ FIXED), GitLab (✅ FIXED), Bitbucket (✅ FIXED), and local repo selection (✅ BrewAgentic Bridge).
3. Real sandbox mirror binding and sandbox lifecycle per selected repo/workspace. (✅ Multi-provider binding implemented securely for GH/GL/BB)
4. Server-side auth hardening: reliable session cookies, production SMTP, and enterprise SSO.
5. End-to-end online execution lifecycle: confirm, apply, and full execution reporting must be real, not partial.
6. Landing, pricing, billing, and plan enforcement surfaces need to match the normalized public product spec before launch.

## Landing And Billing Direction

- Use `brewdocs/BrewAssist Landing Page-Pricing-v1.md` and the mockups under `brewdocs/mockups/` as visual direction.
- Normalize the copy to the real product state before implementation.
- Public messaging should emphasize provider/repo context, sandbox-first execution, policy gating, report/replay, telemetry, and collaboration.
- Avoid generic AI-tool marketing language or compliance claims that overstate current implementation.

7. **Roll Out**
   - Internal dogfooding:
     - RB’s BrewVerse projects as first “customer”.
   - Closed beta:
     - Invite a few devs.
   - Public waitlist.

---

## Long-Term Direction

- **Universal Provider Architecture (BYOK):**
  - Shift from rigid fallback chains to a dynamic provider system.
  - **Bring Your Own Key (BYOK):** Allow enterprise clients to input their own API keys for inference, or use BrewAssist's managed quotas.
  - **Expanded Roster:** Add support for ChatGPT 5.4, Gemini 3, Anthropic (Claude), Mimo V2 (Omni + Pro), Kimi K2.5, Qwen, and MiniMax.
- Native support for:
  - BrewChat (general AI)
  - BrewCore (knowledge AI)
- Integrations:
  - GitHub / GitLab / Bitbucket / local repos
  - Supabase / Postgres
- BrewUniversity integration as a training extension.
