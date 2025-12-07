// components/BrewCockpitCenter.tsx
"use client";

import React, { useState } from "react";

type BrewAssistMode = 'hrm' | 'llm' | 'agent' | 'loop';

type LogEntry = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
};

const INITIAL_LOG: LogEntry[] = [
  {
    id: "system-1",
    role: "system",
    content:
      "[SYSTEM] Ready for /hrm, /llm, /agent, or sandbox runs. " +
      "This area will show BrewAssist narration and task status as we wire in the rest of the chain.",
  },
];

export const BrewCockpitCenter: React.FC = () => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [log, setLog] = useState<LogEntry[]>(INITIAL_LOG);
  const [activeMode, setActiveMode] = useState<BrewAssistMode>('llm');

  const appendToLog = (entry: Omit<LogEntry, "id">) => {
    setLog((prev) => [...prev, { ...entry, id: `${entry.role}-${Date.now()}` }]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Log the user message in the workspace log
    appendToLog({
      role: "user",
      content: trimmed,
    });
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/brewassist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          mode: activeMode, // "hrm" | "llm" | "agent" | "loop"
        }),
      });

      if (!res.ok) {
        appendToLog({
          role: "system",
          content: `[ERROR] Assist API returned ${res.status}`,
        });
        return;
      }

      const data: { reply?: string } = await res.json();

      appendToLog({
        role: "assistant",
        content: data.reply ?? "(no reply from BrewAssist)",
      });
    } catch (err) {
      console.error("[BrewAssist] send error", err);
      appendToLog({
        role: "system",
        content: "[ERROR] Assist API threw an exception (see console)",
      });
    }
    finally {
      setIsSending(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <section className="cockpit-center">
      <div className="cockpit-center-scroll">
        <div className="cockpit-main-inner">
          <div className="cockpit-workspace-card">
            <div className="cockpit-message-log">
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className={`log-line log-${entry.role}`}
                >
                  {entry.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cockpit-input-row">
        <textarea
          placeholder="Type /hrm, /llm, /agent or plain text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>

      <div className="cockpit-mode-row">
        <button
          type="button"
          className={`mode-tab ${activeMode === 'hrm' ? 'mode-tab--active' : ''}`}
          onClick={() => setActiveMode('hrm')}
        >
          HRM
        </button>

        <button
          type="button"
          className={`mode-tab ${activeMode === 'llm' ? 'mode-tab--active' : ''}`}
          onClick={() => setActiveMode('llm')}
        >
          LLM
        </button>

        <button
          type="button"
          className={`mode-tab ${activeMode === 'agent' ? 'mode-tab--active' : ''}`}
          onClick={() => setActiveMode('agent')}
        >
          Agent
        </button>

        <button
          type="button"
          className={`mode-tab ${activeMode === 'loop' ? 'mode-tab--active' : ''}`}
          onClick={() => setActiveMode('loop')}
        >
          Loop
        </button>
      </div>
    </section>
  );
};