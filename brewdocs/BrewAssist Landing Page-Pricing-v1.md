# Landing Page Specs 1st pass

That logo is 🔥 — it already communicates DevOps intelligence \+ personality \+ infinite workflow loop, which is exactly what your landing page needs to reinforce.

Let’s build this like a production-grade enterprise landing page, not just marketing fluff.

\---

🧭 🔥 BREWASSIST LANDING PAGE — FULL BLUEPRINT

🧠 1\. HERO SECTION (Above the Fold)

Headline:

BrewAssist — Vibe Coding Meets Enterprise DevOps

Subheadline:

Build, deploy, and orchestrate faster with an AI-native DevOps cockpit designed for builders, teams, and enterprises.

Value Props (3 bullets):

⚡ Vibe Coding Ready — Build fast, think faster, ship instantly

🏢 Enterprise Ready — Secure, scalable, compliant from day one

🧠 AI-Native — Context-aware, tool-integrated, truth-driven

CTA:

\[Launch BrewAssist\]

\[Request Enterprise Demo\]

\---

🧬 2\. WHAT IS BREWASSIST (Positioning Section)

Core Message:

\> BrewAssist is an AI-powered DevOps Operating System that transforms how teams build, debug, and deploy software.

Explain Simply:

Not just a chatbot

Not just a terminal

Not just DevOps

👉 It’s:

\> A unified cockpit for coding, automation, infrastructure, and intelligence

\---

⚙️ 3\. CORE CAPABILITIES (Tie to Your Architecture)

🧠 AI Command Engine

Natural language → real execution

Context-aware across sessions

Multi-step reasoning workflows

🧰 Toolbelt Execution System

Structured tool layers (APIs, scripts, DB, infra)

Safe sandbox execution

Real-time logs \+ feedback

📂 Workspace Cockpit UI

Left: Tools

Center: Command stream

Right: Files \+ sandbox

(aligns perfectly with your layout system )

🧪 Sandbox Mode

Test before deploy

Safe experimentation

Isolated execution environments

\---

🔐 4\. ENTERPRISE SECURITY & COMPLIANCE

This is CRITICAL for positioning.

🔒 Security Features:

Row-Level Security (RLS)  
Fine-grained data isolation per tenant/user

Role-Based Access Control (RBAC)  
Admin, developer, viewer roles with strict permissions

Secure Authentication

OAuth (Google, Microsoft, GitHub)

SSO / SAML (enterprise)

Audit Logging

Full action traceability

Compliance-ready logs

Data Isolation (Multi-Tenant Safe)

\---

🏢 Compliance Alignment:

SOC 2 Ready (positioning)

GDPR-aware data handling

Secure API \+ token-based access

Encryption at rest \+ in transit

👉 This ties directly into your security model workflow 

\---

🚀 5\. VIBE CODING MODE (Your Differentiator)

Section Title:

Built for Vibe Coding

Explain:

Think → type → build instantly

No rigid workflows

AI adapts to your style

Features:

Conversational coding

Inline execution

Rapid iteration loops

👉 This is your category-defining hook

\---

🏗️ 6\. HOW IT WORKS (Simple Flow)

1\. Enter a command (natural language or code)

2\. BrewAssist interprets \+ plans

3\. Executes via Toolbelt

4\. Returns results \+ logs

5\. Learns context

\---

🧩 7\. ENTERPRISE ONBOARDING

Section Title:

Enterprise-Ready From Day One

Dedicated onboarding support

Custom environment setup

API \+ integration assistance

SLA-backed support

\---

❓ 8\. FAQ SECTION

Example Questions:

Q: Is BrewAssist secure for enterprise use?  
Yes — built with RLS, RBAC, audit logs, and enterprise auth.

Q: Can it integrate with our existing stack?  
Yes — APIs, webhooks, and tool integrations supported.

Q: Is this a replacement for DevOps engineers?  
No — it amplifies them.

Q: What makes BrewAssist different?  
It combines AI, DevOps, and execution into one system.

\---

📢 9\. WHAT TO EXPECT (User Expectations Section)

When using BrewAssist, you can expect:

Faster development cycles

Reduced manual DevOps work

Intelligent automation

Transparent execution logs

Continuous learning system

\---

🦾 10\. FINAL CTA

Headline:

Build Faster. Deploy Smarter. Think Bigger.

Buttons:

Start Free

Book Enterprise Demo

\---

⚖️ 11\. FOOTER (IMPORTANT — YOU ASKED FOR THIS)

Sections:

📜 Legal

Terms & Conditions

Privacy Policy

Data Collection Policy

Accessibility Statement

🤖 Technical

robots.txt

API Docs

System Status

🧠 Product

Features

Security

Enterprise

📬 Contact

Support

Sales

Partnerships

\---

🧱 12\. PAGE STRUCTURE (DEV READY)

/landing  
  ├── Hero  
  ├── WhatIs  
  ├── Capabilities  
  ├── VibeCoding  
  ├── Security  
  ├── HowItWorks  
  ├── Enterprise  
  ├── FAQ  
  ├── CTA  
  └── Footer

\---

🎯 13\. POSITIONING SUMMARY (THIS IS GOLD)

Use this everywhere:

\> BrewAssist is the first AI-native DevOps cockpit built for vibe coding and enterprise-scale execution.

\---

🔥 FINAL STRATEGIC NOTE

You’re not selling:

DevOps tools ❌

AI assistant ❌

You’re selling:

\> A new way to build software

\---

🚀 NEXT STEP (If you want)

I can: ✅ Turn this into a production-ready React/Next.js landing page  
✅ Wire your logo into hero section  
✅ Add animations \+ terminal effects  
✅ Generate SEO \+ meta tags  
✅ Create .md docs for BrewDocs (aligned with your system)

Just say: 👉 “build the page”

# landing page code

import React, { useMemo, useState } from "react";  
import { motion } from "framer-motion";  
import {  
  ShieldCheck,  
  TerminalSquare,  
  Wand2,  
  Lock,  
  KeyRound,  
  Fingerprint,  
  Workflow,  
  Sparkles,  
  Bot,  
  ChevronDown,  
  CheckCircle2,  
  ServerCog,  
  FileCode2,  
  Users,  
  LifeBuoy,  
  ClipboardCheck,  
  Globe,  
  Rocket,  
} from "lucide-react";

const faqs \= \[  
  {  
    q: "What is BrewAssist?",  
    a: "BrewAssist is an AI-native DevOps cockpit designed to help teams move from prompt to plan to execution with a guided interface, terminal-aware workflows, and enterprise controls.",  
  },  
  {  
    q: "What makes BrewAssist different from a chatbot?",  
    a: "It is positioned as a working cockpit, not just a chat window. It combines guided workflows, TUI-inspired interaction, execution surfaces, support flows, onboarding, and enterprise governance patterns in one product experience.",  
  },  
  {  
    q: "Is BrewAssist enterprise ready?",  
    a: "Yes. The landing page is framed around enterprise expectations including RLS, RBAC, auditability, secure auth patterns, accessibility expectations, onboarding flows, and compliance-conscious architecture.",  
  },  
  {  
    q: "Does BrewAssist support terminal-first users?",  
    a: "Yes. The TUI section positions BrewAssist for keyboard-driven builders who want a terminal-native feel with AI assistance, fast command flows, and execution visibility.",  
  },  
  {  
    q: "What support should users expect?",  
    a: "Users should expect guided onboarding, in-product help, clear workflow explanations, support surfaces, and a product experience that explains what to do next instead of dropping them into a blank system.",  
  },  
  {  
    q: "Can BrewAssist fit into existing stacks?",  
    a: "The page is designed to position BrewAssist as integration-friendly for modern app and platform teams using APIs, automation, cloud infrastructure, and controlled deployment pipelines.",  
  },  
\];

const capabilityCards \= \[  
  {  
    icon: Wand2,  
    title: "Vibe Coding Ready",  
    body: "Move from idea to implementation quickly with AI-guided workflows, fast iteration loops, and a product experience built for momentum.",  
  },  
  {  
    icon: TerminalSquare,  
    title: "TUI-Inspired Workflows",  
    body: "Give technical users a terminal-native feel with command-focused interaction, hotkeys, stream-like output surfaces, and lower friction execution.",  
  },  
  {  
    icon: ShieldCheck,  
    title: "Enterprise Ready",  
    body: "Position BrewAssist for serious teams with security architecture, policy-aware execution, onboarding, governance, and operational trust.",  
  },  
  {  
    icon: Bot,  
    title: "AI-Native Cockpit",  
    body: "Not just a chat layer. BrewAssist is presented as a command center for planning, execution, visibility, support, and intelligent assistance.",  
  },  
\];

const securityItems \= \[  
  {  
    icon: Lock,  
    title: "Row-Level Security",  
    text: "Fine-grained tenant and user data isolation for sensitive workloads and controlled access patterns.",  
  },  
  {  
    icon: Fingerprint,  
    title: "RBAC",  
    text: "Role-based permissions for admins, operators, contributors, and viewers so the right people can access the right tools.",  
  },  
  {  
    icon: KeyRound,  
    title: "Secure Auth",  
    text: "OAuth, modern session flows, and enterprise-ready identity patterns designed for scalable environments.",  
  },  
  {  
    icon: ClipboardCheck,  
    title: "Auditability",  
    text: "Activity visibility, workflow traceability, and review-friendly operational patterns for high-trust teams.",  
  },  
\];

const footerGroups \= \[  
  {  
    title: "Product",  
    links: \["Capabilities", "TUI Mode", "Enterprise", "FAQ", "Support"\],  
  },  
  {  
    title: "Trust",  
    links: \["Security", "Accessibility", "Privacy", "Terms & Conditions", "Data Collection"\],  
  },  
  {  
    title: "Technical",  
    links: \["robots.txt", "Status", "API", "Documentation", "Onboarding"\],  
  },  
  {  
    title: "Company",  
    links: \["About", "Contact", "Partnerships", "Demo", "Sales"\],  
  },  
\];

function SectionEyebrow({ children }: { children: React.ReactNode }) {  
  return (  
    \<div className="inline-flex items-center rounded-full border border-amber-400/20 bg-white/5 px-3 py-1 text-\[11px\] uppercase tracking-\[0.22em\] text-amber-300"\>  
      {children}  
    \</div\>  
  );  
}

