// components/SandboxPanel.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCockpitMode } from '@/contexts/CockpitModeContext';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';

export const SandboxPanel: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const { orgId, workspaceId, organizations, workspaces } =
    useEnterpriseSelection();
  
  const [providers, setProviders] = useState<any>(null);
  
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('/api/models/available');
        const data = await res.json();
        if (data.providers) {
          setProviders(data.providers);
        }
      } catch (err) {
        console.error('Failed to fetch available models:', err);
      }
    };
    void fetchModels();
  }, []);
  
  const availableModels = useMemo(() => {
    if (!providers) return [{ id: 'tinyllm', label: 'TinyLLAMA (local)' }];
    
    const list = [];
    if (providers.openai?.enabled) list.push({ id: 'openai', label: 'GPT-4o (Enterprise)' });
    if (providers.gemini?.enabled) list.push({ id: 'gemini', label: 'Gemini 1.5 Pro' });
    if (providers.mistral?.enabled) list.push({ id: 'mistral', label: 'Mistral Large' });
    if (providers.nims?.enabled) list.push({ id: 'nims', label: 'Nvidia NIMs' });
    list.push({ id: 'tinyllm', label: 'TinyLLAMA (local)' });
    return list;
  }, [providers]);

  const [model, setModel] = useState('tinyllm');
  
  // Update selection if the list changes and current selection is gone
  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.find(m => m.id === model)) {
      setModel(availableModels[0].id);
    }
  }, [availableModels, model]);

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
          {availableModels.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
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
