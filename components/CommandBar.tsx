// components/CommandBar.tsx
'use client';

import { useCallback, useEffect } from 'react';
import { useGuide } from '@/contexts/GuideContext';

type CommandBarProps = {
  onSend?: (input: string) => void;
  onCancel?: () => void;
  isThinking?: boolean;
  getLastUserPrompt?: () => string | undefined;
  value: string;
  setValue: (value: string) => void;
};

export default function CommandBar({
  onSend,
  onCancel,
  isThinking,
  getLastUserPrompt,
  value,
  setValue,
}: CommandBarProps) {
  const { setIsGuideOpen } = useGuide();

  const send = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (!input) return;

      if (onSend) {
        onSend(input);
      } else if (typeof (window as any).brewSend === 'function') {
        (window as any).brewSend(input);
      }
    },
    [onSend]
  );

  useEffect(() => {
    (window as any).brewSend = send;
  }, [send]);

  const recallLast = useCallback(() => {
    if (!getLastUserPrompt) return;
    const last = getLastUserPrompt();
    if (last) setValue(last);
  }, [getLastUserPrompt, setValue]);

  return (
    <div className="cockpit-command-bar">
      <div className="angelic-input-shell">
        <button
          type="button"
          className="angelic-recall"
          onClick={recallLast}
          title="Edit & resend last prompt"
        >
          ↑
        </button>

        <input
          className="angelic-input"
          placeholder="Type /hrm, /llm, /agent or plain text…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(value);
            }
            if (e.key === 'ArrowUp' && !value) {
              e.preventDefault();
              recallLast();
            }
          }}
          disabled={isThinking}
        />

        <button
          type="button"
          className="angelic-send"
          onClick={() => send(value)}
          disabled={isThinking}
        >
          {isThinking ? '…' : '✨ Send'}
        </button>

        {isThinking && (
          <button type="button" className="angelic-cancel" onClick={onCancel}>
            ⏹️ Cancel
          </button>
        )}

        <button
          type="button"
          className="angelic-help"
          onClick={() => setIsGuideOpen(true)}
        >
          ❓ Help
        </button>
      </div>

      {/* Cosmic HRM / LLM / Agent / Loop tabs – all route through /api/brewassist for now */}
      <div className="angelic-tab-row">
        <button
          type="button"
          className="angelic-tab"
          onClick={() =>
            send('/hrm Give me a quick strategic status on BrewExec.')
          }
        >
          <div className="angelic-tab-title">HRM</div>
          <div className="angelic-tab-sub">Strategy Mind</div>
        </button>

        <button
          type="button"
          className="angelic-tab"
          onClick={() =>
            send('/llm Summarize the last BrewExec change in one paragraph.')
          }
        >
          <div className="angelic-tab-title">LLM</div>
          <div className="angelic-tab-sub">OpenAI Stack</div>
        </button>

        <button
          type="button"
          className="angelic-tab"
          onClick={() =>
            send('/agent Plan my next 3 actions inside BrewAssist.')
          }
        >
          <div className="angelic-tab-title">Agent</div>
          <div className="angelic-tab-sub">Delegation</div>
        </button>

        <button
          type="button"
          className="angelic-tab"
          onClick={() =>
            send('/loop Start a commentary loop for this session.')
          }
        >
          <div className="angelic-tab-title">Loop</div>
          <div className="angelic-tab-sub">Narration</div>
        </button>
      </div>
    </div>
  );
}
