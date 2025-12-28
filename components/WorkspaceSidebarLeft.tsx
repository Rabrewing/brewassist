// components/WorkspaceSidebarLeft.tsx
"use client";

import React, { useState } from "react";
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import { CAPABILITY_REGISTRY, RWX } from '@/lib/capabilities/registry'; // Import CAPABILITY_REGISTRY and RWX
import { evaluateHandshake, UnifiedPolicyEnvelope } from '@/lib/toolbelt/handshake'; // Import evaluateHandshake and UnifiedPolicyEnvelope
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { Persona, getActivePersona } from "@/lib/brewIdentityEngine"; // Import Persona and getActivePersona

interface McpButtonProps {
  capabilityId: string;
  label: string;
  smallText: string;
  onClick: () => void;
}

const McpButton: React.FC<McpButtonProps> = ({ capabilityId, label, smallText, onClick }) => {
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
      className={`mcp-button mcp-${policyEnvelope.ok ? 'allowed' : 'blocked'}`} // Simplified class
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
    >
      <span>{label}</span>
      <small>{smallText}</small>
      {policyEnvelope.requiresConfirm && <span className="mcp-badge">⚠</span>}
      {policyEnvelope.requiresSandbox && <span className="mcp-badge"> sandbox </span>}
    </button>
  );
};

export const WorkspaceSidebarLeft: React.FC = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const { tier } = useToolbelt(); // Consume from context
  const [activeMcpGuideId, setActiveMcpGuideId] = useState<string | null>(null);

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

      <McpButton
        capabilityId="fs_read" // Using fs_read as the primary capability for File Assistant
        label="File Assistant"
        smallText="Create, delete, move files"
        onClick={() => setActiveMcpGuideId('fileAssistant')}
      />

      <McpButton
        capabilityId="git_status" // Using git_status as the primary capability for Git Command Center
        label="Git Command Center"
        smallText="Add, commit, push, PR"
        onClick={() => setActiveMcpGuideId('gitCommandCenter')}
      />

      <McpButton
        capabilityId="db_read" // Using db_read as the primary capability for Database Assistant
        label="Database Assistant"
        smallText="Connect, migrate, schema"
        onClick={() => setActiveMcpGuideId('databaseAssistant')}
      />

      <McpButton
        capabilityId="research_web" // Using research_web as the primary capability for Research (NIMs)
        label="Research (NIMs)"
        smallText="Deep analysis, web research"
        onClick={() => setActiveMcpGuideId('researchNims')}
      />

      <McpButton
        capabilityId="/patch" // Using /patch command as the capability for Suggest Edits
        label="Suggest Edits"
        smallText="Ask BrewAssist for a patch"
        onClick={() => setActiveMcpGuideId('suggestEdits')}
      />

      {activeMcpGuideId && (
        <div className="mcp-guide-panel">
          <h3>{activeMcpGuideId} Guide</h3>
          <p>This is a placeholder for the guide text for {activeMcpGuideId}.</p>
          <p>Coming soon: Detailed explanations and interactive prompts.</p>
          <button onClick={() => setActiveMcpGuideId(null)}>Close Guide</button>
        </div>
      )}
    </div>
  );
};