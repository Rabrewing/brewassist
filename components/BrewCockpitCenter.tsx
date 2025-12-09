// components/BrewCockpitCenter.tsx

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { BrewAssistMode } from "@/lib/brewassist-engine";
import { ActionMenu } from "./ActionMenu";

type UiMessageRole = "user" | "assistant" | "system";

interface UiMessage {
  id: string;
  role: UiMessageRole;
  content: string;
}

const defaultSystemLine =
  "BrewAssist is online. Select HRM, LLM, Agent, or Loop, then send a prompt to begin.";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const BrewCockpitCenter: React.FC = () => {
  const [mode, setMode] = useState<BrewAssistMode>("llm");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: makeId(),
      role: "system",
      content: defaultSystemLine,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [nextUseDeepReasoning, setNextUseDeepReasoning] = useState(false);
  const [nextUseResearchModel, setNextUseResearchModel] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    setLastError(null);

    const userMsg: UiMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const payload = {
        input: trimmed,
        mode,
        skillLevel: "intermediate", // temp, will be wired from /init later
        useDeepReasoning: nextUseDeepReasoning,
        useResearchModel: nextUseResearchModel,
      };

      const res = await fetch("/api/brewassist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("BrewAssist API error:", res.status, text);
        const errLine =
          "BrewAssist encountered an error while processing this request. Check the logs or try again.";
        setLastError(errLine);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "system",
            content: errLine,
          },
        ]);
        return;
      }

      const data: any = await res.json().catch(() => ({}));

      // Try multiple shapes for safety
      const fromMessage = data?.message;
      const fromArray = Array.isArray(data?.messages)
        ? data.messages[0]
        : null;

      const content =
        data?.content ??
        data?.text ??
        fromMessage?.content ??
        fromArray?.content ??
        "";

      const assistantText =
        typeof content === "string" && content.trim().length > 0
          ? content.trim()
          : "BrewAssist responded, but no content was returned from the engine.";

      const assistantMsg: UiMessage = {
        id: makeId(),
        role: "assistant",
        content: assistantText,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("BrewAssist fetch error:", err);
      const errLine =
        "BrewAssist hit a network issue or the server restarted. Please try again.";
      setLastError(errLine);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "system",
          content: errLine,
        },
      ]);
    } finally {
      setIsThinking(false);
      // reset one-shot flags
      setNextUseDeepReasoning(false);
      setNextUseResearchModel(false);
    }
  }, [input, mode, isThinking, nextUseDeepReasoning, nextUseResearchModel]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const renderBubble = (msg: UiMessage) => {
    const isUser = msg.role === "user";
    const isAssistant = msg.role === "assistant";
    const isSystem = msg.role === "system";

    let lineClass = "log-system"; // Renamed from bubbleClass to lineClass for clarity
    if (isUser) lineClass = "log-user";
    if (isAssistant) lineClass = "log-assistant";

    return (
      <div key={msg.id} className={`log-line ${lineClass}`}>
        <div className="cosmic-bubble">{msg.content}</div>
      </div>
    );
  };

  return (
    <div className="cockpit-center">
      <div className="cockpit-center-scroll">
        {/* Message log */}
        <div className="cockpit-message-log" ref={scrollRef}>
          {messages.map(renderBubble)}

          {isThinking && (
            <div className="log-line log-assistant">
              <div className="cosmic-bubble">
                <span className="brewassist-thinking-dot" /> BrewAssist is
                thinking…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input row */}
      <div className="cockpit-input-row">
        <ActionMenu
          onUploadFile={(files) => {
            // TODO: implement file upload → BrewAssist
            console.log("Uploaded files", files);
          }}
          onSelectDeepReasoning={() => setNextUseDeepReasoning(true)}
          onSelectNimsResearch={() => setNextUseResearchModel(true)}
        />
        <textarea
          className="workspace-input"
          placeholder="Ask BrewAssist to help with a task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="workspace-send-button"
          onClick={() => void handleSend()}
          disabled={!input.trim() || isThinking}
        >
          Send
        </button>
      </div>

      {/* Mode tabs */}
      <div className="cockpit-mode-row">
        {(["hrm", "llm", "agent", "loop"] as BrewAssistMode[]).map(
          (m) => (
            <button
              key={m}
              className={`mode-tab ${
                mode === m ? "mode-tab--active" : ""
              }`}
              onClick={() => setMode(m)}
            >
              {m.toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* Optional error hint */}
      {lastError && (
        <div className="cockpit-error-hint">
          {lastError}
        </div>
      )}
    </div>
  );
};