'use client';

import { useState } from 'react';

type BrewGuideModalProps = {
  open: boolean;
  onClose: () => void;
};

const sections = {
  help: {
    title: 'Slash Command Reference',
    subtitle: 'Quick cheatsheet for the BrewAssist DevOps Cockpit',
  },
  guide: {
    title: 'BrewAssist DevOps Guide',
    subtitle: 'A narrated walkthrough of how to work with the cockpit',
  },
};

export default function BrewGuideModal({ open, onClose }: BrewGuideModalProps) {
  const [tab, setTab] = useState<'help' | 'guide'>('help');

  const current = sections[tab];

  if (!open) return null;

  return (
    <div className="brew-guide-overlay" onClick={onClose}>
      <div className="brew-guide-panel" onClick={(e) => e.stopPropagation()}>
        <header className="brew-guide-header">
          <h2>BrewAssist DevOps Guide</h2>
          <button className="brew-guide-close" onClick={onClose}>
            ✖
          </button>
        </header>

        <div className="brew-guide-body">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-amber-300">
                BrewAssist DevOps Cockpit
              </h2>
              <p className="text-xs text-white/60">{current.subtitle}</p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/5 p-1">
              <button
                onClick={() => setTab('help')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tab === 'help'
                    ? 'bg-amber-300 text-black shadow'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                /help
              </button>
              <button
                onClick={() => setTab('guide')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tab === 'guide'
                    ? 'bg-teal-400 text-black shadow'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                /guide
              </button>
            </div>
          </header>

          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">
              {current.title}
            </div>
            <span className="rounded-full border border-teal-400/40 bg-teal-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-200">
              shimmer-tier
            </span>
          </div>

          {tab === 'help' ? (
            <div className="grid grid-cols-1 gap-2 text-xs text-white/80 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                  Core AI
                </p>
                <HelpRow cmd="/assist" desc="Unified AI entrypoint" />
                <HelpRow cmd="/hrm" desc="Strategy planner" />
                <HelpRow cmd="/llm" desc="Direct model output" />
                <HelpRow cmd="/agent" desc="Agent router" />
                <HelpRow cmd="/loop" desc="HRM loop" />
                <HelpRow cmd="/loop_mistral" desc="Mistral loop" />
                <HelpRow
                  cmd="/sandbox"
                  desc="Raw prompt to individual AI engines"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                  DevOps & Sessions
                </p>
                <HelpRow cmd="/commit" desc="Narrated Git commit" />
                <HelpRow cmd="/status" desc="System snapshot" />
                <HelpRow cmd="/supa" desc="Supabase db push" />
                <HelpRow cmd="/port" desc="Check/clear port 11434" />
                <HelpRow cmd="/test" desc="Engine test suite" />
                <HelpRow cmd="/switch" desc="Switch project" />
                <HelpRow cmd="/setup" desc="Install aliases" />
                <HelpRow cmd="/replay" desc="Replay session" />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-white/80">
              <p>
                Start with <span className="text-teal-300">/setup</span> to
                install aliases, then run{' '}
                <span className="text-amber-300">/switch</span> to choose your
                active project. Use{' '}
                <span className="text-teal-300">/status</span> to confirm your
                toolchain, then drop into{' '}
                <span className="text-amber-300">/assist</span> for a narrated
                HRM → LLM planning session.
              </p>
              <p>
                Every serious run should end with{' '}
                <span className="text-amber-300">/commit</span> and{' '}
                <span className="text-teal-300">/close</span> so BrewAssist can
                log what changed and where you left off.
              </p>
              <p className="text-white/50">
                Pro tip: when debugging fallback chains, talk directly to{' '}
                <span className="text-teal-300">/loop_mistral</span> and compare
                behavior with <span className="text-amber-300">/assist</span>.
              </p>
              <p className="text-white/50">
                For raw model output, use the{' '}
                <span className="text-amber-300">AI Sandbox</span> panel on the
                right, or the <span className="text-teal-300">/sandbox</span>{' '}
                command.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HelpRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1">
      <span className="font-mono text-[11px] text-amber-200">{cmd}</span>
      <span className="ml-2 flex-1 truncate text-[11px] text-white/70">
        {desc}
      </span>
    </div>
  );
}
