// components/WorkspaceSidebarLeft.tsx
"use client";

import React from "react";

export const WorkspaceSidebarLeft: React.FC = () => {
  return (
    <div className="mcp-sidebar">
      <div className="mcp-header">
        <span className="mcp-logo">MCP</span>
        <span className="mcp-title">Tools</span>
      </div>

      <button className="mcp-button">
        <span>Create File</span>
        <small>Scaffold a new file via /task</small>
      </button>

      <button className="mcp-button">
        <span>Delete File</span>
        <small>Safely remove a file</small>
      </button>

      <button className="mcp-button">
        <span>Suggest Edits</span>
        <small>Ask BrewAssist for a patch</small>
      </button>

      <button className="mcp-button">
        <span>Supabase Push</span>
        <small>Run Supabase migrations</small>
      </button>

      <button className="mcp-button">
        <span>Git Commit</span>
        <small>Open BrewCommit flow</small>
      </button>
    </div>
  );
};