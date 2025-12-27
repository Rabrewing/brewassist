// components/WorkspaceSidebarLeft.tsx
"use client";

import React, { useState } from "react";
import FileWizard from "./mcp/FileWizard";
import GitWizard from "./mcp/GitWizard";
import DatabaseWizard from "./mcp/DatabaseWizard";
import ResearchWizard from "./mcp/ResearchWizard";
import McpWizardModal from "./mcp/McpWizardModal";
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import { CAPABILITY_REGISTRY, CapabilityId, RWX } from '@/lib/capabilities/registry'; // Import CAPABILITY_REGISTRY and CapabilityId
import { evaluateHandshake, UnifiedPolicyEnvelope } from '@/lib/toolbelt/handshake'; // Import evaluateHandshake and UnifiedPolicyEnvelope
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import { Persona } from "@/lib/brewIdentityEngine"; // Import Persona

interface McpButtonProps {
  capabilityId: CapabilityId;
  label: string;
  smallText: string;
  onClick: () => void;
}

const McpButton: React.FC<McpButtonProps> = ({ capabilityId, label, smallText, onClick }) => {
  const { tier, persona } = useToolbelt(); // Get tier and persona from ToolbeltContext
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from CockpitModeContext

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
  const { tier, persona } = useToolbelt(); // Consume from context
  const [fileWizardOpen, setFileWizardOpen] = useState(false);
  const [gitWizardOpen, setGitWizardOpen] = useState(false);
  const [dbWizardOpen, setDbWizardOpen] = useState(false);
  const [researchWizardOpen, setResearchWizardOpen] = useState(false);

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
        onClick={() => setFileWizardOpen(true)}
      />

      <McpButton
        capabilityId="git_status" // Using git_status as the primary capability for Git Command Center
        label="Git Command Center"
        smallText="Add, commit, push, PR"
        onClick={() => setGitWizardOpen(true)}
      />

      <McpButton
        capabilityId="db_read" // Using db_read as the primary capability for Database Assistant
        label="Database Assistant"
        smallText="Connect, migrate, schema"
        onClick={() => setDbWizardOpen(true)}
      />

      <McpButton
        capabilityId="research_web" // Using research_web as the primary capability for Research (NIMs)
        label="Research (NIMs)"
        smallText="Deep analysis, web research"
        onClick={() => setResearchWizardOpen(true)}
      />

      <McpButton
        capabilityId="/patch" // Using /patch command as the capability for Suggest Edits
        label="Suggest Edits"
        smallText="Ask BrewAssist for a patch"
        onClick={() => alert("Suggest Edits clicked!")}
      />

      {/* Render Wizards */}
      <FileWizard isOpen={fileWizardOpen} onClose={() => setFileWizardOpen(false)} />
      <GitWizard isOpen={gitWizardOpen} onClose={() => setGitWizardOpen(false)} />
      <DatabaseWizard isOpen={dbWizardOpen} onClose={() => setDbWizardOpen(false)} />
      <ResearchWizard
        isOpen={researchWizardOpen}
        onClose={() => setResearchWizardOpen(false)}
      />
    </div>
  );
};