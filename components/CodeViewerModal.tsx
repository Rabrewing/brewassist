"use client";

import React, { useEffect, useState } from "react";

type CodeViewerModalProps = {
  filePath: string | null;
  onClose: () => void;
};

type FilePayload = {
  content: string;
};

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  filePath,
  onClose,
}) => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState("");

  useEffect(() => {
    if (!filePath) return;

    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/fs-read?path=${encodeURIComponent(filePath)}`
        );
        if (!res.ok) throw new Error(`fs-read ${res.status}`);
        const data: FilePayload = await res.json();
        setContent(data.content ?? "");
      } catch (e: any) {
        console.error("[CodeViewerModal] fs-read error", e);
        setError(e?.message ?? "Unable to load file");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [filePath]);

  if (!filePath) return null;

  const handleDownload = (format: "md" | "txt" | "docx" | "pdf") => {
    // TODO: Implement server-side export.
    console.log(`[CodeViewerModal] Download as ${format}`, filePath);
    alert(`Download as ${format} – to be wired to API later.`);
  };

  const handleSendToAssistant = () => {
    // TODO: Wire to BrewAssist / BrewTruth / NIM via API.
    console.log("[CodeViewerModal] Assistant prompt:", {
      filePath,
      assistantPrompt,
    });
    setAssistantPrompt("");
  };

  return (
    <div className="code-viewer-modal-backdrop">
      <div className="code-viewer-modal">
        {/* Header */}
        <div className="code-viewer-header">
          <div className="code-viewer-title">
            <span className="code-viewer-badge">Viewer</span>
            <span className="code-viewer-path">{filePath}</span>
          </div>
          <div className="code-viewer-actions">
            <button onClick={() => handleDownload("md")}>.md</button>
            <button onClick={() => handleDownload("txt")}>.txt</button>
            <button onClick={() => handleDownload("docx")}>Word</button>
            <button onClick={() => handleDownload("pdf")}>PDF</button>
            <button className="code-viewer-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="code-viewer-body">
          {loading && <div className="code-viewer-status">Loading…</div>}
          {error && (
            <div className="code-viewer-status error">
              Error loading file: {error}
            </div>
          )}
          {!loading && !error && (
            <pre className="code-viewer-pre">
              <code>{content}</code>
            </pre>
          )}
        </div>

        {/* Assistant Bar */}
        <div className="code-viewer-assistant-bar">
          <div className="assistant-meta">
            <span className="assistant-chip">BrewAssist</span>
            <span className="assistant-chip secondary">RB Mode</span>
            {/* Future: NIM Researcher, BrewTruth Mode chips */}
          </div>
          <div className="assistant-input-row">
            <button
              className="assistant-attach"
              type="button"
              // TODO: wire to file upload
            >
              +
            </button>
            <input
              className="assistant-input"
              placeholder="Ask BrewAssist about this file, request a patch, or send to BrewTruth…"
              value={assistantPrompt}
              onChange={(e) => setAssistantPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendToAssistant();
                }
              }}
            />
            <button
              className="assistant-send"
              type="button"
              onClick={handleSendToAssistant}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewerModal;