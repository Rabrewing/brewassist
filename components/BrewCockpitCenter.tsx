import React, { useCallback, useEffect, useRef, useState } from "react";
import type { BrewTruthReport } from "@/lib/brewtruth"; // Import BrewTruthReport
import { ActionMenu } from "./ActionMenu";
import type { BrewAssistApiResponse } from "@/pages/api/brewassist";
import ReactMarkdown from "react-markdown";
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import type { ToolbeltBrewMode, ToolbeltTier } from '@/lib/toolbeltConfig'; // Import ToolbeltBrewMode and ToolbeltTier
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { CockpitModeToggle } from "./CockpitModeToggle";
import { CognitionState, assembleCognitionState, ReasoningMode, Intent, EmotionalState, RiskLevel } from "@/lib/brewCognition"; // Import CognitionState and assembleCognitionState
import { getActivePersona, Persona } from "@/lib/brewIdentityEngine"; // Import getActivePersona and Persona
import { HandshakeDecision } from "@/lib/toolbelt/handshake";

type UiMessageRole = "user" | "assistant" | "system";

interface UiMessage {
  id: string;
  role: UiMessageRole;
  content: string;
  truth?: BrewTruthReport | null; // Changed to BrewTruthReport
  blockedByTruth?: boolean;
  cognition?: CognitionState; // Add cognition state to message
}

const defaultSystemLine =
  "BrewAssist is online. Select HRM, LLM, Agent, or Loop, then send a prompt to begin.";

function makeId() {
  return `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const BrewCockpitCenter: React.FC = () => { // Removed props
  const { mode, setMode, tier, setTier } = useToolbelt(); // Consume from context
  const { mode: cockpitMode } = useCockpitMode();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<UiMessage[]>(() => [
    {
      id: "initial-system-message", // Use a static ID for the initial message
      role: "system",
      content: defaultSystemLine,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [cognitionState, setCognitionState] = useState<CognitionState | null>(null);
  const [cognitionPhase, setCognitionPhase] = useState<string>("Initializing BrewAssist...");
  const [lastError, setLastError] = useState<string | null>(null);
  const [nextUseDeepReasoning, setNextUseDeepReasoning] = useState(false);
  const [nextUseResearchModel, setNextUseResearchModel] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(logRef.current); // Use logRef for chatContainerRef
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 1 && bottomRef.current && autoScrollEnabled) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length, autoScrollEnabled]);

  // S4.9c.1: Handle manual scrolling to disable/enable auto-scroll
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const el = chatContainerRef.current;
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

    if (distanceFromBottom > 120) {
      setAutoScrollEnabled(false);
    } else {
      setAutoScrollEnabled(true);
    }
  }, []);

  const handleSend = useCallback(async (overridePayload?: any) => {
    const currentInput = overridePayload?.input || input;
    const trimmed = currentInput.trim();
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
    setCognitionPhase("Evaluating request..."); // Initial cognition phase
    setCognitionState(null); // Reset cognition state

    // S4.9c.1: Ensure auto-scroll is enabled on send
    setAutoScrollEnabled(true);

    try {
      const payload = {
        input: trimmed,
        mode,
        tier, // Pass tier from context
        skillLevel: "intermediate", // temp, will be wired from /init later
        useDeepReasoning: nextUseDeepReasoning,
        useResearchModel: nextUseResearchModel,
        ...overridePayload,
      };

      // Simulate cognition phases
      setCognitionPhase("Interpreting intent and authority...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

      setCognitionPhase("Checking safety and permissions...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

      const res = await fetch("/api/brewassist", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-brewassist-mode": cockpitMode },
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

      const data: BrewAssistApiResponse = await res.json().catch(() => ({}));

      if (!data.ok) {
        const errLine = data.error || "BrewAssist encountered an unknown error.";
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

      setCognitionPhase("Selecting reasoning strategy...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

      const content = data.text ?? "BrewAssist responded, but no content was returned from the engine.";
      const truth = data.truth ?? null;
      const blockedByTruth = data.blockedByTruth ?? false;
      const handshakeDecision: HandshakeDecision = data.policy || "ALLOW"; // Get handshake decision

      // Assemble cognition state
      const currentPersona: Persona['id'] = getActivePersona().id; // Get active persona ID
      const inferredIntent: Intent = trimmed; // Placeholder, will be inferred later
      const currentReasoningMode: ReasoningMode = mode as ReasoningMode; // Cast mode to ReasoningMode

      const assembledCognitionState = assembleCognitionState(
        currentPersona,
        cockpitMode,
        tier,
        inferredIntent,
        currentReasoningMode,
        truth,
        handshakeDecision
      );
      setCognitionState(assembledCognitionState);

      setCognitionPhase("Preparing response...");
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

      if (blockedByTruth && payload.dangerousAction) {
        setPendingAction({ payload, truth });
        setShowConfirmationModal(true);
        setIsThinking(false);
        return;
      }

      const assistantMsg: UiMessage = {
        id: makeId(),
        role: "assistant",
        content: content.trim(),
        truth: truth,
        blockedByTruth: blockedByTruth,
        cognition: assembledCognitionState, // Attach cognition state to message
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
      setCognitionPhase("BrewAssist ready."); // Reset cognition phase
      setCognitionState(null); // Clear cognition state after response
      // reset one-shot flags
      setNextUseDeepReasoning(false);
      setNextUseResearchModel(false);
    }
  }, [input, mode, tier, isThinking, nextUseDeepReasoning, nextUseResearchModel, cockpitMode]); // Add cockpitMode to dependencies

  const handleForceRun = useCallback(() => {
    if (pendingAction) {
      const newPayload = { ...pendingAction.payload, dangerousAction: false };
      void handleSend(newPayload);
      setShowConfirmationModal(false);
      setPendingAction(null);
    }
  }, [pendingAction, handleSend]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmationModal(false);
    setPendingAction(null);
  }, []);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const applyMarkdownFormat = useCallback((format: "bold" | "italic" | "h1" | "h2" | "bullet" | "code") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = input ?? "";
    const selected = value.slice(start, end);

    let before = value.slice(0, start);
    let after = value.slice(end);
    let nextValue = value;
    let insert = "";

    switch (format) {
      case "bold":
        insert = selected ? `**${selected}**` : `**bold text**`;
        break;
      case "italic":
        insert = selected ? `*${selected}*` : `*italic text*`;
        break;
      case "h1":
        insert = selected ? `# ${selected}` : `# Heading 1`;
        break;
      case "h2":
        insert = selected ? `## ${selected}` : `## Heading 2`;
        break;
      case "bullet":
        insert = selected
          ? selected
              .split("\n")
              .map((line) => (line.trim() ? `- ${line.trim()}` : ""))
              .join("\n")
          : "- list item";
        break;
      case "code":
        insert = selected ? `\`${selected}\`` : "`code`";
        break;
    }

    nextValue = before + insert + after;
    setInput(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = before.length + insert.length;
      textarea.selectionStart = textarea.selectionEnd = cursorPos;
    });
  }, [input]);

  const renderBubble = (msg: UiMessage) => {
    const isUser = msg.role === "user";
    const isAssistant = msg.role === "assistant";
    const isSystem = msg.role === "system";

    let lineClass = "log-system";
    if (isUser) lineClass = "log-user";
    if (isAssistant) lineClass = "log-assistant";

    let truthBadge = null;
    // Only show truthBadge in admin mode
    if (cockpitMode === 'admin' && isAssistant && msg.truth) { // Add cockpitMode check
      const truthScore = Math.round(msg.truth.overallScore * 100); // Changed from truthScore to overallScore
      let badgeClass = "truth-badge";
      let riskLevelDisplay: RiskLevel = "Low"; // Default for display
      let emotionalStateDisplay: EmotionalState = "Neutral";

      if (msg.cognition) {
        riskLevelDisplay = msg.cognition.riskLevel;
        emotionalStateDisplay = msg.cognition.emotionalState;
      } else {
        // Fallback if cognition state is not available (e.g., old messages)
        switch (msg.truth.tier) { // Changed from riskLevel to tier
          case "gold":
          case "silver":
            riskLevelDisplay = "Low";
            emotionalStateDisplay = "Confident";
            break;
          case "bronze":
            riskLevelDisplay = "Moderate";
            emotionalStateDisplay = "Cautious";
            break;
          case "red":
            riskLevelDisplay = "Critical";
            emotionalStateDisplay = "Uncertain";
            break;
          default:
            riskLevelDisplay = "Low"; // Fallback
            emotionalStateDisplay = "Neutral";
            break;
        }
      }

      switch (riskLevelDisplay) {
        case "Low":
          badgeClass += " truth-badge--low";
          break;
        case "Moderate":
          badgeClass += " truth-badge--medium";
          break;
        case "High":
        case "Critical":
          badgeClass += " truth-badge--high";
          break;
      }
      
      truthBadge = (
        <div className={badgeClass}>
          Confidence: {truthScore}% · Risk: {riskLevelDisplay} · State: {emotionalStateDisplay}
        </div>
      );
    }

    return (
      <div key={msg.id} className={`log-line ${lineClass}`}>
        <div className="cosmic-bubble">
          <div className="bubble-content">
            <ReactMarkdown>{msg.content || ""}</ReactMarkdown>
          </div>
          {truthBadge}
          {cockpitMode === 'admin' && msg.cognition && (
            <div className="cognition-summary">
              <p><strong>Cognition Summary:</strong></p>
              <ul>
                <li>Persona: {msg.cognition.persona}</li>
                <li>Emotional State: {msg.cognition.emotionalState}</li>
                <li>User Role: {msg.cognition.userRole}</li>
                <li>Toolbelt Tier: {msg.cognition.toolbeltTier}</li>
                <li>Intent: {msg.cognition.intent}</li>
                <li>Reasoning Mode: {msg.cognition.reasoningMode}</li>
                <li>Risk Level: {msg.cognition.riskLevel}</li>
                <li>Execution Permission: {msg.cognition.executionPermission as unknown as string}</li>
                <li>Truth Validation: {msg.cognition.truthValidationStatus}</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const lastAssistantMessage = messages
    .filter((msg) => msg.role === "assistant")
    .pop();

  return (
    <div className="cockpit-center">
      <div className="cockpit-center-scroll" onScroll={handleScroll}>
        <div className="cockpit-message-log" ref={logRef}>
          {messages.map(renderBubble)}

          {isThinking && (
            <div className="log-line log-assistant">
              <div className="cosmic-bubble">
                <span className="brewassist-thinking-dot" /> {cognitionPhase}
                {cockpitMode === 'admin' && cognitionState && (
                  <div className="cognition-summary">
                    <p><strong>Current Cognition:</strong></p>
                    <ul>
                      <li>Persona: {cognitionState.persona}</li>
                      <li>Emotional State: {cognitionState.emotionalState}</li>
                      <li>User Role: {cognitionState.userRole}</li>
                      <li>Toolbelt Tier: {cognitionState.toolbeltTier}</li>
                      <li>Intent: {cognitionState.intent}</li>
                      <li>Reasoning Mode: {cognitionState.reasoningMode}</li>
                      <li>Risk Level: {cognitionState.riskLevel}</li>
                      <li>Execution Permission: {cognitionState.executionPermission as unknown as string}</li>
                      <li>Truth Validation: {cognitionState.truthValidationStatus}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="brew-input-area">
        <div className="cockpit-format-toolbar">
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat("bold")}
          >
            B
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat("italic")}
          >
            I
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat("h1")}
          >
            H1
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat("h2")}
          >
            H2
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat("bullet")}
            >
            •
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat("code")}
          >
            {"</>"}
          </button>
        </div>

        <div className="cockpit-input-row">
          <ActionMenu
            onUploadFile={(files, dangerousAction) => {
              console.log("Uploaded files", files);
              void handleSend({ input: `Uploaded ${files[0].name}`, dangerousAction: dangerousAction });
            }}
            onSelectDeepReasoning={() => setNextUseDeepReasoning(true)}
            onSelectNimsResearch={() => setNextUseResearchModel(true)}
            onUploadImage={() => console.log("Upload Image / Screenshot clicked")}
            onTakePhoto={() => console.log("Take Photo (Camera) clicked")}
            onImportFromGoogleDrive={() => console.log("Import from Google Drive clicked")}
          />
          <textarea
            ref={textareaRef}
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

                                      <div className="cockpit-hud">

                                        {cockpitMode === 'admin' ? (

                                          <span className="hud-badge admin-mode">Admin Mode · Sandbox available</span>

                                        ) : (

                                          <span className="hud-badge customer-mode">Customer Mode · Sandbox locked (internal only)</span>

                                        )}

                                      </div>

                                    </div>

          

                <div className="cockpit-mode-row">

                  {(["HRM", "LLM", "AGENT", "LOOP"] as ToolbeltBrewMode[]).map( // Use ToolbeltBrewMode

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
        <div className="brew-tier-selector">
          <span className="brew-tier-badge">
            Toolbelt: Tier {tier.replace('T', '').replace('_SAFE', '').replace('_GUIDED', '').replace('_POWER', '')}
          </span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as ToolbeltTier)}
            className="brew-tier-dropdown"
          >
            <option value="T1_SAFE">Tier 1 — Safe</option>
            <option value="T2_GUIDED">Tier 2 — Guided</option>
            <option value="T3_POWER">Tier 3 — Power</option>
          </select>
        </div>
        <CockpitModeToggle />
      </div>

      {}

      {showConfirmationModal && pendingAction && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <p className="confirmation-modal-message">
              ⚠ BrewTruth is not confident this is safe.
              Truth score: {Math.round(pendingAction.truth.truthScore * 100)}% · Risk: {pendingAction.truth.riskLevel}.
              Are you sure you want to proceed?
            </p>
            <div className="confirmation-modal-actions">
              <button onClick={handleCancelConfirmation} className="confirmation-modal-button confirmation-modal-button--cancel">
                Cancel
              </button>
              <button onClick={handleForceRun} className="confirmation-modal-button confirmation-modal-button--force">
                Force run anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};