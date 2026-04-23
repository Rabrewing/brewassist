# BrewAssist Console Design Handoff

**Date:** 2026-04-21  
**Updated:** 2026-04-21 10:25 America/New_York  
**Status:** Browser-design handoff  
**Depends on:** `brewdocs/specs/brewassist-brew-agentic-page-registry-2026-04-21.md`, `brewdocs/specs/brew-billing-metering-and-visibility-contracts-2026-04-21.md`, `brewdocs/specs/brew-platform-monetization-architecture-2026-04-21.md`

## Purpose

Give a browser-based design model a tight, implementation-aware brief for:

- public site updates
- pricing page redesign
- console IA
- Trust Center direction
- Brew Agentic representation inside the BrewAssist product story

This is not a generic brand exercise.

It must stay anchored to the actual product model and billing model already defined in Brew docs.

## What The Designer Must Assume

1. Scope is only:
   - BrewAssist
   - Brew Agentic
2. `brewassist.app` is the public product site and browser app entry
3. `console.brewassist.app` is the authenticated control plane
4. BrewAssist is the hosted/browser control plane
5. Brew Agentic is the local runtime companion
6. The platform monetization model is:
   - platform fee
   - optional usage-priced Brew intelligence
   - managed API margin

## Non-Negotiable Product Truth

- BrewAssist is not a generic chatbot
- BrewAssist is an AI-native DevOps control plane
- Brew Agentic must be represented as a first-class product, not a footnote
- BYOK does not make the product free
- pricing must distinguish:
  - platform subscription
  - optional intelligence usage
  - managed AI usage
- every public page must map to a real console destination or product workflow

## Current Public Reality

Current public pages already exist in the BrewAssist repo:

- `/pages/index.tsx`
- `/pages/pricing.tsx`
- `/pages/terms.tsx`
- `/pages/privacy.tsx`
- `/pages/accessibility.tsx`
- `/pages/cookies.tsx`

Primary public UI components already exist:

- `components/PublicLandingPage.tsx`
- `components/PublicPricingPage.tsx`
- `components/PublicAuthPanel.tsx`
- `components/PublicLegalLinks.tsx`

The redesign should respect that this is a Next.js pages-router app and should evolve the current system instead of inventing a disconnected new app shell.

## What Needs To Be Designed

### Public site

- homepage refresh
- BrewAssist product page
- Brew Agentic page
- pricing page
- security page
- integrations/providers page
- trust center entry

### Console IA

- overview dashboard
- command center
- workspaces
- Brew Agentic connection page
- usage and logs
- billing
- providers
- settings
- support
- trust center

## Priority Design Order

1. Homepage
2. Pricing
3. Signup / onboarding entry
4. Console overview dashboard
5. Command center
6. Brew Agentic page
7. Providers page
8. Billing page
9. Security / Trust Center

## Design Constraints

### Navigation

Top nav:

- Product
- Brew Agentic
- Features
- Pricing
- Security
- Docs
- Login / Start Free

Footer:

- Terms
- Privacy
- Cookies
- Accessibility
- API
- Status
- Support

### Public-to-console mapping

- Pricing -> Billing
- Features -> Command Center
- Brew Agentic -> Brew Agentic console page
- Security -> Trust Center
- Signup -> Onboarding

### Pricing messaging

The pricing design must make these truths obvious:

- platform fee always applies
- BYOK removes vendor charges, not Brew platform charges
- managed usage is centralized and billed by Brew
- usage visibility is part of trust

### Console UX

The console design must visibly support:

- usage transparency
- provider/model visibility
- workspace context
- Brew Agentic connection status
- billing and credits
- trust and governance

## Deliverables To Ask The Browser Model For

1. sitemap / route tree
2. top-nav and footer design
3. homepage wireframe
4. pricing page wireframe
5. overview dashboard wireframe
6. billing page wireframe
7. Brew Agentic page wireframe
8. trust center wireframe
9. component list by page
10. conversion and onboarding flow map

## Copy-Paste Prompt For Browser ChatGPT

Use this prompt:

```md
Design the public site and console IA for BrewAssist + Brew Agentic only.

Product truth:
- BrewAssist is the hosted AI-native DevOps control plane
- Brew Agentic is the local runtime companion
- brewassist.app is the public site and browser entry
- console.brewassist.app is the authenticated control plane

Monetization truth:
- platform fee always applies
- optional usage-priced Brew intelligence is a second layer
- managed API margin is a third layer
- BYOK does not make the product free

Required public pages:
- homepage
- BrewAssist product page
- Brew Agentic page
- pricing
- security
- integrations/providers
- trust center

Required console pages:
- overview dashboard
- command center
- workspaces
- Brew Agentic connection page
- usage and logs
- billing
- providers
- support
- settings
- trust center

Required public-to-console mapping:
- Pricing -> Billing
- Features -> Command Center
- Brew Agentic -> Brew Agentic console page
- Security -> Trust Center
- Signup -> Onboarding

Design constraints:
- do not treat BrewAssist like a generic chatbot
- do not bury Brew Agentic as a minor feature
- pricing must clearly explain platform fee vs BYOK vs managed
- usage transparency and trust must be visible
- enterprise credibility matters more than hype
- keep the IA realistic for a Next.js web app

Output:
1. sitemap
2. navigation model
3. page-by-page wireframe descriptions
4. console IA
5. pricing information architecture
6. conversion and onboarding flow
7. recommended build order
```

## What Comes Next After Design

Once the browser design pass is done, bring back:

- sitemap
- wireframes
- route names
- component list

Then the next step is:

- scaffold actual BrewAssist pages and shared components against the approved IA
