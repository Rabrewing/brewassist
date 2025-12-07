// components/SandboxPanel.tsx
"use client";

import React, { useState } from "react";

export const SandboxPanel: React.FC = () => {
  const [model, setModel] = useState("TinyLLAMA (local)");
  const [prompt, setPrompt] = useState("");

  return (
    <div className="sandbox-card">
      <div className="sandbox-header">
        <span className="sandbox-title">AI SANDBOX</span>
      </div>

      <label className="sandbox-label">
        Model
        <select
          className="sandbox-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="TinyLLAMA (local)">TinyLLAMA (local)</option>
          {/* Add OpenAI / Gemini / Mistral later */}
        </select>
      </label>

      <textarea
        className="sandbox-input"
        placeholder="Run a raw prompt without BrewAssist tone…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="sandbox-footer-row">
        <label className="sandbox-checkbox-label">
          <input type="checkbox" />
          BrewTruth Mode (cold audit)
        </label>
        <button className="sandbox-run-button">Run Sandbox</button>
      </div>
    </div>
  );
};