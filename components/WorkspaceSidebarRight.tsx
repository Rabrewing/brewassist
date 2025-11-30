'use client';
import { useEffect, useState, type JSX } from 'react';
import type { BrewLastState } from '@/lib/brewLast';
import { fetchBrewLast } from '@/lib/brewLastClient';
import type { BrewTruthResult } from '@/lib/brewtruth';

type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
};

/**
 * Derives a UI-friendly workpane status from the BrewLastState
 * instead of relying on a non-existent `status` field.
 */
function deriveWorkpaneStatus(
  state: BrewLastState | null
):
  | 'idle'
  | 'awaiting_approval'
  | 'in_progress'
  | 'applied'
  | 'failed'
  | 'task' {
  if (!state) return 'idle';

  // 1) Hard failure: tool or HRM run failed
  if (
    state.lastToolRun &&
    ((state.lastToolRun.exitCode !== undefined &&
      state.lastToolRun.exitCode !== 0) ||
      state.lastToolRun.ok === false)
  ) {
    return 'failed';
  }
  if (state.lastHRMRun && state.lastHRMRun.ok === false) {
    return 'failed';
  }

  // 2) Applied successfully
  if (
    state.lastToolRun &&
    state.lastToolRun.ok === true &&
    state.lastToolRun.exitCode === 0
  ) {
    return 'applied';
  }

  // 3) Awaiting approval — we treat “there is a patch in sandbox” as pending
  if (state.lastSandboxRun?.patchPath) {
    return 'awaiting_approval';
  }

  // 4) In progress — any recent visible activity but not yet in a final state
  if (
    state.lastToolRun ||
    state.lastPersonaEvent ||
    state.lastSandboxRun ||
    state.lastIdentityEvent ||
    state.lastHRMRun
  ) {
    return 'in_progress';
  }

  // 5) Fallback “has a task but no special state”
  return 'task';
}

/**
 * Derive a simple label that hints at what engine/stack was involved
 * in the last activity (tool, HRM, mixed, etc.).
 */
function getEngineStackLabel(state: BrewLastState | null): string | null {
  if (!state) return null;

  if (state.lastToolRun?.tool) {
    return state.lastToolRun.tool;
  }

  if (state.lastHRMRun) {
    return `HRM (${state.lastHRMRun.steps} steps)`;
  }

  if (state.history && state.history.length > 0) {
    return 'Mixed activity';
  }

  return null;
}

/**
 * Provide a short human summary describing the most recent work.
 */
function getWorkpaneSummary(state: BrewLastState | null): string {
  if (!state) return 'No task summary yet.';

  if (state.lastToolRun?.summary) {
    return state.lastToolRun.summary;
  }

  if (state.lastHRMRun) {
    return `HRM run completed with ${state.lastHRMRun.steps} steps.`;
  }

  if (state.lastSandboxRun) {
    return 'Sandbox run initiated.';
  }

  if (state.lastPersonaEvent) {
    return `Persona event: ${state.lastPersonaEvent.type}.`;
  }

  if (state.lastIdentityEvent) {
    return `Identity event: ${state.lastIdentityEvent.event}.`;
  }

  if (state.history && state.history.length > 0) {
    return 'Recent activity detected.';
  }

  return 'No task summary yet.';
}

/**
 * Heuristic to show any paths touched in the last tool/sandbox run.
 */
function getWorkpanePaths(state: BrewLastState | null): string[] {
  if (!state) return [];

  const paths: string[] = [];

  // Look at args on lastToolRun for anything that looks like a path
  if (state.lastToolRun?.args) {
    const args = state.lastToolRun.args;
    if (Array.isArray(args)) {
      for (const arg of args) {
        if (typeof arg === 'string' && arg.includes('/')) {
          paths.push(arg);
        }
      }
    } else if (typeof args === 'string' && args.includes('/')) {
      paths.push(args);
    }
  }

  // Include sandbox patch path if present
  if (state.lastSandboxRun?.patchPath) {
    paths.push(state.lastSandboxRun.patchPath);
  }

  // Deduplicate
  return Array.from(new Set(paths));
}

