// components/WorkspaceSidebarLeft.tsx
"use client";

import React, { useState } from "react";
import FileWizard from "./mcp/FileWizard";
import GitWizard from "./mcp/GitWizard";
import DatabaseWizard from "./mcp/DatabaseWizard";
import ResearchWizard from "./mcp/ResearchWizard";
import McpWizardModal from "./mcp/McpWizardModal";
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import type { ToolPermission } from '@/lib/toolbeltConfig'; // Import ToolbeltPermission

interface McpButtonProps {
  id: string;
  label: string;
  smallText: string;
  onClick: () => void;
  permission: ToolPermission;
}

const McpButton: React.FC<McpButtonProps> = ({ id, label, smallText, onClick, permission }) => {
  const disabled = permission === 'blocked' || permission === 'admin_only';

  const tooltip =
    permission === 'blocked'
      ? 'Disabled in current Mode/Tier'
      : permission === 'admin_only'
      ? 'Admin-only in this configuration'
      : undefined;

  return (
    <button
      className={`mcp-button mcp-${permission}`}
      onClick={permission === 'allowed' || permission === 'needs_confirm' ? onClick : undefined}
      disabled={disabled}
      title={tooltip}
    >
      <span>{label}</span>
      <small>{smallText}</small>
      {permission === 'needs_confirm' && <span className="mcp-badge">⚠</span>}
      {permission === 'admin_only' && <span className="mcp-badge">🔒</span>}
    </button>
  );
};

export const WorkspaceSidebarLeft: React.FC = () => {
  const { mode, effectiveRules } = useToolbelt(); // Consume from context
  const [fileWizardOpen, setFileWizardOpen] = useState(false);
  const [gitWizardOpen, setGitWizardOpen] = useState(false);
  const [dbWizardOpen, setDbWizardOpen] = useState(false);
  const [researchWizardOpen, setResearchWizardOpen] = useState(false);

  const getMcpPermission = (mcpToolId: string): ToolPermission => {
    return effectiveRules.mcp[mcpToolId] || 'blocked';
  };

  return (
    <div className="mcp-sidebar">
      <div className="mcp-header">
        <span className="mcp-logo">MCP</span>
        <span className="mcp-title">Tools</span>
      </div>

      <McpButton
        id="mcp.file"
        label="File Assistant"
        smallText="Create, delete, move files"
        onClick={() => setFileWizardOpen(true)}
        permission={getMcpPermission('mcp.file')}
      />

      <McpButton
        id="mcp.git"
        label="Git Command Center"
        smallText="Add, commit, push, PR"
        onClick={() => setGitWizardOpen(true)}
        permission={getMcpPermission('mcp.git')}
      />

      <McpButton
        id="mcp.db"
        label="Database Assistant"
        smallText="Connect, migrate, schema"
        onClick={() => setDbWizardOpen(true)}
        permission={getMcpPermission('mcp.db')}
      />

      <McpButton
        id="mcp.research"
        label="Research (NIMs)"
        smallText="Deep analysis, web research"
        onClick={() => setResearchWizardOpen(true)}
        permission={getMcpPermission('mcp.research')}
      />

      <McpButton
        id="mcp.suggest-edits" // Assuming 'suggest-edits' maps to 'mcp.suggest-edits'
        label="Suggest Edits"
        smallText="Ask BrewAssist for a patch"
        onClick={() => alert("Suggest Edits clicked!")}
        permission={getMcpPermission('mcp.suggest-edits')}
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