function Card({ children, className \= "" }: { children: React.ReactNode; className?: string }) {  
  return (  
    \<div className={\`rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}\`}\>  
      {children}  
    \</div\>  
  );  
}

function StatPill({ children }: { children: React.ReactNode }) {  
  return (  
    \<div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200"\>  
      {children}  
    \</div\>  
  );  
}

function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () \=\> void }) {  
  return (  
    \<div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"\>  
      \<button  
        onClick={onClick}  
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"  
      \>  
        \<span className="text-base font-medium text-white"\>{q}\</span\>  
        \<ChevronDown className={\`h-5 w-5 shrink-0 text-amber-300 transition-transform ${open ? "rotate-180" : ""}\`} /\>  
      \</button\>  
      {open && \<div className="px-5 pb-5 text-sm leading-7 text-zinc-300"\>{a}\</div\>}  
    \</div\>  
  );  
}

export default function BrewAssistLandingPage() {  
  const \[openFaq, setOpenFaq\] \= useState\<number\>(0);  
  const currentYear \= useMemo(() \=\> new Date().getFullYear(), \[\]);

  return (  
    \<div className="min-h-screen bg-\[\#050505\] text-white"\>  
      \<div className="pointer-events-none fixed inset-0 overflow-hidden"\>  
        \<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_top,\_rgba(16,185,129,0.14),transparent\_30%),radial-gradient(circle\_at\_80%\_15%,rgba(245,158,11,0.14),transparent\_24%),radial-gradient(circle\_at\_50%\_100%,rgba(8,145,178,0.14),transparent\_30%)\]" /\>  
        \<div className="absolute inset-0 opacity-\[0.08\] \[background-image:linear-gradient(rgba(255,255,255,.15)\_1px,transparent\_1px),linear-gradient(90deg,rgba(255,255,255,.15)\_1px,transparent\_1px)\] \[background-size:72px\_72px\]" /\>  
      \</div\>

      \<header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl"\>  
        \<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"\>  
          \<div className="flex items-center gap-3"\>  
            \<div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-300/15 to-emerald-300/10 text-amber-300 shadow-lg shadow-amber-500/10"\>  
              \<Bot className="h-5 w-5" /\>  
            \</div\>  
            \<div\>  
              \<div className="text-lg font-semibold tracking-wide"\>BrewAssist\</div\>  
              \<div className="text-xs uppercase tracking-\[0.25em\] text-zinc-400"\>DevOps Cockpit\</div\>  
            \</div\>  
          \</div\>

          \<nav className="hidden items-center gap-8 text-sm text-zinc-300 lg:flex"\>  
            \<a href="\#capabilities" className="transition hover:text-white"\>Capabilities\</a\>  
            \<a href="\#tui" className="transition hover:text-white"\>TUI Mode\</a\>  
            \<a href="\#security" className="transition hover:text-white"\>Security\</a\>  
            \<a href="\#faq" className="transition hover:text-white"\>FAQ\</a\>  
          \</nav\>

          \<div className="flex items-center gap-3"\>  
            \<button className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/30 hover:bg-white/5 md:block"\>  
              Request Demo  
            \</button\>  
            \<button className="rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:scale-\[1.02\]"\>  
              Launch BrewAssist  
            \</button\>  
          \</div\>  
        \</div\>  
      \</header\>

      \<main className="relative"\>  
        \<section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-14 lg:grid-cols-\[1.05fr\_.95fr\] lg:px-8 lg:pb-28 lg:pt-20"\>  
          \<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}\>  
            \<SectionEyebrow\>Vibe Coding Meets Enterprise DevOps\</SectionEyebrow\>  
            \<h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-\[1.02\] tracking-tight text-white md:text-6xl xl:text-7xl"\>  
              BrewAssist is \<span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent"\>vibe coding ready\</span\> and \<span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent"\>enterprise ready\</span\>.  
            \</h1\>  
            \<p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300"\>  
              Build, orchestrate, and support modern software delivery with an AI-native DevOps cockpit designed for fast-moving builders and serious enterprise teams.  
            \</p\>

            \<div className="mt-8 flex flex-wrap gap-3"\>  
              \<StatPill\>AI-native execution\</StatPill\>  
              \<StatPill\>TUI-inspired workflows\</StatPill\>  
              \<StatPill\>Security-first posture\</StatPill\>  
              \<StatPill\>Enterprise onboarding\</StatPill\>  
            \</div\>

            \<div className="mt-10 flex flex-col gap-4 sm:flex-row"\>  
              \<button className="rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-4 text-base font-semibold text-black shadow-xl shadow-emerald-500/20 transition hover:scale-\[1.01\]"\>  
                Launch BrewAssist  
              \</button\>  
              \<button className="rounded-2xl border border-amber-300/25 bg-amber-300/8 px-6 py-4 text-base font-semibold text-amber-200 transition hover:bg-amber-300/12"\>  
                Request Enterprise Demo  
              \</button\>  
            \</div\>

            \<div className="mt-10 grid gap-4 sm:grid-cols-3"\>  
              {\[  
                \[Workflow, "Unified cockpit", "Coding, automation, support, and operational visibility in one flow."\],  
                \[ShieldCheck, "Trust architecture", "Positioned around RLS, RBAC, auditability, and secure access patterns."\],  
                \[Rocket, "Built to scale", "Crafted for solo momentum, team adoption, and enterprise deployment narratives."\],  
              \].map((\[Icon, title, body\], index) \=\> {  
                const Cmp \= Icon as React.ComponentType\<any\>;  
                return (  
                  \<Card key={index} className="p-5"\>  
                    \<Cmp className="h-5 w-5 text-amber-300" /\>  
                    \<div className="mt-3 text-sm font-semibold text-white"\>{title as string}\</div\>  
                    \<div className="mt-2 text-sm leading-6 text-zinc-400"\>{body as string}\</div\>  
                  \</Card\>  
                );  
              })}  
            \</div\>  
          \</motion.div\>

          \<motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.08 }}\>  
            \<Card className="relative overflow-hidden p-4 md:p-5"\>  
              \<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_20%\_15%,rgba(16,185,129,.22),transparent\_22%),radial-gradient(circle\_at\_85%\_25%,rgba(251,191,36,.18),transparent\_24%)\]" /\>  
              \<div className="relative rounded-\[26px\] border border-white/10 bg-\[\#0b0b0b\]/90 p-4"\>  
                \<div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4"\>  
                  \<div\>  
                    \<div className="text-xs uppercase tracking-\[0.28em\] text-zinc-500"\>Hero Preview\</div\>  
                    \<div className="mt-1 text-lg font-semibold"\>BrewAssist DevOps Cockpit\</div\>  
                  \</div\>  
                  \<div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-\[0.22em\] text-emerald-200"\>  
                    Live concept  
                  \</div\>  
                \</div\>

                \<div className="grid gap-4 lg:grid-cols-\[1fr\_1.2fr\]"\>  
                  \<div className="rounded-3xl border border-white/10 bg-black/40 p-5"\>  
                    \<div className="text-xs uppercase tracking-\[0.25em\] text-zinc-500"\>Brand Positioning\</div\>  
                    \<div className="mt-4 text-3xl font-semibold leading-tight"\>  
                      \<span className="text-emerald-300"\>BrewAssist\</span\>  
                      \<span className="text-zinc-300"\> x \</span\>  
                      \<span className="text-amber-300"\>Enterprise\</span\>  
                    \</div\>  
                    \<div className="mt-4 space-y-3 text-sm leading-6 text-zinc-400"\>  
                      \<div className="flex gap-3"\>\<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /\>TUI-inspired product surface\</div\>  
                      \<div className="flex gap-3"\>\<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /\>Security and compliance narrative\</div\>  
                      \<div className="flex gap-3"\>\<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /\>Support, onboarding, FAQ, and legal trust footer\</div\>  
                    \</div\>  
                  \</div\>

                  \<div className="rounded-3xl border border-amber-300/15 bg-gradient-to-br from-\[\#0b1113\] to-\[\#090909\] p-4 shadow-\[0\_0\_60px\_rgba(251,191,36,0.08)\]"\>  
                    \<div className="mb-3 flex items-center justify-between text-xs text-zinc-400"\>  
                      \<div className="flex gap-2"\>  
                        \<span className="h-2.5 w-2.5 rounded-full bg-red-400/70" /\>  
                        \<span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /\>  
                        \<span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" /\>  
                      \</div\>  
                      \<span className="uppercase tracking-\[0.24em\]"\>Cockpit View\</span\>  
                    \</div\>  
                    \<div className="grid min-h-\[360px\] grid-cols-\[88px\_1fr\_180px\] gap-3 rounded-\[22px\] border border-white/10 bg-black/60 p-3"\>  
                      \<div className="rounded-2xl border border-white/10 bg-white/5 p-3"\>  
                        \<div className="text-\[10px\] uppercase tracking-\[0.22em\] text-zinc-500"\>Tools\</div\>  
                        \<div className="mt-3 space-y-2"\>  
                          {\[  
                            "Assist",  
                            "Agent",  
                            "Loop",  
                            "Files",  
                            "Tasks",  
                            "Audit",  
                          \].map((item) \=\> (  
                            \<div key={item} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-zinc-300"\>  
                              {item}  
                            \</div\>  
                          ))}  
                        \</div\>  
                      \</div\>  
                      \<div className="rounded-2xl border border-white/10 bg-white/5 p-3"\>  
                        \<div className="flex items-center justify-between"\>  
                          \<div className="text-\[10px\] uppercase tracking-\[0.22em\] text-zinc-500"\>Command Stream\</div\>  
                          \<div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-\[10px\] uppercase tracking-\[0.2em\] text-cyan-200"\>  
                            TUI flow  
                          \</div\>  
                        \</div\>  
                        \<div className="mt-3 space-y-3"\>  
                          \<div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm text-cyan-100"\>  
                            Analyze deployment workflow and suggest safer release path.  
                          \</div\>  
                          \<div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3 text-sm text-amber-100"\>  
                            Plan generated. RLS, RBAC, audit logging, and access guardrails included.  
                          \</div\>  
                          \<div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-300"\>  
                            Next: run onboarding, confirm team roles, and activate support guidance.  
                          \</div\>  
                        \</div\>  
                        \<div className="mt-4 rounded-2xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-zinc-500"\>  
                          brewassist$ /init enterprise workspace  
                        \</div\>  
                      \</div\>  
                      \<div className="rounded-2xl border border-white/10 bg-white/5 p-3"\>  
                        \<div className="text-\[10px\] uppercase tracking-\[0.22em\] text-zinc-500"\>Workspace\</div\>  
                        \<div className="mt-3 space-y-2 text-xs text-zinc-300"\>  
                          {\[  
                            "Security",  
                            "Compliance",  
                            "Onboarding",  
                            "FAQ",  
                            "Support",  
                            "Logs",  
                            "Legal",  
                          \].map((item) \=\> (  
                            \<div key={item} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2"\>  
                              {item}  
                            \</div\>  
                          ))}  
                        \</div\>  
                      \</div\>  
                    \</div\>  
                  \</div\>  
                \</div\>  
              \</div\>  
            \</Card\>  
          \</motion.div\>  
        \</section\>

        \<section id="capabilities" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="max-w-3xl"\>  
            \<SectionEyebrow\>Capabilities\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl"\>  
              Informative by design. Powerful by expectation.  
            \</h2\>  
            \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
              The page is built to explain what BrewAssist is, what users should expect, and why it belongs in both fast-moving developer environments and enterprise delivery organizations.  
            \</p\>  
          \</div\>

          \<div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4"\>  
            {capabilityCards.map((card) \=\> {  
              const Icon \= card.icon;  
              return (  
                \<Card key={card.title} className="p-6"\>  
                  \<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300/20 to-amber-300/15 text-amber-200"\>  
                    \<Icon className="h-5 w-5" /\>  
                  \</div\>  
                  \<div className="mt-5 text-xl font-semibold text-white"\>{card.title}\</div\>  
                  \<p className="mt-3 text-sm leading-7 text-zinc-400"\>{card.body}\</p\>  
                \</Card\>  
              );  
            })}  
          \</div\>  
        \</section\>

        \<section id="tui" className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-\[1fr\_1.05fr\] lg:px-8"\>  
          \<div\>  
            \<SectionEyebrow\>TUI Mode\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
              Terminal-driven intelligence for builders who move fast.  
            \</h2\>  
            \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
              BrewAssist TUI Mode gives the product a command-focused edge: terminal-native energy, keyboard-first speed, and a developer experience that feels serious without losing clarity.  
            \</p\>  
            \<div className="mt-8 grid gap-4 sm:grid-cols-2"\>  
              {\[  
                \[TerminalSquare, "Command-first workflows"\],  
                \[Sparkles, "AI-assisted execution"\],  
                \[FileCode2, "Inline context awareness"\],  
                \[ServerCog, "Streaming operational feedback"\],  
              \].map((\[Icon, label\]) \=\> {  
                const Cmp \= Icon as React.ComponentType\<any\>;  
                return (  
                  \<div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-zinc-200"\>  
                    \<Cmp className="h-5 w-5 text-emerald-300" /\>  
                    \<span\>{label as string}\</span\>  
                  \</div\>  
                );  
              })}  
            \</div\>  
          \</div\>

          \<Card className="overflow-hidden p-4"\>  
            \<div className="rounded-\[24px\] border border-emerald-300/15 bg-\[\#071012\] p-4 shadow-\[0\_0\_50px\_rgba(16,185,129,0.10)\]"\>  
              \<div className="mb-4 flex items-center justify-between"\>  
                \<div className="text-sm font-medium text-emerald-200"\>BrewAssist TUI Preview\</div\>  
                \<div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-\[10px\] uppercase tracking-\[0.22em\] text-emerald-200"\>  
                  Keyboard ready  
                \</div\>  
              \</div\>  
              \<div className="rounded-\[20px\] border border-white/10 bg-black p-4 font-mono text-sm leading-7 text-emerald-200"\>  
                \<div className="text-zinc-500"\>brewassist$ status \--project brewassist\</div\>  
                \<div className="mt-2 text-zinc-300"\>project: brewassist\</div\>  
                \<div className="text-zinc-300"\>mode: enterprise\</div\>  
                \<div className="text-zinc-300"\>security: rls \+ rbac enabled\</div\>  
                \<div className="text-zinc-300"\>support: onboarding \+ faq \+ guidance online\</div\>  
                \<div className="mt-4 text-zinc-500"\>brewassist$ explain deployment posture\</div\>  
                \<div className="mt-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-emerald-100"\>  
                  BrewAssist is positioned to help teams build faster while preserving enterprise trust through controlled access, observability, and workflow guidance.  
                \</div\>  
                \<div className="mt-4 text-zinc-500"\>brewassist$ /help onboarding\</div\>  
                \<div className="mt-2 text-amber-200"\>→ Guided onboarding available\</div\>  
                \<div className="text-amber-200"\>→ Workspace expectations available\</div\>  
                \<div className="text-amber-200"\>→ Support and legal footer linked\</div\>  
              \</div\>  
            \</div\>  
          \</Card\>  
        \</section\>

        \<section id="security" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="grid gap-8 lg:grid-cols-\[.9fr\_1.1fr\]"\>  
            \<div\>  
              \<SectionEyebrow\>Enterprise Security & Compliance\</SectionEyebrow\>  
              \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
                Security posture that speaks enterprise fluently.  
              \</h2\>  
              \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
                BrewAssist is positioned with the language enterprise buyers expect: least privilege, role-aware access, protected workflows, and policy-aware operational design.  
              \</p\>  
              \<div className="mt-7 rounded-3xl border border-amber-300/15 bg-amber-300/8 p-5 text-sm leading-7 text-amber-100"\>  
                Positioning themes: row-level security, RBAC, auditability, secure authentication, accessibility expectations, testing discipline, and release-readiness confidence.  
              \</div\>  
            \</div\>

            \<div className="grid gap-4 md:grid-cols-2"\>  
              {securityItems.map((item) \=\> {  
                const Icon \= item.icon;  
                return (  
                  \<Card key={item.title} className="p-6"\>  
                    \<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/20 to-emerald-300/10 text-amber-200"\>  
                      \<Icon className="h-5 w-5" /\>  
                    \</div\>  
                    \<div className="mt-4 text-xl font-semibold text-white"\>{item.title}\</div\>  
                    \<p className="mt-3 text-sm leading-7 text-zinc-400"\>{item.text}\</p\>  
                  \</Card\>  
                );  
              })}  
            \</div\>  
          \</div\>  
        \</section\>

        \<section className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="grid gap-8 lg:grid-cols-\[1.05fr\_.95fr\]"\>  
            \<Card className="p-7 md:p-8"\>  
              \<SectionEyebrow\>How It Works\</SectionEyebrow\>  
              \<h3 className="mt-4 text-3xl font-semibold text-white"\>From idea to deployment in one continuous flow.\</h3\>  
              \<div className="mt-8 grid gap-4 md:grid-cols-2"\>  
                {\[  
                  \["01", "Type the command", "Start with intent, not friction. Prompt, task, or workflow request."\],  
                  \["02", "BrewAssist plans", "The system interprets the request and organizes the next best action."\],  
                  \["03", "Tooling executes", "The cockpit presents a guided execution model with visibility and structure."\],  
                  \["04", "Results return clearly", "Logs, guidance, next steps, and support surfaces help teams keep moving."\],  
                \].map((\[step, title, body\]) \=\> (  
                  \<div key={step as string} className="rounded-2xl border border-white/10 bg-white/5 p-5"\>  
                    \<div className="text-sm font-semibold text-amber-300"\>{step as string}\</div\>  
                    \<div className="mt-2 text-lg font-semibold text-white"\>{title as string}\</div\>  
                    \<div className="mt-2 text-sm leading-7 text-zinc-400"\>{body as string}\</div\>  
                  \</div\>  
                ))}  
              \</div\>  
            \</Card\>

            \<Card className="p-7 md:p-8"\>  
              \<SectionEyebrow\>Onboarding & Support\</SectionEyebrow\>  
              \<h3 className="mt-4 text-3xl font-semibold text-white"\>Tell users what to expect on day one.\</h3\>  
              \<div className="mt-6 space-y-4"\>  
                {\[  
                  \[Users, "Guided onboarding", "Clear setup expectations for individuals, teams, and enterprise workspaces."\],  
                  \[LifeBuoy, "Support surfaces", "In-product help, FAQ guidance, and expectation-setting instead of ambiguity."\],  
                  \[Globe, "Enterprise readiness narrative", "Explain security, compliance, legal links, and trust posture without burying it."\],  
                \].map((\[Icon, title, body\]) \=\> {  
                  const Cmp \= Icon as React.ComponentType\<any\>;  
                  return (  
                    \<div key={title as string} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"\>  
                      \<div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200"\>  
                        \<Cmp className="h-5 w-5" /\>  
                      \</div\>  
                      \<div\>  
                        \<div className="font-semibold text-white"\>{title as string}\</div\>  
                        \<div className="mt-1 text-sm leading-7 text-zinc-400"\>{body as string}\</div\>  
                      \</div\>  
                    \</div\>  
                  );  
                })}  
              \</div\>  
            \</Card\>  
          \</div\>  
        \</section\>

        \<section id="faq" className="mx-auto max-w-5xl px-6 py-20 lg:px-8"\>  
          \<div className="text-center"\>  
            \<SectionEyebrow\>Frequently Asked Questions\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>Clarity builds trust.\</h2\>  
            \<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300"\>  
              A strong landing page answers the practical questions fast: what BrewAssist is, why it matters, how secure it is, and what adoption should look like.  
            \</p\>  
          \</div\>  
          \<div className="mt-10 space-y-4"\>  
            {faqs.map((item, index) \=\> (  
              \<FaqItem  
                key={item.q}  
                q={item.q}  
                a={item.a}  
                open={openFaq \=== index}  
                onClick={() \=\> setOpenFaq(openFaq \=== index ? \-1 : index)}  
              /\>  
            ))}  
          \</div\>  
        \</section\>

        \<section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8"\>  
          \<Card className="overflow-hidden p-8 md:p-10"\>  
            \<div className="grid gap-8 lg:grid-cols-\[1.1fr\_.9fr\] lg:items-center"\>  
              \<div\>  
                \<SectionEyebrow\>Final Call To Action\</SectionEyebrow\>  
                \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
                  Build faster. Ship smarter. Think bigger.  
                \</h2\>  
                \<p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300"\>  
                  BrewAssist is positioned as the product layer between raw AI capability and real software delivery. It is made to feel exciting for builders and credible for enterprise buyers.  
                \</p\>  
              \</div\>  
              \<div className="flex flex-col gap-4 sm:flex-row lg:justify-end"\>  
                \<button className="rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-4 text-base font-semibold text-black shadow-xl shadow-emerald-500/20"\>  
                  Launch BrewAssist  
                \</button\>  
                \<button className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-6 py-4 text-base font-semibold text-amber-200"\>  
                  Request Enterprise Demo  
                \</button\>  
              \</div\>  
            \</div\>  
          \</Card\>  
        \</section\>  
      \</main\>

      \<footer className="border-t border-white/10 bg-black/70"\>  
        \<div className="mx-auto max-w-7xl px-6 py-14 lg:px-8"\>  
          \<div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5"\>  
            \<div className="xl:col-span-1"\>  
              \<div className="text-xl font-semibold"\>BrewAssist\</div\>  
              \<div className="mt-2 text-sm uppercase tracking-\[0.24em\] text-zinc-500"\>DevOps Cockpit\</div\>  
              \<p className="mt-4 text-sm leading-7 text-zinc-400"\>  
                Vibe coding ready. Enterprise ready. Built to explain, support, and accelerate modern software delivery.  
              \</p\>  
            \</div\>

            {footerGroups.map((group) \=\> (  
              \<div key={group.title}\>  
                \<div className="text-sm font-semibold uppercase tracking-\[0.22em\] text-zinc-300"\>{group.title}\</div\>  
                \<div className="mt-4 space-y-3 text-sm text-zinc-400"\>  
                  {group.links.map((link) \=\> (  
                    \<a key={link} href="\#" className="block transition hover:text-white"\>  
                      {link}  
                    \</a\>  
                  ))}  
                \</div\>  
              \</div\>  
            ))}  
          \</div\>

          \<div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between"\>  
            \<div\>© {currentYear} BrewAssist. All rights reserved.\</div\>  
            \<div className="flex flex-wrap gap-4"\>  
              \<span\>Accessibility\</span\>  
              \<span\>Terms & Conditions\</span\>  
              \<span\>Privacy\</span\>  
              \<span\>Data Collection\</span\>  
              \<span\>robots.txt\</span\>  
            \</div\>  
          \</div\>  
        \</div\>  
      \</footer\>  
    \</div\>  
  );  
}

# footer & policies

Perfect — this is the **enterprise credibility layer**, and honestly this is what separates “cool product” from “buyable platform.”

I’m going to map this like a **real SaaS legal \+ trust architecture**, not just a footer list.

---

# **🧱 🔐 FULL LEGAL \+ FOOTER PAGE MAPPING (BREWASSIST)**

## **🧭 1\. FOOTER STRUCTURE (FINAL)**

### **Column 1 — Product**

* Capabilities  
* TUI Mode  
* Enterprise  
* FAQ  
* Support

### **Column 2 — Trust & Legal (CRITICAL)**

* Privacy Policy  
* Terms & Conditions  
* Data Collection Policy  
* Accessibility Statement  
* Security Overview

### **Column 3 — Compliance & Enterprise**

* Security & Compliance  
* RLS & RBAC Model  
* Audit & Logging  
* Enterprise Onboarding  
* SLA / Support

### **Column 4 — Technical**

* API Docs  
* System Status  
* robots.txt  
* Developer Docs  
* Integrations

### **Column 5 — Company**

* About  
* Contact  
* Sales  
* Partnerships  
* Careers (future-proofing)

---

# **📜 2\. REQUIRED LEGAL PAGES (WITH CONTENT STRUCTURE)**

## **🧾 A. Terms & Conditions**

### **Purpose:**

Define usage rules, liability, and boundaries.

### **Sections:**

1. **Acceptance of Terms**  
2. **Use of Service**  
   * Allowed use  
   * Prohibited actions  
3. **Accounts**  
   * Responsibility  
   * Security expectations  
4. **AI Usage Disclaimer**  
   * Outputs may not be 100% accurate  
   * User responsible for execution decisions  
5. **Service Availability**  
   * No guarantee of uptime  
6. **Limitation of Liability**  
7. **Termination**  
8. **Governing Law**

👉 Add BrewAssist-specific clause:

“BrewAssist provides AI-assisted DevOps workflows but does not replace human validation in production environments.”

---

## **🔐 B. Privacy Policy**

### **Purpose:**

Explain how user data is handled.

### **Sections:**

1. **Information Collected**  
   * Account data  
   * Usage data  
   * Logs / commands  
2. **How Data is Used**  
   * Improve system  
   * Provide support  
3. **Data Storage**  
   * Encryption at rest  
   * Secure infrastructure  
4. **Data Sharing**  
   * No selling of data  
   * Limited third-party use  
5. **User Rights**  
   * Access  
   * Delete  
   * Export  
6. **Cookies / Tracking**  
7. **Contact for privacy**

---

## **📊 C. Data Collection Policy (Separate \= Enterprise Signal)**

### **Purpose:**

Be explicit and transparent.

### **Include:**

* What commands are logged  
* What is stored vs ephemeral  
* AI training usage (VERY important)  
* Retention period  
* Opt-out controls (if applicable)

👉 Enterprise trust line:

“Customer data is never used to train shared models without explicit consent.”

---

## **♿ D. Accessibility Statement**

### **Purpose:**

Enterprise \+ compliance credibility

### **Include:**

* Commitment to WCAG standards  
* Keyboard navigation (tie into TUI 🔥)  
* Screen reader support  
* Ongoing improvements

👉 Tie-in:

“BrewAssist is designed with keyboard-first workflows, supporting both accessibility and developer efficiency.”

---

## **🔒 E. Security Overview Page (VERY IMPORTANT)**

This is your **sales weapon**.

### **Sections:**

#### **1\. Security Philosophy**

* Least privilege  
* Secure by design

#### **2\. Core Features**

* Row-Level Security (RLS)  
* Role-Based Access Control (RBAC)  
* Audit logging  
* Secure authentication

#### **3\. Data Protection**

* Encryption (at rest \+ in transit)  
* Isolation

#### **4\. Operational Security**

* Monitoring  
* Logging  
* Incident response (basic)

#### **5\. Compliance Positioning**

* SOC 2 (future-ready wording)  
* GDPR-aware

---

## **🏢 F. Enterprise Security & Compliance Page**

(This is deeper than “Security Overview”)

### **Add:**

* Multi-tenant architecture explanation  
* Role hierarchy  
* Environment separation (dev / staging / prod)  
* Deployment safety (sandbox mention)  
* Governance controls

---

## **🤝 G. Support & SLA Page**

### **Include:**

* Support channels  
* Response time expectations  
* Enterprise support tiers  
* Onboarding assistance

---

## **⚙️ H. robots.txt**

Simple but required:

User-agent: \*  
Allow: /  
Disallow: /api/  
Disallow: /internal/

---

## **📡 I. System Status Page**

Even if basic:

* Uptime indicator  
* Incident history  
* Maintenance notices

👉 This screams enterprise readiness

---

# **🧠 3\. “WHAT TO EXPECT” PAGE (HIGHLY RECOMMENDED)**

This is underrated but powerful.

### **Title:**

**What to Expect from BrewAssist**

### **Content:**

* Guided workflows (not empty screens)  
* AI-assisted execution  
* Transparent logs  
* Learning curve expectations  
* Best practices

👉 This reduces churn massively

---

# **🔥 4\. HOW THIS ALL CONNECTS (IMPORTANT)**

Your footer isn’t just links — it’s:

**Trust architecture**

When enterprise users scroll down, they should feel:

* This is real  
* This is safe  
* This is structured  
* This is not a toy

---

# **🧭 5\. FINAL STRUCTURE MAP**

/legal  
  /terms  
  /privacy  
  /data-collection  
  /accessibility  
  /security  
  /compliance

/support  
  /support  
  /sla  
  /status

/technical  
  /api  
  /docs  
  /robots.txt

/product  
  /capabilities  
  /tui  
  /enterprise  
  /faq

---

# **🚀 WHERE YOU ARE NOW**

You now have:  
✅ Landing page  
✅ UI system  
✅ Positioning  
✅ Trust layer (this)

👉 Next logical step \= **monetization strategy**

---

# **💰 NEXT: PRICING (THIS IS BIG)**

When we do pricing, we’ll define:

* Free vs Pro vs Enterprise  
* Vibe coding vs Team workflows  
* Usage-based vs seat-based  
* AI cost control model  
* Dev vs Enterprise packaging

---

When you're ready, say:  
👉 **“map pricing”**

…and I’ll design:

* pricing tiers  
* feature gating  
* enterprise upsell strategy  
* and how to make it feel premium (not cheap SaaS)

This is where BrewAssist becomes a business.

# Pricing Discussion

Short answer:  
👉 Yes, allow BYO APIs  
👉 Yes, still charge for BrewAssist itself  
👉 Yes, you must track everything (very carefully)

But the way you structure this is what determines whether you build a toy tool vs a real platform business.

Let’s break it down cleanly.

\---

🧠 1\. THE CORE DECISION

You’re not selling:

\> API access

You’re selling:

\> The BrewAssist Operating Layer

That means:

Layer	Who owns cost

BrewAssist platform	YOU charge for  
AI APIs (OpenAI, etc.)	Either YOU or USER  
Infra execution	Depends on tier

\---

⚖️ 2\. SHOULD USERS BRING THEIR OWN API KEYS?

✅ YES — 100%

This is actually critical for enterprise adoption.

Why:

Enterprises already have vendor contracts

They want cost control

They want data ownership

They don’t want markup on tokens

👉 If you don’t allow this, you lose serious buyers.

\---

🔥 BUT HERE’S THE IMPORTANT PART

Allowing BYO APIs does NOT mean free usage.

Because:

\> BrewAssist is NOT the API — it’s the intelligence \+ orchestration layer

\---

💰 3\. HOW YOU STILL MAKE MONEY (CORE MODEL)

🧱 Your monetization is based on:

1\. Platform Access (Primary Revenue)

You charge for:

UI cockpit

Toolbelt system

TUI mode

Memory (BrewLast)

Truth engine

Workflow orchestration

👉 This is your subscription base

\---

2\. Execution Layer (Optional Metering)

You can charge for:

Task runs

Automation flows

Agent executions

Sandbox usage

\---

3\. Managed AI (Optional Upsell)

For users who don’t bring keys:

You provide API access

You mark up usage

👉 This becomes high-margin revenue

\---

🧬 4\. YOUR BUSINESS MODEL (THIS IS THE SWEET SPOT)

🔥 Hybrid Model (BEST)

Mode	Description

Managed AI	You provide APIs → you bill usage  
BYO AI	User provides keys → you charge platform fee

\---

💡 Think of it like:

Vercel → charges for platform \+ usage

Datadog → charges for observability layer

Retool → charges for builder platform

👉 They don’t own the underlying infra fully —  
they monetize the experience \+ control layer

\---

🧠 5\. WHAT YOU MUST TRACK (VERY IMPORTANT)

You were right — tracking is non-negotiable.

You need to track:

🔹 API Usage (even if BYO)

Calls made

Tokens used (if possible)

Model used

🔹 Platform Usage

Commands executed

Workflows run

Sessions

Active users

🔹 Toolbelt Execution

What tools were triggered

Duration

Success/failure

\---

⚠️ Why tracking matters:

Billing

Abuse prevention

Debugging

Enterprise reporting

Future pricing evolution

\---

🔐 6\. ENTERPRISE EXPECTATION (CRITICAL INSIGHT)

Enterprise customers will ask:

\> “If we bring our own API keys… what are we paying you for?”

Your answer must be:

\> “You’re paying for orchestration, governance, and intelligence — not raw compute.”

\---

🧠 7\. HOW TO POSITION THIS (IMPORTANT FOR LANDING PAGE)

Add a section like:

Flexible AI Usage

Bring your own API keys

Or use BrewAssist-managed AI

Full visibility and control

No hidden usage

👉 This builds trust immediately

\---

🧱 8\. PRICING FOUNDATION (PREVIEW)

This leads directly into pricing tiers like:

🟢 Starter

BrewAssist platform

Limited usage

Managed AI only

🔵 Pro

BYO APIs allowed

Higher limits

TUI mode unlocked

🟣 Enterprise

Full BYO

RBAC, RLS

Audit logs

SLA

Custom pricing

\---

🔥 9\. KEY STRATEGIC RULE

\> Never rely ONLY on API markup for revenue

Because:

Users will bypass you

Margins fluctuate

Costs are unpredictable

👉 Your real product is:

\> Control \+ workflow \+ intelligence

\---

🧭 FINAL TAKE

You’re building something closer to:

\> An AI DevOps platform (like an OS layer)

So:

APIs \= fuel

BrewAssist \= engine

You charge for the engine.

\---

🚀 NEXT STEP

Say: 👉 “map pricing tiers”

And I’ll design:

exact pricing plans

feature gating

limits (tokens, runs, seats)

enterprise upsell strategy

That’s where this becomes a real revenue machine.

# Pricing Architecture

Alright — now we design this like a real revenue engine, not just “pricing plans.”

This will be structured so BrewAssist can:

scale from solo dev → startup → enterprise

monetize both platform value \+ usage

support BYO APIs \+ managed AI

feel premium (not cheap SaaS clutter)

\---

💰 BREWASSIST PRICING ARCHITECTURE

🧠 Core Principle

\> You charge for control, orchestration, and velocity  
NOT just API usage

\---

🧱 1\. PRICING MODEL (FOUNDATION)

Hybrid SaaS Model:

Component	Pricing Type

Platform access	Subscription (per seat or workspace)  
AI usage (optional)	Usage-based  
Execution / workflows	Tier-limited or metered  
Enterprise features	Contract pricing

\---

🪜 2\. PRICING TIERS (FINAL STRUCTURE)

🟢 Starter — “Get in the cockpit”

💰 $19–$29/month

Target:

solo devs

indie builders

vibe coders

Includes:

BrewAssist cockpit (core UI)

Managed AI only (no BYO yet)

Limited command runs (e.g. 200/month)

Basic workflows

Basic TUI preview (limited)

Community support

Limits:

No RBAC

No RLS

No audit logs

No team features

👉 Goal: hook users fast

\---

🔵 Pro — “Build seriously”

💰 $49–$79/month

Target:

serious devs

small teams

power users

Includes:

Everything in Starter

✅ BYO API keys

Full TUI mode

Higher command limits (1k–5k/month)

Workflow automation

File \+ task orchestration

Priority support

Adds:

Basic usage analytics

Workspace persistence

👉 This is your core revenue tier

\---

🟣 Team — “Operate together”

💰 $99–$149/user/month

Target:

startups

dev teams

internal platforms

Includes:

Multi-user workspace

✅ RBAC (roles)

Shared workflows

Team-level usage tracking

Collaboration layer

Audit logs (basic)

Adds:

Integration hooks

Team onboarding flows

👉 This is where BrewAssist becomes sticky

\---

🟡 Enterprise — “Control everything”

💰 Custom pricing (high margin)

Target:

enterprises

platform teams

regulated orgs

Includes:

🔐 Security

RLS (row-level security)

Advanced RBAC

SSO / SAML

Audit trails

🧠 Governance

Policy enforcement

Environment separation (dev/staging/prod)

Access control layers

⚙️ Ops

SLA (uptime guarantees)

Dedicated support

Onboarding assistance

🔌 Flexibility

Full BYO APIs

Private deployments (future)

Custom integrations

👉 This is your big money tier

\---

⚡ 3\. USAGE-BASED ADD-ONS (IMPORTANT)

🔥 Managed AI Usage

If users don’t bring keys:

Usage	Price

GPT / LLM tokens	Markup (20–50%)  
Image / generation	Per request  
Heavy workflows	Metered

\---

⚙️ Execution Units (Optional Future)

Charge for:

automation runs

agent tasks

pipeline executions

👉 This becomes your Datadog-style scaling revenue

\---

🧠 4\. FEATURE GATING (CRITICAL STRATEGY)

Lock THESE behind Pro+:

BYO API keys

Full TUI mode

Workflow automation

\---

Lock THESE behind Team:

Collaboration

RBAC

Shared workspaces

\---

Lock THESE behind Enterprise:

RLS

SSO

Audit logs (full)

SLA

\---

🧬 5\. POSITIONING (HOW USERS UNDERSTAND PRICING)

Instead of:

❌ “Basic / Pro / Premium”

Use:

Tier	Meaning

Starter	Explore  
Pro	Build  
Team	Operate  
Enterprise	Govern

\---

🔥 6\. PRICING PAGE STRUCTURE (WHEN WE BUILD IT)

Sections:

1\. Hero

\> “Flexible pricing for builders and enterprises”

\---

2\. Tier Cards (4 columns)

clear features

clear limits

CTA buttons

\---

3\. “AI Usage Options”

Explain:

Managed vs BYO

Transparency

No hidden fees

\---

4\. “What You’re Paying For”

Explain value:

orchestration

control

velocity

\---

5\. Enterprise CTA

\> “Talk to Sales”

\---

⚠️ 7\. CRITICAL MISTAKES TO AVOID

❌ Only charging for API usage  
❌ Letting BYO users use platform free  
❌ Overcomplicated pricing  
❌ No usage visibility

\---

🧠 8\. YOUR REAL REVENUE ENGINE

You’re building:

\> BrewAssist \= AI DevOps Operating System

So revenue comes from:

seats (predictable)

usage (scalable)

enterprise deals (big jumps)

\---

🚀 WHERE YOU ARE NOW

You now have:

✅ Landing page  
✅ TUI differentiation  
✅ Enterprise positioning  
✅ Legal \+ trust layer  
✅ Pricing strategy

\---

🔥 NEXT MOVE (HIGH IMPACT)

Say: 👉 “build pricing page”

And I’ll:

design UI to match your landing page

add conversion psychology

structure tier cards cleanly

integrate with your current codebase

\---

You’re not just building a tool anymore…

You’re designing a platform people can actually pay for.

# Defined Pricing

🔥 This is exactly the direction you want.

Now let’s break down your key question about pricing ranges vs fixed pricing, because this is where a lot of products either feel premium or confusing.

\---

🧠 FIRST — WHAT YOU’RE SEEING IN THE MOCK

You now have:

✅ Tier cards with ranges

Starter: $19–$29

Pro: $49–$79

Team: $99–$149

✅ Clear separation:

Managed AI vs BYO AI

Platform value vs usage value

✅ Enterprise feel

Clean

Structured

Not “cheap SaaS clutter”

\---

⚖️ NOW — YOUR BIG QUESTION

\> Should pricing be ranges (flexible) or fixed (simple)?

\---

🧬 OPTION 1 — RANGE PRICING (WHAT YOU’RE LEANING TOWARD)

✅ Pros:

Feels customizable

Matches enterprise thinking

Lets you scale within a tier

Easier upsells without tier jump

❌ Cons:

Can confuse users

Slows conversion (too many choices)

People ask: “what do I actually pay?”

\---

🧠 When ranges work BEST:

👉 When tied to something clear:

Example:

Pro — $49–$79

$49 → solo

$79 → higher usage / more workflows

OR

$49 → base

\+$10 → extra usage pack

\+$20 → advanced features

👉 The key is:

\> Range must map to something tangible

\---

🧱 OPTION 2 — FIXED PRICING (SIMPLER)

✅ Pros:

Fast decision making

Higher conversion

Cleaner UI

Familiar SaaS model

❌ Cons:

Less flexible

Harder to upsell inside tier

\---

🔥 WHAT I RECOMMEND (BEST OF BOTH)

🧠 HYBRID MODEL (THIS IS THE WINNER)

Show:

✅ Fixed Starting Price

➕ “Scales with usage”

\---

💡 Example (THIS IS CLEAN):

🟢 Starter

$19/month

\> usage upgrades available

\---

🔵 Pro

Starts at $49/month

\> scales with workflows & usage

\---

🟣 Team

Starts at $99/user/month

\> expands with seats & integrations

\---

🟡 Enterprise

Custom

\---

🧠 Why this wins:

✅ Clear entry point (no confusion)

✅ Keeps flexibility

✅ Supports upsells

✅ Feels enterprise-ready

\---

💰 HOW YOU MAP THE RANGE INTERNALLY

You don’t expose complexity upfront.

You map it like:

Tier	Base	Scales With

Starter	$19	commands  
Pro	$49	workflows \+ TUI usage  
Team	$99	users \+ activity  
Enterprise	custom	everything

\---

🧠 UI IMPROVEMENT (NEXT ITERATION)

Instead of:

❌ $49–$79

Do:

✅

$49/month  
Scales with usage

\---

🔥 ADD THIS SECTION (IMPORTANT)

“Flexible Pricing That Grows With You”

Start simple

Expand as you use more

No forced upgrades too early

\---

🚀 FINAL STRATEGIC DECISION

👉 Use:

✅ Fixed starting prices (front-facing)  
✅ Ranges internally (billing logic)

\---

🧭 WHERE YOU ARE NOW

You now have:

✅ Landing page  
✅ TUI differentiation  
✅ Enterprise trust layer  
✅ Legal structure  
✅ Pricing strategy  
✅ Pricing mock

\---

🔥 NEXT MOVE

Say: 👉 “build pricing page into code”

And I’ll:

integrate this into your existing landing page

match your BrewAssist UI system

add toggle (monthly/yearly)

structure pricing cards cleanly

prepare it for real billing logic later

\---

You’re officially designing something that can sell and scale now.

# Pricing Code \+ Landing Page

import React, { useMemo, useState } from "react";  
import { motion } from "framer-motion";  
import {  
  ShieldCheck,  
  TerminalSquare,  
  Wand2,  
  Lock,  
  KeyRound,  
  Fingerprint,  
  Workflow,  
  Sparkles,  
  Bot,  
  ChevronDown,  
  CheckCircle2,  
  ServerCog,  
  FileCode2,  
  Users,  
  LifeBuoy,  
  ClipboardCheck,  
  Globe,  
  Rocket,  
} from "lucide-react";

const faqs \= \[  
  {  
    q: "What is BrewAssist?",  
    a: "BrewAssist is an AI-native DevOps cockpit designed to help teams move from prompt to plan to execution with a guided interface, terminal-aware workflows, and enterprise controls.",  
  },  
  {  
    q: "What makes BrewAssist different from a chatbot?",  
    a: "It is positioned as a working cockpit, not just a chat window. It combines guided workflows, TUI-inspired interaction, execution surfaces, support flows, onboarding, and enterprise governance patterns in one product experience.",  
  },  
  {  
    q: "Is BrewAssist enterprise ready?",  
    a: "Yes. The landing page is framed around enterprise expectations including RLS, RBAC, auditability, secure auth patterns, accessibility expectations, onboarding flows, and compliance-conscious architecture.",  
  },  
  {  
    q: "Does BrewAssist support terminal-first users?",  
    a: "Yes. The TUI section positions BrewAssist for keyboard-driven builders who want a terminal-native feel with AI assistance, fast command flows, and execution visibility.",  
  },  
  {  
    q: "What support should users expect?",  
    a: "Users should expect guided onboarding, in-product help, clear workflow explanations, support surfaces, and a product experience that explains what to do next instead of dropping them into a blank system.",  
  },  
  {  
    q: "Can BrewAssist fit into existing stacks?",  
    a: "The page is designed to position BrewAssist as integration-friendly for modern app and platform teams using APIs, automation, cloud infrastructure, and controlled deployment pipelines.",  
  },  
\];

const capabilityCards \= \[  
  {  
    icon: Wand2,  
    title: "Vibe Coding Ready",  
    body: "Move from idea to implementation quickly with AI-guided workflows, fast iteration loops, and a product experience built for momentum.",  
  },  
  {  
    icon: TerminalSquare,  
    title: "TUI-Inspired Workflows",  
    body: "Give technical users a terminal-native feel with command-focused interaction, hotkeys, stream-like output surfaces, and lower friction execution.",  
  },  
  {  
    icon: ShieldCheck,  
    title: "Enterprise Ready",  
    body: "Position BrewAssist for serious teams with security architecture, policy-aware execution, onboarding, governance, and operational trust.",  
  },  
  {  
    icon: Bot,  
    title: "AI-Native Cockpit",  
    body: "Not just a chat layer. BrewAssist is presented as a command center for planning, execution, visibility, support, and intelligent assistance.",  
  },  
\];

const pricingTiers \= \[  
  {  
    name: "Starter",  
    price: "$19",  
    note: "Scales to $29 with usage",  
    cta: "Get Started",  
    accent: "from-emerald-300/20 to-cyan-300/10",  
    border: "border-emerald-300/20",  
    points: \[  
      "Core BrewAssist cockpit",  
      "Managed AI usage",  
      "Basic TUI preview",  
      "Guided onboarding",  
      "Community support",  
    \],  
  },  
  {  
    name: "Pro",  
    price: "$49",  
    note: "Scales to $79 with workflows and usage",  
    cta: "Upgrade to Pro",  
    accent: "from-amber-300/20 to-yellow-200/10",  
    border: "border-amber-300/25",  
    featured: true,  
    points: \[  
      "Everything in Starter",  
      "Bring your own API keys",  
      "Full TUI mode access",  
      "Workflow automation",  
      "Priority support",  
    \],  
  },  
  {  
    name: "Team",  
    price: "$99",  
    note: "Starts per user, expands with seats and activity",  
    cta: "Talk Team Plans",  
    accent: "from-cyan-300/20 to-emerald-300/10",  
    border: "border-cyan-300/20",  
    points: \[  
      "Multi-user workspaces",  
      "RBAC controls",  
      "Shared workflows",  
      "Basic audit visibility",  
      "Integration hooks",  
    \],  
  },  
  {  
    name: "Enterprise",  
    price: "Custom",  
    note: "Built for governance, scale, and advanced controls",  
    cta: "Contact Sales",  
    accent: "from-white/10 to-amber-300/10",  
    border: "border-white/15",  
    points: \[  
      "Advanced RLS and RBAC posture",  
      "SSO / SAML alignment",  
      "Audit trails and governance",  
      "Dedicated onboarding",  
      "SLA and support design",  
    \],  
  },  
\];

const securityItems \= \[  
  {  
    icon: Lock,  
    title: "Row-Level Security",  
    text: "Fine-grained tenant and user data isolation for sensitive workloads and controlled access patterns.",  
  },  
  {  
    icon: Fingerprint,  
    title: "RBAC",  
    text: "Role-based permissions for admins, operators, contributors, and viewers so the right people can access the right tools.",  
  },  
  {  
    icon: KeyRound,  
    title: "Secure Auth",  
    text: "OAuth, modern session flows, and enterprise-ready identity patterns designed for scalable environments.",  
  },  
  {  
    icon: ClipboardCheck,  
    title: "Auditability",  
    text: "Activity visibility, workflow traceability, and review-friendly operational patterns for high-trust teams.",  
  },  
\];

const footerGroups \= \[  
  {  
    title: "Product",  
    links: \["Capabilities", "TUI Mode", "Enterprise", "FAQ", "Support"\],  
  },  
  {  
    title: "Trust",  
    links: \["Security", "Accessibility", "Privacy", "Terms & Conditions", "Data Collection"\],  
  },  
  {  
    title: "Technical",  
    links: \["robots.txt", "Status", "API", "Documentation", "Onboarding"\],  
  },  
  {  
    title: "Company",  
    links: \["About", "Contact", "Partnerships", "Demo", "Sales"\],  
  },  
\];

function SectionEyebrow({ children }: { children: React.ReactNode }) {  
  return (  
    \<div className="inline-flex items-center rounded-full border border-amber-400/20 bg-white/5 px-3 py-1 text-\[11px\] uppercase tracking-\[0.22em\] text-amber-300"\>  
      {children}  
    \</div\>  
  );  
}

function Card({ children, className \= "" }: { children: React.ReactNode; className?: string }) {  
  return (  
    \<div className={\`rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl ${className}\`}\>  
      {children}  
    \</div\>  
  );  
}

function StatPill({ children }: { children: React.ReactNode }) {  
  return (  
    \<div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200"\>  
      {children}  
    \</div\>  
  );  
}

function FaqItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () \=\> void }) {  
  return (  
    \<div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"\>  
      \<button  
        onClick={onClick}  
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"  
      \>  
        \<span className="text-base font-medium text-white"\>{q}\</span\>  
        \<ChevronDown className={\`h-5 w-5 shrink-0 text-amber-300 transition-transform ${open ? "rotate-180" : ""}\`} /\>  
      \</button\>  
      {open && \<div className="px-5 pb-5 text-sm leading-7 text-zinc-300"\>{a}\</div\>}  
    \</div\>  
  );  
}

export default function BrewAssistLandingPage() {  
  const \[openFaq, setOpenFaq\] \= useState\<number\>(0);  
  const currentYear \= useMemo(() \=\> new Date().getFullYear(), \[\]);

  return (  
    \<div className="min-h-screen bg-\[\#050505\] text-white"\>  
      \<div className="pointer-events-none fixed inset-0 overflow-hidden"\>  
        \<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_top,\_rgba(16,185,129,0.14),transparent\_30%),radial-gradient(circle\_at\_80%\_15%,rgba(245,158,11,0.14),transparent\_24%),radial-gradient(circle\_at\_50%\_100%,rgba(8,145,178,0.14),transparent\_30%)\]" /\>  
        \<div className="absolute inset-0 opacity-\[0.08\] \[background-image:linear-gradient(rgba(255,255,255,.15)\_1px,transparent\_1px),linear-gradient(90deg,rgba(255,255,255,.15)\_1px,transparent\_1px)\] \[background-size:72px\_72px\]" /\>  
      \</div\>

      \<header className="sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl"\>  
        \<div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"\>  
          \<div className="flex items-center gap-3"\>  
            \<div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-300/15 to-emerald-300/10 text-amber-300 shadow-lg shadow-amber-500/10"\>  
              \<Bot className="h-5 w-5" /\>  
            \</div\>  
            \<div\>  
              \<div className="text-lg font-semibold tracking-wide"\>BrewAssist\</div\>  
              \<div className="text-xs uppercase tracking-\[0.25em\] text-zinc-400"\>DevOps Cockpit\</div\>  
            \</div\>  
          \</div\>

          \<nav className="hidden items-center gap-8 text-sm text-zinc-300 lg:flex"\>  
            \<a href="\#capabilities" className="transition hover:text-white"\>Capabilities\</a\>  
            \<a href="\#tui" className="transition hover:text-white"\>TUI Mode\</a\>  
            \<a href="\#security" className="transition hover:text-white"\>Security\</a\>  
            \<a href="\#pricing" className="transition hover:text-white"\>Pricing\</a\>  
            \<a href="\#faq" className="transition hover:text-white"\>FAQ\</a\>  
          \</nav\>

          \<div className="flex items-center gap-3"\>  
            \<button className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/30 hover:bg-white/5 md:block"\>  
              Request Demo  
            \</button\>  
            \<button className="rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition hover:scale-\[1.02\]"\>  
              Launch BrewAssist  
            \</button\>  
          \</div\>  
        \</div\>  
      \</header\>

      \<main className="relative"\>  
        \<section className="mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-14 lg:grid-cols-\[1.05fr\_.95fr\] lg:px-8 lg:pb-28 lg:pt-20"\>  
          \<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}\>  
            \<SectionEyebrow\>Vibe Coding Meets Enterprise DevOps\</SectionEyebrow\>  
            \<h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-\[1.02\] tracking-tight text-white md:text-6xl xl:text-7xl"\>  
              BrewAssist is \<span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent"\>vibe coding ready\</span\> and \<span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent"\>enterprise ready\</span\>.  
            \</h1\>  
            \<p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300"\>  
              Build, orchestrate, and support modern software delivery with an AI-native DevOps cockpit designed for fast-moving builders and serious enterprise teams.  
            \</p\>

            \<div className="mt-8 flex flex-wrap gap-3"\>  
              \<StatPill\>AI-native execution\</StatPill\>  
              \<StatPill\>TUI-inspired workflows\</StatPill\>  
              \<StatPill\>Security-first posture\</StatPill\>  
              \<StatPill\>Enterprise onboarding\</StatPill\>  
            \</div\>

            \<div className="mt-10 flex flex-col gap-4 sm:flex-row"\>  
              \<button className="rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-4 text-base font-semibold text-black shadow-xl shadow-emerald-500/20 transition hover:scale-\[1.01\]"\>  
                Launch BrewAssist  
              \</button\>  
              \<button className="rounded-2xl border border-amber-300/25 bg-amber-300/8 px-6 py-4 text-base font-semibold text-amber-200 transition hover:bg-amber-300/12"\>  
                Request Enterprise Demo  
              \</button\>  
            \</div\>

            \<div className="mt-10 grid gap-4 sm:grid-cols-3"\>  
              {\[  
                \[Workflow, "Unified cockpit", "Coding, automation, support, and operational visibility in one flow."\],  
                \[ShieldCheck, "Trust architecture", "Positioned around RLS, RBAC, auditability, and secure access patterns."\],  
                \[Rocket, "Built to scale", "Crafted for solo momentum, team adoption, and enterprise deployment narratives."\],  
              \].map((\[Icon, title, body\], index) \=\> {  
                const Cmp \= Icon as React.ComponentType\<any\>;  
                return (  
                  \<Card key={index} className="p-5"\>  
                    \<Cmp className="h-5 w-5 text-amber-300" /\>  
                    \<div className="mt-3 text-sm font-semibold text-white"\>{title as string}\</div\>  
                    \<div className="mt-2 text-sm leading-6 text-zinc-400"\>{body as string}\</div\>  
                  \</Card\>  
                );  
              })}  
            \</div\>  
          \</motion.div\>

          \<motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, delay: 0.08 }}\>  
            \<Card className="relative overflow-hidden p-4 md:p-5"\>  
              \<div className="absolute inset-0 bg-\[radial-gradient(circle\_at\_20%\_15%,rgba(16,185,129,.22),transparent\_22%),radial-gradient(circle\_at\_85%\_25%,rgba(251,191,36,.18),transparent\_24%)\]" /\>  
              \<div className="relative rounded-\[26px\] border border-white/10 bg-\[\#0b0b0b\]/90 p-4"\>  
                \<div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4"\>  
                  \<div\>  
                    \<div className="text-xs uppercase tracking-\[0.28em\] text-zinc-500"\>Hero Preview\</div\>  
                    \<div className="mt-1 text-lg font-semibold"\>BrewAssist DevOps Cockpit\</div\>  
                  \</div\>  
                  \<div className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-\[0.22em\] text-emerald-200"\>  
                    Live concept  
                  \</div\>  
                \</div\>

                \<div className="grid gap-4 lg:grid-cols-\[1fr\_1.2fr\]"\>  
                  \<div className="rounded-3xl border border-white/10 bg-black/40 p-5"\>  
                    \<div className="text-xs uppercase tracking-\[0.25em\] text-zinc-500"\>Brand Positioning\</div\>  
                    \<div className="mt-4 text-3xl font-semibold leading-tight"\>  
                      \<span className="text-emerald-300"\>BrewAssist\</span\>  
                      \<span className="text-zinc-300"\> x \</span\>  
                      \<span className="text-amber-300"\>Enterprise\</span\>  
                    \</div\>  
                    \<div className="mt-4 space-y-3 text-sm leading-6 text-zinc-400"\>  
                      \<div className="flex gap-3"\>\<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /\>TUI-inspired product surface\</div\>  
                      \<div className="flex gap-3"\>\<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /\>Security and compliance narrative\</div\>  
                      \<div className="flex gap-3"\>\<CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" /\>Support, onboarding, FAQ, and legal trust footer\</div\>  
                    \</div\>  
                  \</div\>

                  \<div className="rounded-3xl border border-amber-300/15 bg-gradient-to-br from-\[\#0b1113\] to-\[\#090909\] p-4 shadow-\[0\_0\_60px\_rgba(251,191,36,0.08)\]"\>  
                    \<div className="mb-3 flex items-center justify-between text-xs text-zinc-400"\>  
                      \<div className="flex gap-2"\>  
                        \<span className="h-2.5 w-2.5 rounded-full bg-red-400/70" /\>  
                        \<span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /\>  
                        \<span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" /\>  
                      \</div\>  
                      \<span className="uppercase tracking-\[0.24em\]"\>Cockpit View\</span\>  
                    \</div\>  
                    \<div className="grid min-h-\[360px\] grid-cols-\[88px\_1fr\_180px\] gap-3 rounded-\[22px\] border border-white/10 bg-black/60 p-3"\>  
                      \<div className="rounded-2xl border border-white/10 bg-white/5 p-3"\>  
                        \<div className="text-\[10px\] uppercase tracking-\[0.22em\] text-zinc-500"\>Tools\</div\>  
                        \<div className="mt-3 space-y-2"\>  
                          {\[  
                            "Assist",  
                            "Agent",  
                            "Loop",  
                            "Files",  
                            "Tasks",  
                            "Audit",  
                          \].map((item) \=\> (  
                            \<div key={item} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-zinc-300"\>  
                              {item}  
                            \</div\>  
                          ))}  
                        \</div\>  
                      \</div\>  
                      \<div className="rounded-2xl border border-white/10 bg-white/5 p-3"\>  
                        \<div className="flex items-center justify-between"\>  
                          \<div className="text-\[10px\] uppercase tracking-\[0.22em\] text-zinc-500"\>Command Stream\</div\>  
                          \<div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-\[10px\] uppercase tracking-\[0.2em\] text-cyan-200"\>  
                            TUI flow  
                          \</div\>  
                        \</div\>  
                        \<div className="mt-3 space-y-3"\>  
                          \<div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-sm text-cyan-100"\>  
                            Analyze deployment workflow and suggest safer release path.  
                          \</div\>  
                          \<div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3 text-sm text-amber-100"\>  
                            Plan generated. RLS, RBAC, audit logging, and access guardrails included.  
                          \</div\>  
                          \<div className="rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-300"\>  
                            Next: run onboarding, confirm team roles, and activate support guidance.  
                          \</div\>  
                        \</div\>  
                        \<div className="mt-4 rounded-2xl border border-white/10 bg-black/50 px-3 py-3 text-sm text-zinc-500"\>  
                          brewassist$ /init enterprise workspace  
                        \</div\>  
                      \</div\>  
                      \<div className="rounded-2xl border border-white/10 bg-white/5 p-3"\>  
                        \<div className="text-\[10px\] uppercase tracking-\[0.22em\] text-zinc-500"\>Workspace\</div\>  
                        \<div className="mt-3 space-y-2 text-xs text-zinc-300"\>  
                          {\[  
                            "Security",  
                            "Compliance",  
                            "Onboarding",  
                            "FAQ",  
                            "Support",  
                            "Logs",  
                            "Legal",  
                          \].map((item) \=\> (  
                            \<div key={item} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2"\>  
                              {item}  
                            \</div\>  
                          ))}  
                        \</div\>  
                      \</div\>  
                    \</div\>  
                  \</div\>  
                \</div\>  
              \</div\>  
            \</Card\>  
          \</motion.div\>  
        \</section\>

        \<section id="capabilities" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="max-w-3xl"\>  
            \<SectionEyebrow\>Capabilities\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl"\>  
              Informative by design. Powerful by expectation.  
            \</h2\>  
            \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
              The page is built to explain what BrewAssist is, what users should expect, and why it belongs in both fast-moving developer environments and enterprise delivery organizations.  
            \</p\>  
          \</div\>

          \<div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4"\>  
            {capabilityCards.map((card) \=\> {  
              const Icon \= card.icon;  
              return (  
                \<Card key={card.title} className="p-6"\>  
                  \<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300/20 to-amber-300/15 text-amber-200"\>  
                    \<Icon className="h-5 w-5" /\>  
                  \</div\>  
                  \<div className="mt-5 text-xl font-semibold text-white"\>{card.title}\</div\>  
                  \<p className="mt-3 text-sm leading-7 text-zinc-400"\>{card.body}\</p\>  
                \</Card\>  
              );  
            })}  
          \</div\>  
        \</section\>

        \<section id="tui" className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-\[1fr\_1.05fr\] lg:px-8"\>  
          \<div\>  
            \<SectionEyebrow\>TUI Mode\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
              Terminal-driven intelligence for builders who move fast.  
            \</h2\>  
            \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
              BrewAssist TUI Mode gives the product a command-focused edge: terminal-native energy, keyboard-first speed, and a developer experience that feels serious without losing clarity.  
            \</p\>  
            \<div className="mt-8 grid gap-4 sm:grid-cols-2"\>  
              {\[  
                \[TerminalSquare, "Command-first workflows"\],  
                \[Sparkles, "AI-assisted execution"\],  
                \[FileCode2, "Inline context awareness"\],  
                \[ServerCog, "Streaming operational feedback"\],  
              \].map((\[Icon, label\]) \=\> {  
                const Cmp \= Icon as React.ComponentType\<any\>;  
                return (  
                  \<div key={label as string} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-zinc-200"\>  
                    \<Cmp className="h-5 w-5 text-emerald-300" /\>  
                    \<span\>{label as string}\</span\>  
                  \</div\>  
                );  
              })}  
            \</div\>  
          \</div\>

          \<Card className="overflow-hidden p-4"\>  
            \<div className="rounded-\[24px\] border border-emerald-300/15 bg-\[\#071012\] p-4 shadow-\[0\_0\_50px\_rgba(16,185,129,0.10)\]"\>  
              \<div className="mb-4 flex items-center justify-between"\>  
                \<div className="text-sm font-medium text-emerald-200"\>BrewAssist TUI Preview\</div\>  
                \<div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-\[10px\] uppercase tracking-\[0.22em\] text-emerald-200"\>  
                  Keyboard ready  
                \</div\>  
              \</div\>  
              \<div className="rounded-\[20px\] border border-white/10 bg-black p-4 font-mono text-sm leading-7 text-emerald-200"\>  
                \<div className="text-zinc-500"\>brewassist$ status \--project brewassist\</div\>  
                \<div className="mt-2 text-zinc-300"\>project: brewassist\</div\>  
                \<div className="text-zinc-300"\>mode: enterprise\</div\>  
                \<div className="text-zinc-300"\>security: rls \+ rbac enabled\</div\>  
                \<div className="text-zinc-300"\>support: onboarding \+ faq \+ guidance online\</div\>  
                \<div className="mt-4 text-zinc-500"\>brewassist$ explain deployment posture\</div\>  
                \<div className="mt-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/10 px-4 py-3 text-emerald-100"\>  
                  BrewAssist is positioned to help teams build faster while preserving enterprise trust through controlled access, observability, and workflow guidance.  
                \</div\>  
                \<div className="mt-4 text-zinc-500"\>brewassist$ /help onboarding\</div\>  
                \<div className="mt-2 text-amber-200"\>→ Guided onboarding available\</div\>  
                \<div className="text-amber-200"\>→ Workspace expectations available\</div\>  
                \<div className="text-amber-200"\>→ Support and legal footer linked\</div\>  
              \</div\>  
            \</div\>  
          \</Card\>  
        \</section\>

        \<section id="security" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="grid gap-8 lg:grid-cols-\[.9fr\_1.1fr\]"\>  
            \<div\>  
              \<SectionEyebrow\>Enterprise Security & Compliance\</SectionEyebrow\>  
              \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
                Security posture that speaks enterprise fluently.  
              \</h2\>  
              \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
                BrewAssist is positioned with the language enterprise buyers expect: least privilege, role-aware access, protected workflows, and policy-aware operational design.  
              \</p\>  
              \<div className="mt-7 rounded-3xl border border-amber-300/15 bg-amber-300/8 p-5 text-sm leading-7 text-amber-100"\>  
                Positioning themes: row-level security, RBAC, auditability, secure authentication, accessibility expectations, testing discipline, and release-readiness confidence.  
              \</div\>  
            \</div\>

            \<div className="grid gap-4 md:grid-cols-2"\>  
              {securityItems.map((item) \=\> {  
                const Icon \= item.icon;  
                return (  
                  \<Card key={item.title} className="p-6"\>  
                    \<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/20 to-emerald-300/10 text-amber-200"\>  
                      \<Icon className="h-5 w-5" /\>  
                    \</div\>  
                    \<div className="mt-4 text-xl font-semibold text-white"\>{item.title}\</div\>  
                    \<p className="mt-3 text-sm leading-7 text-zinc-400"\>{item.text}\</p\>  
                  \</Card\>  
                );  
              })}  
            \</div\>  
          \</div\>  
        \</section\>

        \<section className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="grid gap-8 lg:grid-cols-\[1.05fr\_.95fr\]"\>  
            \<Card className="p-7 md:p-8"\>  
              \<SectionEyebrow\>How It Works\</SectionEyebrow\>  
              \<h3 className="mt-4 text-3xl font-semibold text-white"\>From idea to deployment in one continuous flow.\</h3\>  
              \<div className="mt-8 grid gap-4 md:grid-cols-2"\>  
                {\[  
                  \["01", "Type the command", "Start with intent, not friction. Prompt, task, or workflow request."\],  
                  \["02", "BrewAssist plans", "The system interprets the request and organizes the next best action."\],  
                  \["03", "Tooling executes", "The cockpit presents a guided execution model with visibility and structure."\],  
                  \["04", "Results return clearly", "Logs, guidance, next steps, and support surfaces help teams keep moving."\],  
                \].map((\[step, title, body\]) \=\> (  
                  \<div key={step as string} className="rounded-2xl border border-white/10 bg-white/5 p-5"\>  
                    \<div className="text-sm font-semibold text-amber-300"\>{step as string}\</div\>  
                    \<div className="mt-2 text-lg font-semibold text-white"\>{title as string}\</div\>  
                    \<div className="mt-2 text-sm leading-7 text-zinc-400"\>{body as string}\</div\>  
                  \</div\>  
                ))}  
              \</div\>  
            \</Card\>

            \<Card className="p-7 md:p-8"\>  
              \<SectionEyebrow\>Onboarding & Support\</SectionEyebrow\>  
              \<h3 className="mt-4 text-3xl font-semibold text-white"\>Tell users what to expect on day one.\</h3\>  
              \<div className="mt-6 space-y-4"\>  
                {\[  
                  \[Users, "Guided onboarding", "Clear setup expectations for individuals, teams, and enterprise workspaces."\],  
                  \[LifeBuoy, "Support surfaces", "In-product help, FAQ guidance, and expectation-setting instead of ambiguity."\],  
                  \[Globe, "Enterprise readiness narrative", "Explain security, compliance, legal links, and trust posture without burying it."\],  
                \].map((\[Icon, title, body\]) \=\> {  
                  const Cmp \= Icon as React.ComponentType\<any\>;  
                  return (  
                    \<div key={title as string} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"\>  
                      \<div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200"\>  
                        \<Cmp className="h-5 w-5" /\>  
                      \</div\>  
                      \<div\>  
                        \<div className="font-semibold text-white"\>{title as string}\</div\>  
                        \<div className="mt-1 text-sm leading-7 text-zinc-400"\>{body as string}\</div\>  
                      \</div\>  
                    \</div\>  
                  );  
                })}  
              \</div\>  
            \</Card\>  
          \</div\>  
        \</section\>

        \<section id="pricing" className="mx-auto max-w-7xl px-6 py-20 lg:px-8"\>  
          \<div className="text-center"\>  
            \<SectionEyebrow\>Pricing\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
              Flexible pricing for builders and enterprises.  
            \</h2\>  
            \<p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-zinc-300"\>  
              Show clear starting prices up front, then let usage and expansion scale naturally within each tier. That keeps the page simple while preserving room for real platform growth.  
            \</p\>  
          \</div\>

          \<div className="mt-8 flex items-center justify-center gap-3"\>  
            \<div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"\>Monthly\</div\>  
            \<div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-200"\>Yearly · Save 20%\</div\>  
          \</div\>

          \<div className="mt-10 grid gap-5 xl:grid-cols-4"\>  
            {pricingTiers.map((tier) \=\> (  
              \<Card  
                key={tier.name}  
                className={\`relative overflow-hidden p-6 ${tier.border} ${tier.featured ? "scale-\[1.01\] shadow-\[0\_0\_60px\_rgba(251,191,36,0.10)\]" : ""}\`}  
              \>  
                \<div className={\`absolute inset-x-0 top-0 h-24 bg-gradient-to-r ${tier.accent}\`} /\>  
                \<div className="relative"\>  
                  \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>{tier.name}\</div\>  
                  \<div className="mt-4 text-4xl font-semibold text-white"\>{tier.price}\</div\>  
                  \<div className="mt-1 text-sm text-zinc-400"\>{tier.price \=== "Custom" ? tier.note : \`per month · ${tier.note}\`}\</div\>  
                  \<div className="mt-6 space-y-3"\>  
                    {tier.points.map((point) \=\> (  
                      \<div key={point} className="flex gap-3 text-sm leading-7 text-zinc-300"\>  
                        \<CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-300" /\>  
                        \<span\>{point}\</span\>  
                      \</div\>  
                    ))}  
                  \</div\>  
                  \<button  
                    className={\`mt-8 w-full rounded-2xl px-5 py-3 text-sm font-semibold transition ${tier.featured ? "bg-gradient-to-r from-amber-300 to-yellow-200 text-black" : "border border-white/10 bg-white/5 text-white hover:bg-white/10"}\`}  
                  \>  
                    {tier.cta}  
                  \</button\>  
                \</div\>  
              \</Card\>  
            ))}  
          \</div\>

          \<div className="mt-10 grid gap-5 lg:grid-cols-2"\>  
            \<Card className="p-6"\>  
              \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Managed AI\</div\>  
              \<div className="mt-3 text-2xl font-semibold text-white"\>Use BrewAssist-managed AI and keep things simple.\</div\>  
              \<div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300"\>  
                \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /\>Simple billing experience\</div\>  
                \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /\>Transparent usage monitoring\</div\>  
                \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /\>Fast path for individuals and smaller teams\</div\>  
              \</div\>  
            \</Card\>  
            \<Card className="p-6"\>  
              \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Bring Your Own AI\</div\>  
              \<div className="mt-3 text-2xl font-semibold text-white"\>Bring your own API keys and still pay for the BrewAssist platform.\</div\>  
              \<div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300"\>  
                \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-amber-300" /\>Keep cost control with your provider relationships\</div\>  
                \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-amber-300" /\>Use BrewAssist for orchestration, workflows, and governance\</div\>  
                \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-amber-300" /\>Track usage, models, sessions, and execution patterns clearly\</div\>  
              \</div\>  
            \</Card\>  
          \</div\>  
        \</section\>

        \<section id="faq" className="mx-auto max-w-5xl px-6 py-20 lg:px-8"\>  
          \<div className="text-center"\>  
            \<SectionEyebrow\>Frequently Asked Questions\</SectionEyebrow\>  
            \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>Clarity builds trust.\</h2\>  
            \<p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-300"\>  
              A strong landing page answers the practical questions fast: what BrewAssist is, why it matters, how secure it is, and what adoption should look like.  
            \</p\>  
          \</div\>  
          \<div className="mt-10 space-y-4"\>  
            {faqs.map((item, index) \=\> (  
              \<FaqItem  
                key={item.q}  
                q={item.q}  
                a={item.a}  
                open={openFaq \=== index}  
                onClick={() \=\> setOpenFaq(openFaq \=== index ? \-1 : index)}  
              /\>  
            ))}  
          \</div\>  
        \</section\>

        \<section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8"\>  
          \<Card className="overflow-hidden p-8 md:p-10"\>  
            \<div className="grid gap-8 lg:grid-cols-\[1.1fr\_.9fr\] lg:items-center"\>  
              \<div\>  
                \<SectionEyebrow\>Final Call To Action\</SectionEyebrow\>  
                \<h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl"\>  
                  Build faster. Ship smarter. Think bigger.  
                \</h2\>  
                \<p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300"\>  
                  BrewAssist is positioned as the product layer between raw AI capability and real software delivery. It is made to feel exciting for builders and credible for enterprise buyers.  
                \</p\>  
              \</div\>  
              \<div className="flex flex-col gap-4 sm:flex-row lg:justify-end"\>  
                \<button className="rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-4 text-base font-semibold text-black shadow-xl shadow-emerald-500/20"\>  
                  Launch BrewAssist  
                \</button\>  
                \<button className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-6 py-4 text-base font-semibold text-amber-200"\>  
                  Request Enterprise Demo  
                \</button\>  
              \</div\>  
            \</div\>  
          \</Card\>  
        \</section\>  
      \</main\>

      \<footer className="border-t border-white/10 bg-black/70"\>  
        \<div className="mx-auto max-w-7xl px-6 py-14 lg:px-8"\>  
          \<div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5"\>  
            \<div className="xl:col-span-1"\>  
              \<div className="text-xl font-semibold"\>BrewAssist\</div\>  
              \<div className="mt-2 text-sm uppercase tracking-\[0.24em\] text-zinc-500"\>DevOps Cockpit\</div\>  
              \<p className="mt-4 text-sm leading-7 text-zinc-400"\>  
                Vibe coding ready. Enterprise ready. Built to explain, support, and accelerate modern software delivery.  
              \</p\>  
            \</div\>

            {footerGroups.map((group) \=\> (  
              \<div key={group.title}\>  
                \<div className="text-sm font-semibold uppercase tracking-\[0.22em\] text-zinc-300"\>{group.title}\</div\>  
                \<div className="mt-4 space-y-3 text-sm text-zinc-400"\>  
                  {group.links.map((link) \=\> (  
                    \<a key={link} href="\#" className="block transition hover:text-white"\>  
                      {link}  
                    \</a\>  
                  ))}  
                \</div\>  
              \</div\>  
            ))}  
          \</div\>

          \<div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between"\>  
            \<div\>© {currentYear} BrewAssist. All rights reserved.\</div\>  
            \<div className="flex flex-wrap gap-4"\>  
              \<span\>Accessibility\</span\>  
              \<span\>Terms & Conditions\</span\>  
              \<span\>Privacy\</span\>  
              \<span\>Data Collection\</span\>  
              \<span\>robots.txt\</span\>  
            \</div\>  
          \</div\>  
        \</div\>  
      \</footer\>  
    \</div\>  
  );  
}

# Core Principle

Perfect — now we move from **visual pricing → real monetization architecture**.

This is where BrewAssist becomes a **real revenue engine**, not just a UI.

---

# **🧠 CORE PRINCIPLE (LOCK THIS IN)**

You are NOT selling:

* tokens  
* models  
* API calls

👉 You are selling:

# **CONTROL \+ ORCHESTRATION \+ EXPERIENCE**

That’s why:

✅ BYO API is allowed  
✅ BUT platform fee ALWAYS applies

---

# **🧱 PRICING ENGINE (ACTUAL LOGIC)**

We’re going to break pricing into **3 layers**

---

# **🔹 1\. PLATFORM FEE (BASE — ALWAYS CHARGED)**

This is your SaaS revenue.

| Tier | Base Price | What it Covers |
| ----- | ----- | ----- |
| Starter | $19 | core UI \+ basic orchestration |
| Pro | $49 | workflows \+ TUI \+ routing |
| Team | $99/user | collaboration \+ RBAC |
| Enterprise | custom | governance \+ scale |

---

## **🧠 This pays for:**

* BrewAssist UI  
* TUI interface  
* workflow engine  
* audit tracking (later BrewPulse tie-in)  
* session management  
* orchestration logic

👉 **This is non-negotiable even with BYO API**

---

# **🔹 2\. USAGE LAYER (WHERE SCALING HAPPENS)**

This is where your “range pricing” actually lives.

---

## **⚙️ What you track:**

### **🧩 Core Units**

* commands executed  
* workflows triggered  
* TUI sessions  
* AI calls (if managed)

---

## **💡 Example Scaling (Pro Tier)**

| Usage | Price |
| ----- | ----- |
| Base (included) | $49 |
| \+ extra workflows | \+$10 |
| \+ high activity | \+$20 |
| Max range | $79 |

---

👉 That’s how:  
**$49 → $79 actually happens**

WITHOUT confusing UI

---

# **🔹 3\. AI COST LAYER (SPLIT MODEL — THIS IS 🔥)**

You support BOTH:

---

## **🟢 OPTION A — MANAGED AI**

User uses YOUR AI providers.

### **You:**

* pay provider  
* markup usage

### **Pricing:**

* included credits OR  
* pay-as-you-go

---

## **🟡 OPTION B — BYO API (IMPORTANT)**

User brings:

* OpenAI  
* Anthropic  
* etc.

---

## **BUT 👇 THIS IS KEY**

### **You STILL charge for:**

* orchestration  
* routing  
* logging  
* UI  
* TUI execution  
* workflows

---

👉 So:

“Using your own API removes AI cost, not platform cost.”

---

# **🧠 THIS IS YOUR POSITIONING**

You’re not competing with:

* OpenAI  
* Anthropic

You’re ABOVE them as:

# **Execution Layer \+ Control Plane**

---

# **🔥 WHAT YOU MUST TRACK (CRITICAL)**

If you don’t track this, pricing breaks.

---

## **📊 Required Metrics**

### **1\. User Level**

* user\_id  
* plan  
* org\_id

---

### **2\. Usage**

* commands\_executed  
* workflows\_run  
* TUI\_sessions  
* tokens\_used (if managed AI)

---

### **3\. Provider Tracking**

* provider\_name  
* model\_used  
* BYO vs Managed

---

### **4\. Billing State**

* current\_usage\_tier  
* overage\_units  
* billing\_cycle

---

---

# **🧱 DATABASE TABLE (SIMPLIFIED)**

usage\_logs  
\- id  
\- user\_id  
\- org\_id  
\- action\_type (command, workflow, tui)  
\- provider (openai, anthropic, byo)  
\- tokens  
\- created\_at

subscriptions  
\- user\_id  
\- tier  
\- base\_price  
\- usage\_level  
\- current\_charge

api\_keys  
\- user\_id  
\- provider  
\- encrypted\_key  
\- is\_byo (true/false)

---

# **🔥 PRICING TRIGGERS (WHAT MOVES THE PRICE)**

This is what you need to define clearly.

---

## **🧠 Recommended:**

### **Starter**

* limit commands  
* no scaling beyond small bump

---

### **Pro**

* workflows → trigger increase  
* TUI sessions → trigger increase

---

### **Team**

* users \+ activity

---

### **Enterprise**

* custom:  
  * seats  
  * infra  
  * SLA  
  * audit

---

# **💡 OPTIONAL (BUT POWERFUL)**

## **🧠 ADD “USAGE METER UI”**

Inside app:

“You’ve used 78% of your Pro capacity”

---

## **This:**

* encourages upgrades  
* increases retention  
* makes pricing feel fair

---

# **🚨 BIG DECISION YOU NEED TO CONFIRM**

Choose ONE:

---

## **OPTION A (RECOMMENDED)**

👉 Hybrid SaaS \+ usage

* base fee  
* soft scaling inside tier

✅ best balance  
✅ predictable revenue  
✅ scalable

---

## **OPTION B**

👉 pure usage

❌ harder to sell  
❌ less stable revenue

---

## **OPTION C**

👉 flat pricing only

❌ caps your upside  
❌ limits enterprise growth

---

# **🧭 FINAL STRUCTURE (THIS IS YOUR MODEL)**

### **💰 You make money from:**

1. **Platform (recurring SaaS)**  
2. **Usage expansion (within tier)**  
3. **Managed AI markup (optional upside)**

---

# **🔥 WHERE THIS GOES NEXT**

If you say **“go”**, next I will:

### **1\. Build:**

* pricing logic spec (ready for dev)  
* exact thresholds per tier

### **2\. Create:**

* billing flow (Stripe-ready structure)  
* upgrade/downgrade logic

### **3\. Add:**

* in-app usage meter UI spec  
* plan enforcement rules

---

You just designed something that can:  
👉 onboard individuals  
👉 scale teams  
👉 close enterprise deals  
👉 AND support multi-provider AI

This is **real platform monetization now.**

# developer ready pricing \+ billing system spec

Perfect. Now we lock this into a **developer-ready pricing \+ billing system spec** that plugs directly into your BrewAssist architecture.

This is the piece that turns your product into **predictable, scalable revenue**.

---

# **🧱 PHASE 1 — PRICING ENGINE (SOURCE OF TRUTH)**

## **🧠 Core Rule**

Everything flows from this:

Final Charge \= Base Tier Price \+ Usage Expansion \+ (Optional AI Cost)

---

# **📦 1\. PLAN CONFIG (CONFIG-DRIVEN SYSTEM)**

You do NOT hardcode pricing.

Create a config file:

// /config/pricing.ts  
export const PRICING\_PLANS \= {  
  starter: {  
    basePrice: 19,  
    limits: {  
      commands: 500,  
      workflows: 10,  
      tuiSessions: 5,  
    },  
    scaling: {  
      enabled: true,  
      maxPrice: 29,  
      increments: \[  
        { threshold: "commands", value: 750, add: 5 },  
        { threshold: "workflows", value: 20, add: 5 },  
      \],  
    },  
  },

  pro: {  
    basePrice: 49,  
    limits: {  
      commands: 2000,  
      workflows: 50,  
      tuiSessions: 25,  
    },  
    scaling: {  
      enabled: true,  
      maxPrice: 79,  
      increments: \[  
        { threshold: "commands", value: 3000, add: 10 },  
        { threshold: "workflows", value: 100, add: 10 },  
        { threshold: "tuiSessions", value: 50, add: 10 },  
      \],  
    },  
  },

  team: {  
    basePrice: 99,  
    perUser: true,  
    scaling: {  
      seats: true,  
      activity: true,  
    },  
  },

  enterprise: {  
    custom: true,  
  },  
};

---

# **⚙️ PHASE 2 — USAGE TRACKING ENGINE**

This runs **every time something happens in BrewAssist**.

---

## **🧠 Track These Events**

### **1\. Command Execution**

type: "command"

### **2\. Workflow Execution**

type: "workflow"

### **3\. TUI Session**

type: "tui\_session"

### **4\. AI Call**

type: "ai\_call"  
provider: "openai" | "anthropic" | "byo"  
tokens: number

---

## **📦 DB TABLES**

### **usage\_logs**

id (uuid)  
user\_id  
org\_id  
action\_type  
provider  
tokens\_used  
metadata (jsonb)  
created\_at

---

### **usage\_aggregates (PER BILLING PERIOD)**

id  
user\_id  
billing\_cycle\_start  
billing\_cycle\_end

commands\_count  
workflows\_count  
tui\_sessions\_count  
tokens\_total

updated\_at

---

# **🧠 PHASE 3 — BILLING CALCULATION ENGINE**

Runs:

* nightly  
* OR on-demand (dashboard)

---

## **🧮 Calculation Logic**

function calculateBill(plan, usage) {  
  let total \= plan.basePrice;

  if (plan.scaling?.enabled) {  
    for (const rule of plan.scaling.increments) {  
      if (usage\[rule.threshold\] \> rule.value) {  
        total \+= rule.add;  
      }  
    }

    if (total \> plan.scaling.maxPrice) {  
      total \= plan.scaling.maxPrice;  
    }  
  }

  return total;  
}

---

# **💡 Example (REAL FLOW)**

User on **Pro Plan**

Usage:

* commands: 3200  
* workflows: 120  
* tuiSessions: 60

---

### **Calculation:**

* base \= 49  
* \+10 (commands exceeded)  
* \+10 (workflows exceeded)  
* \+10 (tui exceeded)

\= **$79 (max cap hit)**

---

# **🔐 PHASE 4 — BYO API HANDLING**

---

## **🧠 API KEYS TABLE**

api\_keys  
\- id  
\- user\_id  
\- provider  
\- encrypted\_key  
\- is\_byo (true/false)  
\- created\_at

---

## **⚙️ Runtime Logic**

if (user.hasBYOKey(provider)) {  
  useUserKey();  
  trackUsage("byo");  
} else {  
  usePlatformKey();  
  trackUsage("managed");  
}

---

## **💰 BILLING IMPACT**

| Type | Charged? |
| ----- | ----- |
| Platform fee | ✅ YES |
| Usage scaling | ✅ YES |
| AI cost (BYO) | ❌ NO |
| AI cost (Managed) | ✅ YES |

---

# **💰 PHASE 5 — MANAGED AI BILLING**

---

## **OPTION A (Simple)**

* include credits per tier  
* charge overage

---

## **OPTION B (Advanced)**

cost \= tokens\_used \* provider\_rate  
charge \= cost \* markup\_multiplier

Example:

* OpenAI cost: $0.01  
* You charge: $0.015

---

# **📊 PHASE 6 — USER DASHBOARD (CRITICAL UX)**

---

## **🧠 Show Users:**

### **Usage Meter**

* Commands: 78%  
* Workflows: 65%  
* TUI: 90%

---

### **Billing Preview**

“Current estimated bill: $67”

---

### **Upgrade Prompt**

“You’re nearing Pro capacity — upgrade or continue scaling”

---

# **🔁 PHASE 7 — BILLING FLOW (STRIPE READY)**

---

## **🧠 Flow**

1. User selects plan  
2. Stripe subscription created  
3. Monthly cycle starts  
4. Usage tracked continuously  
5. End of cycle:  
   * calculate usage expansion  
   * add invoice items  
6. Charge user

---

## **⚙️ Stripe Structure**

* Product: BrewAssist  
* Prices:  
  * Starter  
  * Pro  
  * Team  
* Metered billing:  
  * optional (advanced phase)

---

# **🧠 PHASE 8 — ENFORCEMENT RULES**

---

## **Hard Limits (Starter)**

* block execution when exceeded

---

## **Soft Limits (Pro/Team)**

* allow overflow  
* increase price

---

## **Enterprise**

* unlimited  
* tracked only

---

# **🔥 PHASE 9 — INTERNAL ADMIN (IMPORTANT)**

---

## **BrewAdmin Needs:**

### **View:**

* usage per org  
* revenue per user  
* provider cost vs revenue

---

## **Alert:**

* abnormal usage spikes  
* abuse patterns

---

# **🧭 FINAL ARCHITECTURE**

You now have:

---

## **💰 Revenue Streams**

1. SaaS subscription (core)  
2. usage expansion (scaling)  
3. AI markup (optional)

---

## **🧠 Strategic Position**

You are:

NOT an AI provider  
NOT a chatbot

You are:

# **AI Execution Infrastructure Layer**

---

# **🚀 NEXT STEP (HIGH IMPACT)**

Say:

👉 **“build Stripe \+ billing API routes”**

And I’ll give you:

* exact API routes  
* webhook handling  
* subscription lifecycle  
* usage sync to Stripe  
* upgrade/downgrade flows

---

You now have a pricing system that can:

* start simple  
* scale clean  
* support BYO \+ managed AI  
* AND grow into enterprise deals without breaking

This is how real platforms print revenue.

# BrewAssist Stripe \+ Billing API Pack

# **BrewAssist Stripe \+ Billing API Pack**

## **Purpose**

This pack defines a practical v1 Stripe and billing implementation for BrewAssist that supports:

* subscription billing  
* fixed starting prices with internal usage scaling  
* BYO API keys vs managed AI  
* usage tracking per billing cycle  
* upgrade and downgrade flows  
* webhook-driven subscription state sync

This pack assumes a Next.js App Router codebase with TypeScript and Supabase.

---

# **1\. Recommended file map**

/app/api/billing/checkout/route.ts  
/app/api/billing/portal/route.ts  
/app/api/billing/webhook/route.ts  
/app/api/billing/usage/route.ts  
/app/api/billing/estimate/route.ts  
/app/api/billing/plans/route.ts  
/app/api/billing/subscription/route.ts  
/app/api/billing/upgrade/route.ts  
/app/api/billing/downgrade/route.ts

/lib/billing/plans.ts  
/lib/billing/stripe.ts  
/lib/billing/calcBill.ts  
/lib/billing/usageTracker.ts  
/lib/billing/entitlements.ts  
/lib/billing/webhookHandlers.ts  
/lib/billing/types.ts

/config/pricing.ts

---

# **2\. Environment variables**

STRIPE\_SECRET\_KEY=sk\_live\_or\_test\_xxx  
STRIPE\_WEBHOOK\_SECRET=whsec\_xxx  
NEXT\_PUBLIC\_STRIPE\_PUBLISHABLE\_KEY=pk\_live\_or\_test\_xxx  
NEXT\_PUBLIC\_APP\_URL=https://your-domain.com

STRIPE\_PRICE\_STARTER\_MONTHLY=price\_xxx  
STRIPE\_PRICE\_PRO\_MONTHLY=price\_xxx  
STRIPE\_PRICE\_TEAM\_MONTHLY=price\_xxx  
STRIPE\_PRICE\_STARTER\_YEARLY=price\_xxx  
STRIPE\_PRICE\_PRO\_YEARLY=price\_xxx  
STRIPE\_PRICE\_TEAM\_YEARLY=price\_xxx

Enterprise stays off Stripe catalog by default and routes to sales.

---

# **3\. Pricing config**

## **`/config/pricing.ts`**

export type PlanId \= "starter" | "pro" | "team" | "enterprise";  
export type BillingInterval \= "monthly" | "yearly";

export const PRICING\_PLANS \= {  
  starter: {  
    id: "starter",  
    displayName: "Starter",  
    basePriceMonthly: 19,  
    basePriceYearly: 15,  
    stripePriceMonthlyEnv: "STRIPE\_PRICE\_STARTER\_MONTHLY",  
    stripePriceYearlyEnv: "STRIPE\_PRICE\_STARTER\_YEARLY",  
    limits: {  
      commands: 500,  
      workflows: 10,  
      tuiSessions: 5,  
    },  
    scaling: {  
      enabled: true,  
      maxPriceMonthly: 29,  
      increments: \[  
        { metric: "commands", threshold: 750, add: 5 },  
        { metric: "workflows", threshold: 20, add: 5 },  
      \],  
    },  
  },  
  pro: {  
    id: "pro",  
    displayName: "Pro",  
    basePriceMonthly: 49,  
    basePriceYearly: 39,  
    stripePriceMonthlyEnv: "STRIPE\_PRICE\_PRO\_MONTHLY",  
    stripePriceYearlyEnv: "STRIPE\_PRICE\_PRO\_YEARLY",  
    limits: {  
      commands: 2000,  
      workflows: 50,  
      tuiSessions: 25,  
    },  
    scaling: {  
      enabled: true,  
      maxPriceMonthly: 79,  
      increments: \[  
        { metric: "commands", threshold: 3000, add: 10 },  
        { metric: "workflows", threshold: 100, add: 10 },  
        { metric: "tuiSessions", threshold: 50, add: 10 },  
      \],  
    },  
  },  
  team: {  
    id: "team",  
    displayName: "Team",  
    basePriceMonthly: 99,  
    basePriceYearly: 79,  
    stripePriceMonthlyEnv: "STRIPE\_PRICE\_TEAM\_MONTHLY",  
    stripePriceYearlyEnv: "STRIPE\_PRICE\_TEAM\_YEARLY",  
    perSeat: true,  
    limits: {  
      commands: 10000,  
      workflows: 500,  
      tuiSessions: 200,  
    },  
    scaling: {  
      enabled: true,  
      maxPriceMonthly: 149,  
      increments: \[  
        { metric: "commands", threshold: 15000, add: 15 },  
        { metric: "workflows", threshold: 750, add: 15 },  
        { metric: "tuiSessions", threshold: 300, add: 20 },  
      \],  
    },  
  },  
  enterprise: {  
    id: "enterprise",  
    displayName: "Enterprise",  
    custom: true,  
  },  
} as const;

---

# **4\. Billing types**

## **`/lib/billing/types.ts`**

import type { BillingInterval, PlanId } from "@/config/pricing";

export type UsageMetricKey \= "commands" | "workflows" | "tuiSessions" | "tokensManaged" | "tokensByo";

export type UsageAggregate \= {  
  commands: number;  
  workflows: number;  
  tuiSessions: number;  
  tokensManaged: number;  
  tokensByo: number;  
};

export type SubscriptionRecord \= {  
  userId: string;  
  orgId: string | null;  
  stripeCustomerId: string | null;  
  stripeSubscriptionId: string | null;  
  planId: PlanId;  
  billingInterval: BillingInterval;  
  status: "trialing" | "active" | "past\_due" | "canceled" | "incomplete" | "unpaid";  
  currentPeriodStart: string | null;  
  currentPeriodEnd: string | null;  
  seatCount: number;  
};

export type UsageEvent \= {  
  userId: string;  
  orgId?: string | null;  
  actionType: "command" | "workflow" | "tui\_session" | "ai\_call";  
  provider?: "managed" | "byo" | "openai" | "anthropic" | "google" | "other";  
  tokensUsed?: number;  
  metadata?: Record\<string, unknown\>;  
};

---

# **5\. Stripe client**

## **`/lib/billing/stripe.ts`**

import Stripe from "stripe";

const secretKey \= process.env.STRIPE\_SECRET\_KEY;

if (\!secretKey) {  
  throw new Error("Missing STRIPE\_SECRET\_KEY");  
}

export const stripe \= new Stripe(secretKey, {  
  apiVersion: "2025-02-24.acacia",  
  typescript: true,  
});

---

# **6\. Bill calculation engine**

## **`/lib/billing/calcBill.ts`**

import { PRICING\_PLANS, type PlanId } from "@/config/pricing";  
import type { UsageAggregate } from "./types";

export function calculateScaledPlanCharge(planId: PlanId, usage: UsageAggregate, seatCount \= 1): number {  
  const plan \= PRICING\_PLANS\[planId\];

  if (\!plan || "custom" in plan) {  
    return 0;  
  }

  let total \= plan.basePriceMonthly;

  if ("perSeat" in plan && plan.perSeat) {  
    total \*= Math.max(seatCount, 1);  
  }

  const scaling \= plan.scaling;  
  if (\!scaling?.enabled) {  
    return total;  
  }

  for (const rule of scaling.increments) {  
    const metricValue \= usage\[rule.metric as keyof UsageAggregate\] as number | undefined;  
    if (typeof metricValue \=== "number" && metricValue \> rule.threshold) {  
      total \+= rule.add;  
    }  
  }

  return Math.min(total, scaling.maxPriceMonthly \* ("perSeat" in plan && plan.perSeat ? Math.max(seatCount, 1\) : 1));  
}

export function estimateManagedAiOverage(tokensManaged: number): number {  
  const included \= 0;  
  const overageTokens \= Math.max(tokensManaged \- included, 0);  
  const ratePer1k \= 0.02;  
  return (overageTokens / 1000\) \* ratePer1k;  
}

---

# **7\. Usage tracking engine**

## **`/lib/billing/usageTracker.ts`**

import type { UsageAggregate, UsageEvent } from "./types";

export async function trackUsageEvent(event: UsageEvent): Promise\<void\> {  
  // Replace with Supabase insert.  
  // Suggested table: usage\_logs  
  console.log("trackUsageEvent", event);  
}

export async function getUsageAggregateForCycle(userId: string): Promise\<UsageAggregate\> {  
  // Replace with aggregate query by current billing period.  
  return {  
    commands: 0,  
    workflows: 0,  
    tuiSessions: 0,  
    tokensManaged: 0,  
    tokensByo: 0,  
  };  
}

---

# **8\. Entitlements helper**

## **`/lib/billing/entitlements.ts`**

import type { PlanId } from "@/config/pricing";

export function getPlanEntitlements(planId: PlanId) {  
  switch (planId) {  
    case "starter":  
      return {  
        byoApiKeys: false,  
        rbac: false,  
        auditLogs: false,  
        fullTuiMode: false,  
      };  
    case "pro":  
      return {  
        byoApiKeys: true,  
        rbac: false,  
        auditLogs: false,  
        fullTuiMode: true,  
      };  
    case "team":  
      return {  
        byoApiKeys: true,  
        rbac: true,  
        auditLogs: true,  
        fullTuiMode: true,  
      };  
    case "enterprise":  
      return {  
        byoApiKeys: true,  
        rbac: true,  
        auditLogs: true,  
        fullTuiMode: true,  
        sso: true,  
        sla: true,  
      };  
  }  
}

---

# **9\. API routes**

## **A. `GET /api/billing/plans`**

Purpose:

* return public plan metadata for pricing UI  
* never expose Stripe secret values

## **`/app/api/billing/plans/route.ts`**

import { NextResponse } from "next/server";  
import { PRICING\_PLANS } from "@/config/pricing";

export async function GET() {  
  return NextResponse.json({ plans: PRICING\_PLANS });  
}

---

## **B. `POST /api/billing/checkout`**

Purpose:

* create Stripe Checkout session for Starter, Pro, or Team

Request body:

{  
  "planId": "pro",  
  "interval": "monthly",  
  "seatCount": 1  
}

## **`/app/api/billing/checkout/route.ts`**

import { NextRequest, NextResponse } from "next/server";  
import { stripe } from "@/lib/billing/stripe";  
import { PRICING\_PLANS, type BillingInterval, type PlanId } from "@/config/pricing";

function getStripePriceId(planId: PlanId, interval: BillingInterval): string {  
  const plan \= PRICING\_PLANS\[planId\];  
  if (\!plan || "custom" in plan) {  
    throw new Error("Enterprise plan requires sales contact");  
  }

  const envKey \= interval \=== "monthly" ? plan.stripePriceMonthlyEnv : plan.stripePriceYearlyEnv;  
  const value \= process.env\[envKey\];  
  if (\!value) {  
    throw new Error(\`Missing Stripe price env: ${envKey}\`);  
  }  
  return value;  
}

export async function POST(req: NextRequest) {  
  try {  
    const body \= await req.json();  
    const { planId, interval \= "monthly", seatCount \= 1, customerEmail } \= body as {  
      planId: PlanId;  
      interval: BillingInterval;  
      seatCount?: number;  
      customerEmail?: string;  
    };

    if (planId \=== "enterprise") {  
      return NextResponse.json({ error: "Enterprise checkout handled through sales." }, { status: 400 });  
    }

    const priceId \= getStripePriceId(planId, interval);  
    const appUrl \= process.env.NEXT\_PUBLIC\_APP\_URL;  
    if (\!appUrl) {  
      throw new Error("Missing NEXT\_PUBLIC\_APP\_URL");  
    }

    const session \= await stripe.checkout.sessions.create({  
      mode: "subscription",  
      customer\_email: customerEmail,  
      line\_items: \[  
        {  
          price: priceId,  
          quantity: planId \=== "team" ? Math.max(seatCount, 1\) : 1,  
        },  
      \],  
      success\_url: \`${appUrl}/billing/success?session\_id={CHECKOUT\_SESSION\_ID}\`,  
      cancel\_url: \`${appUrl}/pricing?canceled=true\`,  
      allow\_promotion\_codes: true,  
      metadata: {  
        planId,  
        interval,  
        seatCount: String(seatCount),  
      },  
    });

    return NextResponse.json({ url: session.url });  
  } catch (error) {  
    console.error("billing checkout error", error);  
    return NextResponse.json({ error: "Unable to create checkout session." }, { status: 500 });  
  }  
}

---

## **C. `POST /api/billing/portal`**

Purpose:

* create Stripe billing portal session

## **`/app/api/billing/portal/route.ts`**

import { NextRequest, NextResponse } from "next/server";  
import { stripe } from "@/lib/billing/stripe";

export async function POST(req: NextRequest) {  
  try {  
    const { stripeCustomerId } \= await req.json();  
    const appUrl \= process.env.NEXT\_PUBLIC\_APP\_URL;  
    if (\!stripeCustomerId || \!appUrl) {  
      return NextResponse.json({ error: "Missing customer context." }, { status: 400 });  
    }

    const session \= await stripe.billingPortal.sessions.create({  
      customer: stripeCustomerId,  
      return\_url: \`${appUrl}/settings/billing\`,  
    });

    return NextResponse.json({ url: session.url });  
  } catch (error) {  
    console.error("billing portal error", error);  
    return NextResponse.json({ error: "Unable to create billing portal session." }, { status: 500 });  
  }  
}

---

## **D. `GET /api/billing/subscription`**

Purpose:

* fetch current subscription state and entitlements for current user

## **`/app/api/billing/subscription/route.ts`**

import { NextResponse } from "next/server";  
import { getPlanEntitlements } from "@/lib/billing/entitlements";

export async function GET() {  
  // Replace with real auth \+ DB lookup.  
  const subscription \= {  
    planId: "pro",  
    billingInterval: "monthly",  
    status: "active",  
    stripeCustomerId: null,  
    seatCount: 1,  
  } as const;

  return NextResponse.json({  
    subscription,  
    entitlements: getPlanEntitlements(subscription.planId),  
  });  
}

---

## **E. `POST /api/billing/estimate`**

Purpose:

* estimate current bill based on usage  
* useful for dashboard meter and admin insights

## **`/app/api/billing/estimate/route.ts`**

import { NextResponse } from "next/server";  
import { calculateScaledPlanCharge, estimateManagedAiOverage } from "@/lib/billing/calcBill";  
import { getUsageAggregateForCycle } from "@/lib/billing/usageTracker";

export async function POST() {  
  const userId \= "demo-user";  
  const planId \= "pro" as const;  
  const seatCount \= 1;

  const usage \= await getUsageAggregateForCycle(userId);  
  const platformCharge \= calculateScaledPlanCharge(planId, usage, seatCount);  
  const aiOverage \= estimateManagedAiOverage(usage.tokensManaged);

  return NextResponse.json({  
    usage,  
    estimate: {  
      platformCharge,  
      aiOverage,  
      total: platformCharge \+ aiOverage,  
    },  
  });  
}

---

## **F. `POST /api/billing/usage`**

Purpose:

* internal route for usage logging  
* used by command runner, workflow runner, TUI session start, and AI router

## **`/app/api/billing/usage/route.ts`**

import { NextRequest, NextResponse } from "next/server";  
import { trackUsageEvent } from "@/lib/billing/usageTracker";  
import type { UsageEvent } from "@/lib/billing/types";

export async function POST(req: NextRequest) {  
  try {  
    const event \= (await req.json()) as UsageEvent;  
    await trackUsageEvent(event);  
    return NextResponse.json({ ok: true });  
  } catch (error) {  
    console.error("usage tracking error", error);  
    return NextResponse.json({ error: "Unable to track usage." }, { status: 500 });  
  }  
}

---

## **G. `POST /api/billing/upgrade`**

Purpose:

* immediate plan change request  
* uses Stripe subscription update

## **`/app/api/billing/upgrade/route.ts`**

import { NextRequest, NextResponse } from "next/server";  
import { stripe } from "@/lib/billing/stripe";

export async function POST(req: NextRequest) {  
  try {  
    const { stripeSubscriptionId, subscriptionItemId, newPriceId } \= await req.json();

    const updated \= await stripe.subscriptions.update(stripeSubscriptionId, {  
      items: \[{ id: subscriptionItemId, price: newPriceId }\],  
      proration\_behavior: "create\_prorations",  
    });

    return NextResponse.json({ ok: true, subscription: updated });  
  } catch (error) {  
    console.error("upgrade error", error);  
    return NextResponse.json({ error: "Unable to upgrade plan." }, { status: 500 });  
  }  
}

---

## **H. `POST /api/billing/downgrade`**

Purpose:

* downgrade at period end by default

## **`/app/api/billing/downgrade/route.ts`**

import { NextRequest, NextResponse } from "next/server";  
import { stripe } from "@/lib/billing/stripe";

export async function POST(req: NextRequest) {  
  try {  
    const { stripeSubscriptionId, subscriptionItemId, newPriceId } \= await req.json();

    const updated \= await stripe.subscriptions.update(stripeSubscriptionId, {  
      items: \[{ id: subscriptionItemId, price: newPriceId }\],  
      proration\_behavior: "none",  
      billing\_cycle\_anchor: "unchanged",  
    });

    return NextResponse.json({ ok: true, subscription: updated });  
  } catch (error) {  
    console.error("downgrade error", error);  
    return NextResponse.json({ error: "Unable to downgrade plan." }, { status: 500 });  
  }  
}

---

## **I. `POST /api/billing/webhook`**

Purpose:

* verify Stripe webhook signature  
* sync checkout completion, subscription updates, invoice status, and cancellations

## **`/app/api/billing/webhook/route.ts`**

import { headers } from "next/headers";  
import { NextRequest, NextResponse } from "next/server";  
import { stripe } from "@/lib/billing/stripe";  
import { handleStripeEvent } from "@/lib/billing/webhookHandlers";

export async function POST(req: NextRequest) {  
  const body \= await req.text();  
  const signature \= (await headers()).get("stripe-signature");  
  const webhookSecret \= process.env.STRIPE\_WEBHOOK\_SECRET;

  if (\!signature || \!webhookSecret) {  
    return NextResponse.json({ error: "Missing webhook config." }, { status: 400 });  
  }

  try {  
    const event \= stripe.webhooks.constructEvent(body, signature, webhookSecret);  
    await handleStripeEvent(event);  
    return NextResponse.json({ received: true });  
  } catch (error) {  
    console.error("stripe webhook error", error);  
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });  
  }  
}

---

# **10\. Webhook handlers**

## **`/lib/billing/webhookHandlers.ts`**

import type Stripe from "stripe";

export async function handleStripeEvent(event: Stripe.Event): Promise\<void\> {  
  switch (event.type) {  
    case "checkout.session.completed": {  
      const session \= event.data.object as Stripe.Checkout.Session;  
      console.log("checkout completed", session.id);  
      // create or update local subscription record  
      break;  
    }  
    case "customer.subscription.created":  
    case "customer.subscription.updated":  
    case "customer.subscription.deleted": {  
      const subscription \= event.data.object as Stripe.Subscription;  
      console.log("subscription sync", subscription.id, event.type);  
      // sync local subscription state  
      break;  
    }  
    case "invoice.paid":  
    case "invoice.payment\_failed": {  
      const invoice \= event.data.object as Stripe.Invoice;  
      console.log("invoice event", invoice.id, event.type);  
      // mark billing status  
      break;  
    }  
    default:  
      console.log("Unhandled Stripe event", event.type);  
  }  
}

---

# **11\. Subscription lifecycle rules**

## **Upgrade**

* apply immediately  
* prorate through Stripe  
* unlock entitlements immediately after successful Stripe confirmation

## **Downgrade**

* apply at period end by default  
* if current usage exceeds target plan limits, show warning before downgrade

## **Cancellation**

* keep access until period end unless admin forces immediate cancel

## **Failed payment**

* keep grace period  
* reduce access only after Stripe status becomes unpaid or canceled

---

# **12\. Suggested Supabase schema**

create table if not exists subscriptions (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid not null,  
  org\_id uuid,  
  stripe\_customer\_id text,  
  stripe\_subscription\_id text,  
  plan\_id text not null,  
  billing\_interval text not null,  
  status text not null,  
  current\_period\_start timestamptz,  
  current\_period\_end timestamptz,  
  seat\_count integer not null default 1,  
  created\_at timestamptz not null default now(),  
  updated\_at timestamptz not null default now()  
);

create table if not exists usage\_logs (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid not null,  
  org\_id uuid,  
  action\_type text not null,  
  provider text,  
  tokens\_used integer,  
  metadata jsonb,  
  created\_at timestamptz not null default now()  
);

create table if not exists usage\_aggregates (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid not null,  
  billing\_cycle\_start timestamptz not null,  
  billing\_cycle\_end timestamptz not null,  
  commands\_count integer not null default 0,  
  workflows\_count integer not null default 0,  
  tui\_sessions\_count integer not null default 0,  
  tokens\_managed integer not null default 0,  
  tokens\_byo integer not null default 0,  
  updated\_at timestamptz not null default now()  
);

create table if not exists api\_keys (  
  id uuid primary key default gen\_random\_uuid(),  
  user\_id uuid not null,  
  provider text not null,  
  encrypted\_key text not null,  
  is\_byo boolean not null default true,  
  created\_at timestamptz not null default now()  
);

---

# **13\. Frontend billing pages to add next**

/app/pricing/page.tsx  
/app/settings/billing/page.tsx  
/app/billing/success/page.tsx

## **Pricing page should do**

* fetch `/api/billing/plans`  
* let user choose monthly vs yearly  
* call `/api/billing/checkout`  
* route Enterprise to contact sales

## **Billing settings page should do**

* fetch `/api/billing/subscription`  
* fetch `/api/billing/estimate`  
* show current plan  
* show usage meter  
* open billing portal  
* allow upgrade or downgrade

---

# **14\. Usage meter UI**

Recommended widgets in billing settings:

* commands used this cycle  
* workflows used this cycle  
* TUI sessions used this cycle  
* managed AI tokens used  
* BYO AI tokens observed  
* current estimated bill  
* entitlements panel

Recommended copy:

* "Your plan starts at $49 and scales with activity."  
* "Bring your own AI keys removes AI cost, not the BrewAssist platform fee."

---

# **15\. Enforcement logic**

## **Starter**

* hard limit optional for TUI and workflow counts  
* prompt upgrade when threshold hit

## **Pro**

* allow overflow inside capped range  
* show estimate in real time

## **Team**

* enforce seat licensing and collaboration permissions

## **Enterprise**

* use contract terms, not hard-coded caps

---

# **16\. Best-practice notes**

## **Do this**

* keep prices config-driven  
* sync Stripe subscription state into your own database  
* use Stripe as billing processor, not your source of truth for entitlements  
* always calculate app entitlements locally  
* track BYO AI usage separately from managed AI usage  
* show billing estimates before invoice time

## **Avoid this**

* hardcoding plan logic in UI components  
* relying on Stripe alone for entitlement checks  
* treating BYO AI users as free platform users  
* hiding scaling behavior from users

---

# **17\. Recommended next build order**

1. add pricing config and billing types  
2. add Stripe client and checkout route  
3. add webhook route and local subscription sync  
4. add usage tracking route and event logging  
5. add estimate route  
6. build pricing page integration  
7. build billing settings page  
8. wire entitlement checks into BrewAssist features

---

# **18\. Exact next step**

After this pack, the next best move is:

* implement the Stripe routes in code  
* build `/pricing`  
* build `/settings/billing`  
* wire subscription entitlements into TUI mode, BYO API keys, RBAC, and workflow access

# Pricing \+ Billing Pages

# **BrewAssist Pricing \+ Billing Pages**

## **File: `app/pricing/page.tsx`**

"use client";

import Link from "next/link";  
import { useMemo, useState } from "react";  
import { ArrowRight, CheckCircle2, ShieldCheck, Cpu, Users, Building2 } from "lucide-react";

type BillingInterval \= "monthly" | "yearly";

type PricingTier \= {  
  name: string;  
  priceMonthly: string;  
  priceYearly: string;  
  note: string;  
  cta: string;  
  featured?: boolean;  
  icon: React.ComponentType\<{ className?: string }\>;  
  points: string\[\];  
};

const tiers: PricingTier\[\] \= \[  
  {  
    name: "Starter",  
    priceMonthly: "$19",  
    priceYearly: "$15",  
    note: "Scales to $29 with usage",  
    cta: "Get Started",  
    icon: Cpu,  
    points: \[  
      "Core BrewAssist cockpit",  
      "Managed AI usage",  
      "Basic TUI preview",  
      "Guided onboarding",  
      "Community support",  
    \],  
  },  
  {  
    name: "Pro",  
    priceMonthly: "$49",  
    priceYearly: "$39",  
    note: "Scales to $79 with workflows and usage",  
    cta: "Upgrade to Pro",  
    featured: true,  
    icon: ShieldCheck,  
    points: \[  
      "Everything in Starter",  
      "Bring your own API keys",  
      "Full TUI mode access",  
      "Workflow automation",  
      "Priority support",  
    \],  
  },  
  {  
    name: "Team",  
    priceMonthly: "$99",  
    priceYearly: "$79",  
    note: "Starts per user, expands with seats and activity",  
    cta: "Talk Team Plans",  
    icon: Users,  
    points: \[  
      "Multi-user workspaces",  
      "RBAC controls",  
      "Shared workflows",  
      "Basic audit visibility",  
      "Integration hooks",  
    \],  
  },  
  {  
    name: "Enterprise",  
    priceMonthly: "Custom",  
    priceYearly: "Custom",  
    note: "Built for governance, scale, and advanced controls",  
    cta: "Contact Sales",  
    icon: Building2,  
    points: \[  
      "Advanced RLS and RBAC posture",  
      "SSO / SAML alignment",  
      "Audit trails and governance",  
      "Dedicated onboarding",  
      "SLA and support design",  
    \],  
  },  
\];

function cn(...classes: Array\<string | false | null | undefined\>) {  
  return classes.filter(Boolean).join(" ");  
}

export default function PricingPage() {  
  const \[interval, setInterval\] \= useState\<BillingInterval\>("monthly");  
  const \[loadingTier, setLoadingTier\] \= useState\<string | null\>(null);

  const priceLabel \= useMemo(  
    () \=\> (tier: PricingTier) \=\>  
      interval \=== "monthly" ? tier.priceMonthly : tier.priceYearly,  
    \[interval\]  
  );

  async function handleCheckout(tierName: string) {  
    if (tierName \=== "Enterprise") {  
      window.location.href \= "/contact";  
      return;  
    }

    setLoadingTier(tierName);  
    try {  
      const planId \= tierName.toLowerCase();  
      const res \= await fetch("/api/billing/checkout", {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({  
          planId,  
          interval,  
          seatCount: tierName \=== "Team" ? 3 : 1,  
        }),  
      });

      const data \= await res.json();  
      if (\!res.ok) throw new Error(data.error || "Unable to start checkout.");  
      if (data.url) window.location.href \= data.url;  
    } catch (error) {  
      console.error(error);  
      alert("Unable to start checkout right now.");  
    } finally {  
      setLoadingTier(null);  
    }  
  }

  return (  
    \<main className="min-h-screen bg-\[\#050505\] text-white"\>  
      \<div className="mx-auto max-w-7xl px-6 py-16 lg:px-8"\>  
        \<div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-\[0.24em\] text-amber-200 inline-flex"\>  
          Pricing  
        \</div\>

        \<div className="mt-6 max-w-4xl"\>  
          \<h1 className="text-5xl font-semibold tracking-tight md:text-6xl"\>  
            Flexible pricing for builders and enterprises.  
          \</h1\>  
          \<p className="mt-5 text-lg leading-8 text-zinc-300"\>  
            Start with a clear base price, then scale as workflows, teams, and usage grow.  
            Bring your own AI keys when you want cost control, or keep things simple with  
            BrewAssist-managed AI.  
          \</p\>  
        \</div\>

        \<div className="mt-10 flex items-center gap-3"\>  
          \<button  
            type="button"  
            onClick={() \=\> setInterval("monthly")}  
            className={cn(  
              "rounded-full px-4 py-2 text-sm transition",  
              interval \=== "monthly"  
                ? "bg-white text-black"  
                : "border border-white/10 bg-white/5 text-white"  
            )}  
          \>  
            Monthly  
          \</button\>  
          \<button  
            type="button"  
            onClick={() \=\> setInterval("yearly")}  
            className={cn(  
              "rounded-full px-4 py-2 text-sm transition",  
              interval \=== "yearly"  
                ? "bg-amber-300 text-black"  
                : "border border-amber-300/20 bg-amber-300/10 text-amber-200"  
            )}  
          \>  
            Yearly · Save 20%  
          \</button\>  
        \</div\>

        \<section className="mt-12 grid gap-5 xl:grid-cols-4"\>  
          {tiers.map((tier) \=\> {  
            const Icon \= tier.icon;  
            const activePrice \= priceLabel(tier);

            return (  
              \<div  
                key={tier.name}  
                className={cn(  
                  "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl",  
                  tier.featured && "border-amber-300/25 shadow-\[0\_0\_60px\_rgba(251,191,36,0.10)\]"  
                )}  
              \>  
                \<div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-emerald-300/10 to-amber-300/10" /\>  
                \<div className="relative"\>  
                  \<div className="flex items-center gap-3"\>  
                    \<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"\>  
                      \<Icon className="h-5 w-5 text-amber-200" /\>  
                    \</div\>  
                    \<div\>  
                      \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>  
                        {tier.name}  
                      \</div\>  
                      {tier.featured && (  
                        \<div className="mt-1 text-xs uppercase tracking-\[0.18em\] text-amber-300"\>  
                          Most popular  
                        \</div\>  
                      )}  
                    \</div\>  
                  \</div\>

                  \<div className="mt-6 text-4xl font-semibold"\>{activePrice}\</div\>  
                  \<div className="mt-1 text-sm text-zinc-400"\>  
                    {activePrice \=== "Custom" ? tier.note : \`per ${interval \=== "monthly" ? "month" : "month, billed yearly"} · ${tier.note}\`}  
                  \</div\>

                  \<div className="mt-6 space-y-3"\>  
                    {tier.points.map((point) \=\> (  
                      \<div key={point} className="flex gap-3 text-sm leading-7 text-zinc-300"\>  
                        \<CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-300" /\>  
                        \<span\>{point}\</span\>  
                      \</div\>  
                    ))}  
                  \</div\>

                  \<button  
                    type="button"  
                    onClick={() \=\> handleCheckout(tier.name)}  
                    disabled={loadingTier \=== tier.name}  
                    className={cn(  
                      "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",  
                      tier.featured  
                        ? "bg-gradient-to-r from-amber-300 to-yellow-200 text-black"  
                        : "border border-white/10 bg-white/5 text-white hover:bg-white/10"  
                    )}  
                  \>  
                    {loadingTier \=== tier.name ? "Loading..." : tier.cta}  
                    \<ArrowRight className="h-4 w-4" /\>  
                  \</button\>  
                \</div\>  
              \</div\>  
            );  
          })}  
        \</section\>

        \<section className="mt-14 grid gap-5 lg:grid-cols-2"\>  
          \<div className="rounded-3xl border border-white/10 bg-white/5 p-6"\>  
            \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Managed AI\</div\>  
            \<div className="mt-3 text-2xl font-semibold"\>Keep billing simple with BrewAssist-managed AI.\</div\>  
            \<div className="mt-4 space-y-3 text-sm leading-7 text-zinc-300"\>  
              \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /\>Simple billing experience\</div\>  
              \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /\>Transparent usage visibility\</div\>  
              \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-emerald-300" /\>Best fit for individuals and smaller teams\</div\>  
            \</div\>  
          \</div\>

          \<div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-6"\>  
            \<div className="text-sm uppercase tracking-\[0.22em\] text-amber-200"\>Bring Your Own AI\</div\>  
            \<div className="mt-3 text-2xl font-semibold"\>Bring your own API keys and still pay for the BrewAssist platform.\</div\>  
            \<div className="mt-4 space-y-3 text-sm leading-7 text-zinc-200"\>  
              \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-amber-200" /\>Your provider costs stay yours\</div\>  
              \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-amber-200" /\>BrewAssist still delivers orchestration, workflows, and governance\</div\>  
              \<div className="flex gap-3"\>\<CheckCircle2 className="mt-1 h-4 w-4 text-amber-200" /\>Track sessions, execution, and model usage clearly\</div\>  
            \</div\>  
          \</div\>  
        \</section\>

        \<section className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-8"\>  
          \<div className="max-w-3xl"\>  
            \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Need enterprise pricing?\</div\>  
            \<h2 className="mt-3 text-3xl font-semibold"\>Let’s map governance, onboarding, and deployment needs together.\</h2\>  
            \<p className="mt-4 text-zinc-300 leading-7"\>  
              Enterprise plans are shaped around security posture, governance, support,  
              team structure, and deployment requirements.  
            \</p\>  
          \</div\>  
          \<div className="mt-6 flex flex-wrap gap-4"\>  
            \<Link href="/contact" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"\>  
              Contact Sales  
            \</Link\>  
            \<Link href="/security" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"\>  
              View Security Overview  
            \</Link\>  
          \</div\>  
        \</section\>  
      \</div\>  
    \</main\>  
  );  
}

---

## **File: `app/settings/billing/page.tsx`**

"use client";

import { useEffect, useMemo, useState } from "react";  
import { CheckCircle2, CreditCard, Gauge, KeyRound, Receipt, ShieldCheck } from "lucide-react";

type SubscriptionData \= {  
  subscription: {  
    planId: string;  
    billingInterval: string;  
    status: string;  
    stripeCustomerId: string | null;  
    seatCount: number;  
  };  
  entitlements: Record\<string, boolean\>;  
};

type EstimateData \= {  
  usage: {  
    commands: number;  
    workflows: number;  
    tuiSessions: number;  
    tokensManaged: number;  
    tokensByo: number;  
  };  
  estimate: {  
    platformCharge: number;  
    aiOverage: number;  
    total: number;  
  };  
};

function Meter({ label, value, max }: { label: string; value: number; max: number }) {  
  const percent \= Math.min(Math.round((value / Math.max(max, 1)) \* 100), 100);

  return (  
    \<div className="rounded-2xl border border-white/10 bg-white/5 p-4"\>  
      \<div className="flex items-center justify-between text-sm text-zinc-300"\>  
        \<span\>{label}\</span\>  
        \<span\>{value} / {max}\</span\>  
      \</div\>  
      \<div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"\>  
        \<div className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300" style={{ width: \`${percent}%\` }} /\>  
      \</div\>  
      \<div className="mt-2 text-xs text-zinc-500"\>{percent}% used this cycle\</div\>  
    \</div\>  
  );  
}

export default function BillingSettingsPage() {  
  const \[subscription, setSubscription\] \= useState\<SubscriptionData | null\>(null);  
  const \[estimate, setEstimate\] \= useState\<EstimateData | null\>(null);  
  const \[loading, setLoading\] \= useState(true);

  useEffect(() \=\> {  
    async function load() {  
      try {  
        const \[subRes, estRes\] \= await Promise.all(\[  
          fetch("/api/billing/subscription"),  
          fetch("/api/billing/estimate", { method: "POST" }),  
        \]);

        const subJson \= await subRes.json();  
        const estJson \= await estRes.json();

        setSubscription(subJson);  
        setEstimate(estJson);  
      } catch (error) {  
        console.error(error);  
      } finally {  
        setLoading(false);  
      }  
    }

    load();  
  }, \[\]);

  const planLabel \= useMemo(() \=\> {  
    if (\!subscription) return "—";  
    return \`${subscription.subscription.planId.toUpperCase()} · ${subscription.subscription.billingInterval}\`;  
  }, \[subscription\]);

  async function openBillingPortal() {  
    if (\!subscription?.subscription.stripeCustomerId) {  
      alert("Billing portal is not ready for this account yet.");  
      return;  
    }

    const res \= await fetch("/api/billing/portal", {  
      method: "POST",  
      headers: { "Content-Type": "application/json" },  
      body: JSON.stringify({ stripeCustomerId: subscription.subscription.stripeCustomerId }),  
    });

    const data \= await res.json();  
    if (data.url) window.location.href \= data.url;  
  }

  if (loading) {  
    return (  
      \<main className="min-h-screen bg-\[\#050505\] px-6 py-16 text-white lg:px-8"\>  
        \<div className="mx-auto max-w-6xl"\>Loading billing...\</div\>  
      \</main\>  
    );  
  }

  return (  
    \<main className="min-h-screen bg-\[\#050505\] px-6 py-16 text-white lg:px-8"\>  
      \<div className="mx-auto max-w-6xl"\>  
        \<div className="inline-flex rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-\[0.24em\] text-amber-200"\>  
          Billing Settings  
        \</div\>

        \<div className="mt-6 grid gap-6 lg:grid-cols-\[1.1fr\_.9fr\]"\>  
          \<div className="rounded-3xl border border-white/10 bg-white/5 p-8"\>  
            \<div className="flex items-start justify-between gap-4"\>  
              \<div\>  
                \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Current Plan\</div\>  
                \<h1 className="mt-3 text-4xl font-semibold"\>{planLabel}\</h1\>  
                \<p className="mt-4 max-w-2xl text-zinc-300 leading-7"\>  
                  BrewAssist charges for the platform layer, then scales as workflows and activity expand.  
                  Bring your own AI removes model cost, not platform value.  
                \</p\>  
              \</div\>  
              \<div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"\>  
                {subscription?.subscription.status ?? "unknown"}  
              \</div\>  
            \</div\>

            \<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"\>  
              \<div className="rounded-2xl border border-white/10 bg-black/40 p-5"\>  
                \<CreditCard className="h-5 w-5 text-amber-300" /\>  
                \<div className="mt-3 text-sm text-zinc-400"\>Platform Charge\</div\>  
                \<div className="mt-1 text-2xl font-semibold"\>${estimate?.estimate.platformCharge ?? 0}\</div\>  
              \</div\>  
              \<div className="rounded-2xl border border-white/10 bg-black/40 p-5"\>  
                \<Receipt className="h-5 w-5 text-emerald-300" /\>  
                \<div className="mt-3 text-sm text-zinc-400"\>Managed AI Overage\</div\>  
                \<div className="mt-1 text-2xl font-semibold"\>${estimate?.estimate.aiOverage ?? 0}\</div\>  
              \</div\>  
              \<div className="rounded-2xl border border-white/10 bg-black/40 p-5"\>  
                \<Gauge className="h-5 w-5 text-cyan-300" /\>  
                \<div className="mt-3 text-sm text-zinc-400"\>Estimated Total\</div\>  
                \<div className="mt-1 text-2xl font-semibold"\>${estimate?.estimate.total ?? 0}\</div\>  
              \</div\>  
              \<div className="rounded-2xl border border-white/10 bg-black/40 p-5"\>  
                \<KeyRound className="h-5 w-5 text-amber-300" /\>  
                \<div className="mt-3 text-sm text-zinc-400"\>Seats\</div\>  
                \<div className="mt-1 text-2xl font-semibold"\>{subscription?.subscription.seatCount ?? 1}\</div\>  
              \</div\>  
            \</div\>

            \<div className="mt-8 flex flex-wrap gap-4"\>  
              \<button  
                type="button"  
                onClick={openBillingPortal}  
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black"  
              \>  
                Open Billing Portal  
              \</button\>  
              \<a href="/pricing" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"\>  
                Change Plan  
              \</a\>  
            \</div\>  
          \</div\>

          \<div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-8"\>  
            \<div className="text-sm uppercase tracking-\[0.22em\] text-amber-200"\>Entitlements\</div\>  
            \<div className="mt-5 space-y-3"\>  
              {Object.entries(subscription?.entitlements ?? {}).map((\[key, value\]) \=\> (  
                \<div key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm"\>  
                  \<span className="capitalize text-zinc-100"\>{key.replace(/(\[A-Z\])/g, " $1")}\</span\>  
                  \<span className={value ? "text-emerald-200" : "text-zinc-500"}\>  
                    {value ? "Enabled" : "Locked"}  
                  \</span\>  
                \</div\>  
              ))}  
            \</div\>  
            \<div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-zinc-200"\>  
              \<div className="flex gap-3"\>\<ShieldCheck className="mt-1 h-4 w-4 text-amber-200" /\>BYO AI support is a platform entitlement, not a replacement for the BrewAssist platform fee.\</div\>  
            \</div\>  
          \</div\>  
        \</div\>

        \<section className="mt-8 grid gap-5 xl:grid-cols-2"\>  
          \<div className="rounded-3xl border border-white/10 bg-white/5 p-8"\>  
            \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Usage This Cycle\</div\>  
            \<div className="mt-6 grid gap-4"\>  
              \<Meter label="Commands" value={estimate?.usage.commands ?? 0} max={2000} /\>  
              \<Meter label="Workflows" value={estimate?.usage.workflows ?? 0} max={50} /\>  
              \<Meter label="TUI Sessions" value={estimate?.usage.tuiSessions ?? 0} max={25} /\>  
            \</div\>  
          \</div\>

          \<div className="rounded-3xl border border-white/10 bg-white/5 p-8"\>  
            \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>AI Usage Visibility\</div\>  
            \<div className="mt-6 space-y-4"\>  
              \<div className="rounded-2xl border border-white/10 bg-black/30 p-4"\>  
                \<div className="text-sm text-zinc-400"\>Managed AI tokens\</div\>  
                \<div className="mt-1 text-2xl font-semibold"\>{estimate?.usage.tokensManaged ?? 0}\</div\>  
              \</div\>  
              \<div className="rounded-2xl border border-white/10 bg-black/30 p-4"\>  
                \<div className="text-sm text-zinc-400"\>BYO AI tokens observed\</div\>  
                \<div className="mt-1 text-2xl font-semibold"\>{estimate?.usage.tokensByo ?? 0}\</div\>  
              \</div\>  
              \<div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/10 p-4 text-sm leading-7 text-emerald-100"\>  
                You only pay BrewAssist AI overage on managed usage. BYO AI stays visible for analytics and governance, but not as provider cost on your BrewAssist invoice.  
              \</div\>  
            \</div\>  
          \</div\>  
        \</section\>

        \<section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8"\>  
          \<div className="text-sm uppercase tracking-\[0.22em\] text-zinc-400"\>Plan Guidance\</div\>  
          \<div className="mt-4 grid gap-4 md:grid-cols-3"\>  
            {\[  
              "Upgrade before heavy workflow months to avoid friction.",  
              "Use BYO AI when you want provider-level cost control.",  
              "Move to Team when you need shared governance and collaboration.",  
            \].map((item) \=\> (  
              \<div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-zinc-200"\>  
                \<CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-300" /\>  
                \<span\>{item}\</span\>  
              \</div\>  
            ))}  
          \</div\>  
        \</section\>  
      \</div\>  
    \</main\>  
  );  
}

---

## **🔌 Phase 2: Live Wiring \+ Auth Integration**

### **1\. Connect Pricing Page → Live Plans API**

Update pricing page to fetch real plans:

const res \= await fetch('/api/billing/plans');  
const { plans } \= await res.json();

Replace hardcoded tiers with mapped API response.

---

### **2\. Inject Auth Context into Billing Routes**

Every billing route should:

* read user from Supabase session  
* map to `userId` \+ `orgId`

Example pattern:

const user \= await getUser(); // your auth helper  
if (\!user) return 401;

Apply to:

* checkout  
* subscription  
* estimate  
* usage  
* portal

---

### **3\. Store Stripe Customer ID**

On checkout success webhook:

* store `stripeCustomerId`  
* store `stripeSubscriptionId`

This enables billing portal \+ upgrades.

---

## **🔁 Phase 3: Upgrade / Downgrade Controls (UI)**

### **Add to `/settings/billing`**

#### **Upgrade Buttons**

\<button onClick={() \=\> upgrade('pro')}\>Upgrade to Pro\</button\>

Calls:

POST /api/billing/upgrade

---

#### **Downgrade Flow (with warning)**

UI should:

* check current usage  
* compare against lower tier limits

If over:

"Your current usage exceeds Starter limits. Downgrade will apply next cycle."

---

#### **Seat Management (Team Tier)**

Add control:

\<input type="number" value={seats} /\>

Triggers:

* Stripe quantity update

---

## **🧠 Phase 4: Entitlement Enforcement Layer**

Wire entitlements into BrewAssist runtime:

### **Example checks**

if (\!entitlements.fullTuiMode) {  
  throw new Error('Upgrade required for TUI');  
}

Apply to:

* TUI access  
* BYO API usage  
* workflow execution  
* RBAC controls

---

## **📊 Phase 5: Dynamic Usage Limits (Replace Hardcoding)**

Replace static values like:

max={2000}

With:

const limits \= PRICING\_PLANS\[planId\].limits;

---

## **🧾 Phase 6: Legal \+ Footer Integration**

Every pricing/billing screen should include:

* Terms of Service  
* Privacy Policy  
* Billing Policy  
* Refund Policy  
* AI Usage Disclosure

Footer example:

\<footer\>  
  \<a href="/terms"\>Terms\</a\>  
  \<a href="/privacy"\>Privacy\</a\>  
  \<a href="/billing-policy"\>Billing\</a\>  
\</footer\>

---

## **🚀 Phase 7: Enterprise Conversion Flow**

From pricing page:

* Enterprise CTA → `/contact`

Add hidden fields:

* selected tier  
* estimated usage

This feeds sales pipeline.

---

## **🔥 Phase 8: Recommended Next Builds**

1. Add Stripe webhook persistence (critical)  
2. Add real usage aggregation (Supabase queries)  
3. Add upgrade/downgrade UI polish  
4. Add team seat billing sync  
5. Add admin billing dashboard (future)

---

## **✅ You Are Now At**

* monetizable pricing system  
* scalable billing architecture  
* enterprise-ready upgrade path

Next major evolution:

👉 **Usage simulator (interactive pricing slider)**  
👉 **Admin revenue dashboard**  
👉 **BrewAssist billing intelligence (AI insights on spend)**