export function WorkspaceSidebarRight() {
  // File tree state
  const [tree, setTree] = useState<FileNode[]>([]);
  const [root, setRoot] = useState<string>('~/brewexec');
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<string>(
    'Select a file to preview it here.'
  );
  const [activeFile, setActiveFile] = useState<string | null>(null);

  // Folder open/close state
  const [open, setOpen] = useState<Set<string>>(new Set());

  // Overlay preview
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Sandbox state
  const [sandboxEngine, setSandboxEngine] = useState<
    'gemini' | 'tiny' | 'mistral'
  >('tiny');
  const [sandboxPrompt, setSandboxPrompt] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState(
    'Ready for sandbox prompts.'
  );
  const [sandboxBusy, setSandboxBusy] = useState(false);

  // BrewTruth state
  const [truthMode, setTruthMode] = useState(false);
  const [truthResult, setTruthResult] = useState<null | BrewTruthResult>(null);
  const [isTruthLoading, setIsTruthLoading] = useState(false);

  // Workpane state (BrewLast)
  const [workTask, setWorkTask] = useState<null | BrewLastState>(null);
  const [workLoading, setWorkLoading] = useState(false);
  const [workError, setWorkError] = useState<string | null>(null);
  const [workPath, setWorkPath] = useState<string | null>(null);
  const [workpaneStatus, setWorkpaneStatus] = useState<
    'idle' | 'awaiting_approval' | 'in_progress' | 'applied' | 'failed' | 'task'
  >('idle');

  // Recompute status whenever BrewLast state changes
  useEffect(() => {
    setWorkpaneStatus(deriveWorkpaneStatus(workTask));
  }, [workTask]);

  // Load file tree on mount
  useEffect(() => {
    async function loadTree() {
      try {
        const res = await fetch('/api/fs-tree');
        const data = await res.json();
        setRoot(data.root || '~/brewexec');
        setTree(data.tree || []);
      } catch (err) {
        console.error('FS tree error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTree();
  }, []);

  // Wire BrewLast to workpane events
  useEffect(() => {
    async function load() {
      setWorkLoading(true);
      setWorkError(null);
      try {
        const data = await fetchBrewLast();
        setWorkTask(data);
      } catch (err: any) {
        console.error('BrewLast fetch error:', err);
        setWorkError('Failed to load recent BrewAssist activity.');
      } finally {
        setWorkLoading(false);
      }
    }

    function handleOpen(e: Event) {
      const detail = (e as CustomEvent).detail as
        | { path?: string | null }
        | undefined;
      if (detail?.path) setWorkPath(detail.path);
      void load();
    }

    function handleRefresh() {
      void load();
    }

    function handleIdle() {
      setWorkTask(null);
      setWorkPath(null);
      setWorkLoading(false);
      setWorkError(null);
    }

    window.addEventListener('brew:workpane.open', handleOpen);
    window.addEventListener('brew:workpane.refresh', handleRefresh);
    window.addEventListener('brew:workpane.idle', handleIdle);

    return () => {
      window.removeEventListener('brew:workpane.open', handleOpen);
      window.removeEventListener('brew:workpane.refresh', handleRefresh);
      window.removeEventListener('brew:workpane.idle', handleIdle);
    };
  }, []);

  async function handleSandboxRun() {
    const prompt = sandboxPrompt.trim();
    if (!prompt) return;

    setSandboxBusy(true);
    setSandboxOutput('Running sandbox prompt…');
    setTruthResult(null);

    if (!truthMode) {
      // Raw sandbox mode (unchanged behavior)
      try {
        const res = await fetch('/api/sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ engine: sandboxEngine, prompt }),
        });
        const data = await res.json();
        const out = data.output || data.error || '⚠️ No sandbox response.';
        setSandboxOutput(String(out));

        if (typeof (window as any).brewSend === 'function') {
          (window as any).brewSend(`/sandbox ${sandboxEngine} ${prompt}`);
        }
      } catch (err) {
        console.error('Sandbox error:', err);
        setSandboxOutput('❌ Sandbox error. See console.');
      } finally {
        setSandboxBusy(false);
      }
    } else {
      // BrewTruth mode
      try {
        setIsTruthLoading(true);
        const resp = await fetch('/api/brewtruth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: prompt,
            assistantReply: '',
            context: [],
            model: 'openai',
          }),
        });

        const data = await resp.json();
        setTruthResult(data);
        setSandboxOutput('BrewTruth analysis complete.');
      } catch (err: any) {
        console.error('BrewTruth error', err);
        setTruthResult({
          ok: false,
          truthScore: 0,
          riskLevel: 'HIGH',
          flags: ['BrewTruth request failed'],
          contradictions: [],
          betterAlternatives: [],
          summary: 'BrewTruth engine failed – see console.',
        });
        setSandboxOutput('❌ BrewTruth error. See console.');
      } finally {
        setIsTruthLoading(false);
        setSandboxBusy(false);
      }
    }
  }

  function toggleDir(key: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleFileClick(node: FileNode) {
    setActiveFile(node.path);
    setPreview('Loading preview…');

    try {
      const res = await fetch(
        `/api/fs-read?path=${encodeURIComponent(node.path)}`
      );
      const data = await res.json();

      if (data.error) setPreview(`⚠️ ${data.error}`);
      else setPreview(data.content || '(empty file)');
    } catch {
      setPreview('⚠️ Error loading preview.');
    }
  }

  function openOverlay() {
    if (activeFile) setOverlayOpen(true);
  }

  function minimizeOverlay() {
    setOverlayOpen(false);
  }

  function closePreview() {
    setOverlayOpen(false);
    setActiveFile(null);
    setPreview('Select a file to preview it here.');
  }

  const renderNode = (node: FileNode, depth = 0): JSX.Element => {
    const indent = Math.min(depth, 3);
    const key = node.path || node.name;
    const isOpen = open.has(key);
    const isActive = activeFile === node.path;
    const indentClass = `dir-indent-${indent}`;

    if (node.type === 'dir') {
      return (
        <div key={key} className={`dir-node ${indentClass}`}>
          <button
            type="button"
            className="dir-label dir-folder"
            onClick={() => toggleDir(key)}
          >
            <span className="dir-icon">{isOpen ? '📂' : '📁'}</span>
            {node.name}
          </button>
          {isOpen &&
            node.children?.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    return (
      <div
        key={key}
        className={`dir-node ${indentClass} ${isActive ? 'is-active' : ''}`}
      >
        <button
          type="button"
          className="dir-label dir-file"
          onClick={() => handleFileClick(node)}
        >
          <span className="dir-icon">📄</span>
          {node.name}
        </button>
      </div>
    );
  };

  return (
    <>
      <aside className="cockpit-right">
        <div className="cpc-right">
          <div className="dir-header">
            <h3 className="dir-title">📁 Project Files</h3>
            <span className="dir-root">{root.replace('/home', '~')}</span>
          </div>

          {/* Work Mode banner */}
          {workTask && (
            <div className="workpane-banner">
              <div className="workpane-row">
                <span className="pill pill-status">
                  {workpaneStatus === 'awaiting_approval'
                    ? '🟡 Awaiting approval'
                    : workpaneStatus === 'in_progress'
                      ? '✨ In progress'
                      : workpaneStatus === 'applied'
                        ? '🟢 Applied'
                        : workpaneStatus === 'failed'
                          ? '🔴 Failed'
                          : '⚪ Task'}
                </span>

                {getEngineStackLabel(workTask) && (
                  <span className="pill pill-engine">
                    ⚙️ {getEngineStackLabel(workTask)}
                  </span>
                )}
              </div>

              <div className="workpane-summary">
                {getWorkpaneSummary(workTask)}
              </div>

              {getWorkpanePaths(workTask).length > 0 && (
                <div className="workpane-paths">
                  {getWorkpanePaths(workTask).map((p) => (
                    <span key={p} className="work-path-pill">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Optional patch preview – only shown if we stored patch info in BrewLast later */}
              {workTask?.lastSandboxRun?.patchPath && (
                <details className="workpane-diff">
                  <summary>View proposed changes</summary>
                  <div className="diff-columns">
                    <div className="diff-column">
                      <div className="diff-label">Patch Path</div>
                      <pre className="diff-code">
                        {workTask.lastSandboxRun.patchPath}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              {/* Approval buttons — UI only for now */}
              {workpaneStatus === 'awaiting_approval' && (
                <div className="workpane-actions">
                  <button
                    type="button"
                    className="btn-approve"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('brew:workpane.approve', {
                          detail: { taskId: workTask.lastSandboxRun?.runId },
                        })
                      )
                    }
                  >
                    ✅ Apply changes
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('brew:workpane.reject', {
                          detail: { taskId: workTask.lastSandboxRun?.runId },
                        })
                      )
                    }
                  >
                    ⏹️ Cancel
                  </button>
                </div>
              )}

              {workLoading && (
                <div className="workpane-status">✨ BrewAssist is working…</div>
              )}
              {workTask.lastHRMRun && (
                <div className="workpane-status">
                  <strong>HRM:</strong> {workTask.lastHRMRun.summary}
                </div>
              )}
              {workError && (
                <div className="workpane-error">⚠️ {workError}</div>
              )}
            </div>
          )}

          {/* File tree */}
          <div className="dir-tree">
            {loading && <div className="dir-loading">Loading files…</div>}
            {!loading && tree.map((n) => renderNode(n))}
          </div>
        </div>

        {/* File preview */}
        <div className="dir-preview">
          <div className="dir-preview-header">
            <span className="dir-preview-title">{activeFile ?? 'Preview'}</span>
            <div className="dir-preview-actions">
              <button
                className="dir-btn"
                onClick={openOverlay}
                disabled={!activeFile}
              >
                ⤢ Pop out
              </button>
              <button
                className="dir-btn"
                onClick={closePreview}
                disabled={!activeFile}
              >
                ✕ Close
              </button>
            </div>
          </div>
          <pre className="dir-preview-content">{preview}</pre>
        </div>

        {/* AI Sandbox box */}
        <div className="sandbox-box">
          <div className="sandbox-header">
            <span>🧪 AI Sandbox</span>
            <select
              value={sandboxEngine}
              onChange={(e) => setSandboxEngine(e.target.value as any)}
            >
              <option value="tiny">TinyLLaMA</option>
              <option value="mistral">Mistral</option>
              <option value="gemini">Gemini</option>
              {/* <option value="grok">Grok</option> */}
            </select>
          </div>
          <textarea
            className="sandbox-input"
            rows={2}
            placeholder="Run a raw prompt without BrewAssist tone…"
            value={sandboxPrompt}
            onChange={(e) => setSandboxPrompt(e.target.value)}
          />
          <button
            type="button"
            className="sandbox-run"
            onClick={handleSandboxRun}
            disabled={sandboxBusy}
          >
            {sandboxBusy ? 'Running…' : 'Run Sandbox'}
          </button>
          <pre className="sandbox-output">{sandboxOutput}</pre>

          <label className="flex items-center gap-2 text-xs text-amber-300 mt-2">
            <input
              type="checkbox"
              checked={truthMode}
              onChange={(e) => setTruthMode(e.target.checked)}
            />
            BrewTruth Mode (cold audit)
          </label>

          {truthMode && (
            <div className="mt-3 border border-amber-500/40 rounded-lg p-3 text-xs bg-black/40">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-300">
                  BrewTruth Verdict
                </span>
                {truthResult && (
                  <span
                    className={
                      truthResult.riskLevel === 'LOW'
                        ? 'text-emerald-400'
                        : truthResult.riskLevel === 'MEDIUM'
                          ? 'text-yellow-300'
                          : 'text-red-400'
                    }
                  >
                    {truthResult.riskLevel} •{' '}
                    {(truthResult.truthScore * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              {isTruthLoading && (
                <div className="text-slate-300">Analyzing…</div>
              )}

              {!isTruthLoading && truthResult && (
                <>
                  <p className="text-slate-200 mb-1">{truthResult.summary}</p>

                  {truthResult.flags?.length > 0 && (
                    <div className="mt-1">
                      <div className="font-semibold text-amber-200">Flags:</div>
                      <ul className="list-disc list-inside text-slate-200">
                        {truthResult.flags.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Pop-out preview overlay */}
      {overlayOpen && (
        <div className="preview-overlay">
          <div className="preview-overlay-backdrop" />
          <div className="preview-overlay-panel">
            <div className="preview-overlay-header">
              <span className="preview-overlay-title">{activeFile}</span>
              <div className="preview-overlay-actions">
                <button
                  className="overlay-btn overlay-btn-min"
                  onClick={minimizeOverlay}
                >
                  ▃
                </button>
                <button
                  className="overlay-btn overlay-btn-close"
                  onClick={closePreview}
                >
                  ✕
                </button>
              </div>
            </div>
            <pre className="preview-overlay-content">{preview}</pre>
          </div>
        </div>
      )}
    </>
  );
}
