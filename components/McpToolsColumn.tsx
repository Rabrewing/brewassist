'use client';

import { useCallback } from 'react';
import BrewGuideModal from './BrewGuideModal';
import { useGuide } from '@/contexts/GuideContext';

export default function McpToolsColumn() {
  const { isGuideOpen, setIsGuideOpen } = useGuide();

  // Send helper → uses global brewSend wired by BrewCockpitCenter
  const send = useCallback((input: string) => {
    const fn = (window as any).brewSend;
    if (typeof fn === 'function') {
      fn(input);
    } else {
      console.warn('brewSend is not available on window yet');
    }
  }, []);

  return (
    <>
      <aside className="mcp-column">
        <h2 className="mcp-title">MCP Tools</h2>

        <button
          type="button"
          className="mcp-button"
          onClick={() => send('/task create file')}
        >
          <div className="mcp-card-title">Create File</div>
          <div className="mcp-card-sub">Scaffold a new file via /task</div>
        </button>

        <button
          type="button"
          className="mcp-button"
          onClick={() => send('/task delete file')}
        >
          <div className="mcp-card-title">Delete File</div>
          <div className="mcp-card-sub">Safely remove a file</div>
        </button>

        <button
          type="button"
          className="mcp-button"
          onClick={() => send('/task suggest')}
        >
          <div className="mcp-card-title">Suggest Edits</div>
          <div className="mcp-card-sub">Ask BrewAssist for a patch</div>
        </button>

        <button
          type="button"
          className="mcp-button"
          onClick={() => send('/supa status')}
        >
          <div className="mcp-card-title">Supabase Push</div>
          <div className="mcp-card-sub">Run Supabase migrations</div>
        </button>

        <button
          type="button"
          className="mcp-button"
          onClick={() => send('/commit MCP Tools quick commit')}
        >
          <div className="mcp-card-title">Git Commit</div>
          <div className="mcp-card-sub">Open BrewCommit flow</div>
        </button>
      </aside>

      <BrewGuideModal
        open={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </>
  );
}
