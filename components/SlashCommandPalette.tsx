'use client';

import React from 'react';

type SlashCommandPaletteProps = {
  open: boolean;
  onClose: () => void;
  onInsert: (command: string) => void;
  onRun: (command: string) => void;
};

const COMMANDS = [
  { command: '/init', title: 'Onboard', description: 'Start the setup wizard' },
  {
    command: '/task',
    title: 'Task',
    description: 'Create a structured dev task',
  },
  { command: '/doc', title: 'Doc', description: 'Generate or update docs' },
  { command: '/patch', title: 'Patch', description: 'Preview a code patch' },
  { command: '/hrm', title: 'HRM', description: 'Strategy and planning mode' },
  { command: '/llm', title: 'LLM', description: 'Direct model response' },
  {
    command: '/agent',
    title: 'Agent',
    description: 'Delegate to the agent router',
  },
  { command: '/loop', title: 'Loop', description: 'Narrated commentary loop' },
  { command: '/assist', title: 'Assist', description: 'Unified AI entrypoint' },
];

export function SlashCommandPalette({
  open,
  onClose,
  onInsert,
  onRun,
}: SlashCommandPaletteProps) {
  if (!open) return null;

  return (
    <div className="slash-palette-overlay" onClick={onClose}>
      <div className="slash-palette-panel" onClick={(e) => e.stopPropagation()}>
        <header className="slash-palette-header">
          <div>
            <span className="slash-palette-kicker">Commands</span>
            <h2>/ command palette</h2>
            <p>Quick launch for power users, vibe coders, and operators.</p>
          </div>
          <button
            type="button"
            className="slash-palette-close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="slash-palette-grid">
          {COMMANDS.map((item) => (
            <button
              key={item.command}
              type="button"
              className="slash-palette-card"
              onClick={() => onInsert(item.command)}
              onDoubleClick={() => onRun(item.command)}
            >
              <div className="slash-palette-card-top">
                <span className="slash-palette-command">{item.command}</span>
                <span className="slash-palette-title">{item.title}</span>
              </div>
              <p>{item.description}</p>
            </button>
          ))}
        </div>

        <footer className="slash-palette-footer">
          <span>Click to insert, double-click to run</span>
          <span>Type `/` to reopen anytime</span>
        </footer>
      </div>
    </div>
  );
}
