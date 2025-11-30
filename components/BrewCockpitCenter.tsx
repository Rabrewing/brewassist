// components/BrewCockpitCenter.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getBrewEnv } from '@/lib/brewConfig';
import CommandBar from './CommandBar';
import { BREW_MODE_PROFILES, BrewModeProfile } from '@/lib/brewModes';
import { BrewTruthDecision } from '@/lib/brewTruthGateway';
import { BrewTruthResult } from '@/lib/brewtruth';
import type { BrewAssistApiResponse } from '@/pages/api/brewassist';

const brewEnv = getBrewEnv();

interface Message {
  role: 'user' | 'assistant';
  content: string;
  meta?: {
    engine?: string;
    mode?: string;
    decision?: BrewTruthDecision;
    truth?: BrewTruthResult;
    autoProceeded?: boolean;
  };
}

export default function BrewCockpitCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | undefined>();
  const [currentModeProfile, setCurrentModeProfile] = useState<BrewModeProfile>(
    BREW_MODE_PROFILES.rb
  ); // Default to RB Mode for now

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ---------- helpers ----------

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
    if (message.role === 'assistant') {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}][${
          message.meta?.engine || 'system'
        }] ${message.content}`,
      ]);
    }
  }, []);

  const getLastUserPrompt = useCallback(() => lastUserPrompt, [lastUserPrompt]);

  const sendPrompt = useCallback(
    async (input: string) => {
      const text = `${input ?? ''}`.trim();
      if (!text) return;

      // user bubble
      const userMsg: Message = { role: 'user', content: text };
      appendMessage(userMsg);
      setLastUserPrompt(text);
      setValue('');

      // cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsThinking(true);

      try {
        const res = await fetch('/api/brewassist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text, userId: 'default_user' }), // Pass userId for mode resolution
          signal: controller.signal,
        });

        const data: BrewAssistApiResponse = await res
          .json()
          .catch(() => ({}) as any);

        const content =
          data.output ??
          data.narrative ??
          (data.plan && data.plan.llm) ??
          data.error ??
          '⚠️ No response.';

        const bubble = `${
          data.emoji ? data.emoji + ' ' : ''
        }${String(content)}`;

        // Update current mode profile based on response
        if (data.mode && BREW_MODE_PROFILES[data.mode]) {
          setCurrentModeProfile(BREW_MODE_PROFILES[data.mode]);
        }

        appendMessage({
          role: 'assistant',
          content: bubble,
          meta: {
            engine: data.engine || 'chatgpt',
            mode: data.mode || 'auto',
            decision: data.decision,
            truth: data.truth,
            autoProceeded: data.autoProceeded,
          },
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          appendMessage({
            role: 'assistant',
            content: '⏹️ Request cancelled.',
            meta: { engine: 'system', mode: 'cancelled' },
          });
        } else {
          console.error(err);
          appendMessage({
            role: 'assistant',
            content:
              '❌ Error talking to BrewAssist. Please check the server logs.',
            meta: { engine: 'system', mode: 'error' },
          });
        }
      } finally {
        setIsThinking(false);
      }
    },
    [appendMessage]
  );

  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setIsThinking(false);
  }, []);

  // expose global for sidebars / tools
  useEffect(() => {
    (window as any).brewSend = sendPrompt;
  }, [sendPrompt]);

  // auto-scroll on new messages – **no appendMessage here**
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="brew-center">
      <h1 className="cockpit-title">
        BrewAssist DevOps Cockpit · {brewEnv.activeProject.toUpperCase()}
        <span className="cockpit-tier">
          {brewEnv.emoji} {brewEnv.tier} · primary: {brewEnv.primaryModel} ·
          fallback: {brewEnv.fallbackModel} · local: {brewEnv.localModel}
        </span>
      </h1>

      <div className="cockpit-mode-banner">
        <span className="mode-label">Mode: {currentModeProfile.label}</span>
        <span className="mode-description">
          {currentModeProfile.description}
        </span>
      </div>

      <div className="cockpit-model-banner">
        <span>🎛️ Active stack:</span>
        <span>Primary · {brewEnv.primaryModel}</span>
        <span>Fallback · {brewEnv.fallbackModel}</span>
        <span>Local · {brewEnv.localModel}</span>
      </div>

      {/* Chat Pane */}
      <div ref={scrollRef} className="brew-chat-pane">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'msg-user' : 'msg-brew'}>
            {m.content}
          </div>
        ))}
        {isThinking && (
          <div className="msg-brew msg-thinking">
            ✨ BrewAssist is thinking…
          </div>
        )}
      </div>

      {/* Log Pane */}
      <div className="brew-log-pane">
        <div className="log-title">Workspace Log</div>
        <div className="log-scroll">
          {logs.map((l, i) => (
            <div key={i} className="log-line">
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Command Bar */}
      <CommandBar
        onSend={sendPrompt}
        onCancel={handleCancel}
        isThinking={isThinking}
        getLastUserPrompt={getLastUserPrompt}
        value={value}
        setValue={setValue}
      />
    </div>
  );
}
