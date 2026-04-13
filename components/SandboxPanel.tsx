// components/SandboxPanel.tsx
'use client';

import React, { useState } from 'react';
import { useCockpitMode } from '@/contexts/CockpitModeContext';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';

export const SandboxPanel: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const { orgId, workspaceId, organizations, workspaces } =
    useEnterpriseSelection();
  const [model, setModel] = useState('TinyLLAMA (local)');
  const [prompt, setPrompt] = useState('');

  if (cockpitMode === 'customer') {
    return null;
  }

  const selectedOrg = organizations.find((item) => item.id === orgId) ?? null;
  const selectedWorkspace =
    workspaces.find((item) => item.id === workspaceId) ?? null;

  const handleRunSandbox = async () => {
    const payload = {
      prompt,
      engine: model,
    };

    await fetch('/api/sandbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-brewassist-mode': cockpitMode,
      },
      body: JSON.stringify(payload),
    });
  };

  return (
    <div className="sandbox-card">
      <div className="sandbox-header">
        <span className="sandbox-title">AI SANDBOX</span>
        <span className="sandbox-scope">
          {selectedOrg?.name ?? 'Org'} /{' '}
          {selectedWorkspace?.name ?? 'Workspace'}
        </span>
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
        <button className="sandbox-run-button" onClick={handleRunSandbox}>
          Run Sandbox
        </button>
      </div>
    </div>
  );
};
