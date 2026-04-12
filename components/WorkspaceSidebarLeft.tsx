// components/WorkspaceSidebarLeft.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import { CAPABILITY_REGISTRY } from '@/lib/capabilities/registry'; // Import CAPABILITY_REGISTRY
import { evaluateHandshake } from '@/lib/toolbelt/handshake'; // Import evaluateHandshake
import { useCockpitMode } from '@/contexts/CockpitModeContext';
import { getActivePersona } from '@/lib/brewIdentityEngine'; // Import getActivePersona

interface McpButtonProps {
  capabilityId: string;
  label: string;
  smallText: string;
  helperSummary: string;
  onClick: () => void;
}

const McpButton: React.FC<McpButtonProps> = ({
  capabilityId,
  label,
  smallText,
  helperSummary,
  onClick,
}) => {
  const { tier } = useToolbelt(); // Get tier from ToolbeltContext
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from CockpitModeContext
  const persona = getActivePersona(); // Get full Persona object

  const policyEnvelope = evaluateHandshake({
    intent: CAPABILITY_REGISTRY[capabilityId].intentCategory, // Use intentCategory from registry
    tier,
    persona,
    cockpitMode,
    capabilityId,
    action: CAPABILITY_REGISTRY[capabilityId].rwx, // Pass RWX action if defined
  });

  const disabled = !policyEnvelope.ok && !policyEnvelope.requiresConfirm;
  const tooltip = policyEnvelope.reason;

  return (
    <button
      className={`mcp-button mcp-${policyEnvelope.ok ? 'allowed' : 'blocked'} ${policyEnvelope.requiresConfirm ? 'mcp-button--confirm' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      <span className="mcp-button-title-row">
        <span className="mcp-button-title">{label}</span>
        <span className="mcp-button-helper">{helperSummary}</span>
      </span>
      <small>{smallText}</small>
      <span className="mcp-button-meta-row">
        <span className="mcp-button-chip">
          {policyEnvelope.ok ? 'Ready' : 'Policy'}
        </span>
        {policyEnvelope.requiresConfirm && (
          <span className="mcp-badge">Confirm</span>
        )}
        {policyEnvelope.requiresSandbox && (
          <span className="mcp-badge">Sandbox</span>
        )}
      </span>
    </button>
  );
};

type SidebarAction = {
  capabilityId: string;
  label: string;
  smallText: string;
  helperSummary: string;
  section: string;
};

const ACTION_GROUPS: Array<{
  title: string;
  description: string;
  actions: SidebarAction[];
}> = [
  {
    title: 'Workspace',
    description: 'Files, trees, and repo-local navigation.',
    actions: [
      {
        capabilityId: 'fs_read',
        label: 'File Assistant',
        smallText: 'Read, inspect, and route file tasks',
        helperSummary: 'Mirror-aware',
        section: 'workspace',
      },
    ],
  },
  {
    title: 'Repository',
    description: 'Git operations and source control hygiene.',
    actions: [
      {
        capabilityId: 'git_status',
        label: 'Git Command Center',
        smallText: 'Status, diff, commit, push, PR',
        helperSummary: 'Repo-scoped',
        section: 'repository',
      },
    ],
  },
  {
    title: 'Data',
    description: 'Schema reads, validation, and change review.',
    actions: [
      {
        capabilityId: 'db_read',
        label: 'Database Assistant',
        smallText: 'Connect, migrate, inspect schema',
        helperSummary: 'Policy-gated',
        section: 'data',
      },
    ],
  },
  {
    title: 'Validation',
    description: 'Research, confidence, and patch suggestions.',
    actions: [
      {
        capabilityId: 'research_web',
        label: 'Research (NIMs)',
        smallText: 'Deep analysis and web validation',
        helperSummary: 'Confidence',
        section: 'validation',
      },
      {
        capabilityId: '/patch',
        label: 'Suggest Edits',
        smallText: 'Ask BrewAssist for a patch',
        helperSummary: 'Review first',
        section: 'validation',
      },
    ],
  },
];

export const WorkspaceSidebarLeft: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const { tier } = useToolbelt(); // Consume from context
  const [activeMcpGuideId, setActiveMcpGuideId] = useState<string | null>(null);

  const activeAction = useMemo(() => {
    return ACTION_GROUPS.flatMap((group) => group.actions).find(
      (action) => action.capabilityId === activeMcpGuideId
    );
  }, [activeMcpGuideId]);

  const activePolicy = activeAction
    ? evaluateHandshake({
        intent: CAPABILITY_REGISTRY[activeAction.capabilityId].intentCategory,
        tier,
        persona: getActivePersona(),
        cockpitMode,
        capabilityId: activeAction.capabilityId,
        action: CAPABILITY_REGISTRY[activeAction.capabilityId].rwx,
      })
    : null;

  // getMcpPermission is no longer needed
  // In customer mode, MCP tools are visible but execution is blocked.
  // The individual McpButton components will handle their disabled state
  // based on permissions from the ToolbeltContext.

  return (
    <div className="mcp-sidebar">
      <div className="mcp-header">
        <span className="mcp-logo">MCP</span>
        <span className="mcp-title">Tools</span>
      </div>

      <div className="mcp-summary-card">
        <span className="mcp-summary-kicker">Operator Pane</span>
        <div className="mcp-summary-grid">
          <div>
            <span className="mcp-summary-label">Mode</span>
            <strong>{cockpitMode}</strong>
          </div>
          <div>
            <span className="mcp-summary-label">Tier</span>
            <strong>{tier.toUpperCase()}</strong>
          </div>
        </div>
        <p className="mcp-summary-copy">
          Select a capability to inspect the policy gate, sandbox requirement,
          and next step.
        </p>
      </div>

      {ACTION_GROUPS.map((group) => (
        <section key={group.title} className="mcp-section">
          <div className="mcp-section-header">
            <div className="mcp-section-title">{group.title}</div>
            <div className="mcp-section-description">{group.description}</div>
          </div>

          <div className="mcp-section-actions">
            {group.actions.map((action) => (
              <McpButton
                key={action.capabilityId}
                capabilityId={action.capabilityId}
                label={action.label}
                smallText={action.smallText}
                helperSummary={action.helperSummary}
                onClick={() => setActiveMcpGuideId(action.capabilityId)}
              />
            ))}
          </div>
        </section>
      ))}

      {activeMcpGuideId && (
        <div className="mcp-guide-panel">
          <div className="mcp-guide-header">
            <h3>{activeAction?.label ?? activeMcpGuideId} Helper</h3>
            <span className="mcp-guide-badge">
              {activePolicy?.ok ? 'Ready' : 'Policy Gate'}
            </span>
          </div>
          <p>
            {activeAction?.smallText ??
              'This panel explains the action, the policy gate, and the next step.'}
          </p>
          <p>
            {activePolicy?.reason ||
              'Keep this compact: explain the action, show the risk, and point to a real task or preview.'}
          </p>
          <div className="mcp-guide-meta-row">
            {activePolicy?.requiresConfirm && (
              <span className="mcp-guide-chip">Confirm required</span>
            )}
            {activePolicy?.requiresSandbox && (
              <span className="mcp-guide-chip">Sandbox required</span>
            )}
            {activePolicy?.ok ? (
              <span className="mcp-guide-chip mcp-guide-chip--ok">
                Policy ready
              </span>
            ) : (
              <span className="mcp-guide-chip mcp-guide-chip--warn">
                Policy locked
              </span>
            )}
          </div>
          <button
            className="mcp-guide-close"
            onClick={() => setActiveMcpGuideId(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
