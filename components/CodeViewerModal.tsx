'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRepoConnection } from '@/contexts/RepoConnectionContext';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { highlightSource, isMarkdownPath } from '@/lib/codeHighlight';
import { summarizeUnifiedDiff } from '@/lib/brewdocs/diff/summary';
import { RichMarkdown } from './RichMarkdown';

type CodeViewerModalProps = {
  filePath: string | null;
  onClose: () => void;
};

type FilePayload = {
  content: string;
};

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  filePath,
  onClose,
}) => {
  const { repoProvider, repoRoot } = useRepoConnection();
  const { orgId } = useEnterpriseSelection();
  const { session } = useSupabaseAuth();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const isMarkdown = filePath ? isMarkdownPath(filePath) : false;
  const isDiffArtifact = Boolean(
    filePath && /(diff\.txt|patch\.diff|\.diff)$/i.test(filePath)
  );
  const diffSummary = useMemo(
    () => (isDiffArtifact ? summarizeUnifiedDiff(content) : null),
    [content, isDiffArtifact]
  );
  const reviewRisk = useMemo(() => {
    if (!diffSummary) return null;
    if (diffSummary.hasBinaryHint) return 'HIGH';
    if (diffSummary.addedLines + diffSummary.removedLines > 200)
      return 'MEDIUM';
    if (diffSummary.addedLines + diffSummary.removedLines > 0) return 'LOW';
    return 'LOW';
  }, [diffSummary]);

  useEffect(() => {
    if (!filePath) return;

    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/api/fs-read?path=${encodeURIComponent(filePath)}`,
          {
            headers: {
              'x-brewassist-repo-provider': repoProvider,
              'x-brewassist-repo-root': repoRoot,
              ...(orgId ? { 'x-brewassist-org-id': orgId } : {}),
              ...(session?.access_token
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
            },
          }
        );
        if (!res.ok) throw new Error(`fs-read ${res.status}`);
        const data: FilePayload = await res.json();
        setContent(data.content ?? '');
      } catch (e: any) {
        console.error('[CodeViewerModal] fs-read error', e);
        setError(e?.message ?? 'Unable to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [filePath, repoProvider, repoRoot, orgId, session]);

  if (!filePath) return null;

  const handleDownload = (format: 'md' | 'txt' | 'docx' | 'pdf') => {
    // TODO: Implement server-side export.
    console.log(`[CodeViewerModal] Download as ${format}`, filePath);
    alert(`Download as ${format} – to be wired to API later.`);
  };

  const handleSendToAssistant = () => {
    // TODO: Wire to BrewAssist / BrewTruth / NIM via API.
    console.log('[CodeViewerModal] Assistant prompt:', {
      filePath,
      assistantPrompt,
    });
    setAssistantPrompt('');
  };

  return (
    <div className="code-viewer-modal-backdrop">
      <div className="code-viewer-modal">
        {/* Header */}
        <div className="code-viewer-header">
          <div className="code-viewer-title">
            <span className="code-viewer-badge">Viewer</span>
            <span className="code-viewer-path">{filePath}</span>
          </div>
          <div className="code-viewer-actions">
            <button onClick={() => handleDownload('md')}>.md</button>
            <button onClick={() => handleDownload('txt')}>.txt</button>
            <button onClick={() => handleDownload('docx')}>Word</button>
            <button onClick={() => handleDownload('pdf')}>PDF</button>
            <button className="code-viewer-close" onClick={onClose}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="code-viewer-body">
          {diffSummary && (
            <div className="code-viewer-review-banner">
              <div className="code-viewer-review-copy">
                <strong>Diff review</strong>
                <span>
                  {diffSummary.fileCount} file(s), {diffSummary.addedLines}{' '}
                  added, {diffSummary.removedLines} removed
                  {reviewRisk ? ` · Risk ${reviewRisk}` : ''}
                </span>
              </div>
              <div className="code-viewer-review-chips">
                <span className="code-viewer-review-chip">Sandbox mirror</span>
                <span className="code-viewer-review-chip">Explain first</span>
                {diffSummary.hasBinaryHint && (
                  <span className="code-viewer-review-chip code-viewer-review-chip--warn">
                    Binary hint
                  </span>
                )}
              </div>
            </div>
          )}

          {loading && <div className="code-viewer-status">Loading…</div>}
          {error && (
            <div className="code-viewer-status error">
              Error loading file: {error}
            </div>
          )}
          {!loading &&
            !error &&
            (isMarkdown ? (
              <div className="code-viewer-markdown">
                <RichMarkdown content={content} />
              </div>
            ) : (
              <pre className="code-viewer-pre">
                <code
                  className="hljs"
                  dangerouslySetInnerHTML={{
                    __html: highlightSource(content, filePath),
                  }}
                />
              </pre>
            ))}
        </div>

        {/* Assistant Bar */}
        <div className="code-viewer-assistant-bar">
          <div className="assistant-meta">
            <span className="assistant-chip">BrewAssist</span>
            <span className="assistant-chip secondary">RB Mode</span>
            {diffSummary && (
              <span className="assistant-chip secondary">Diff</span>
            )}
          </div>
          <div className="assistant-input-row">
            <button
              className="assistant-attach"
              type="button"
              // TODO: wire to file upload
            >
              +
            </button>
            <input
              className="assistant-input"
              placeholder={
                diffSummary
                  ? 'Ask BrewAssist to explain this diff, review risk, or draft a patch…'
                  : 'Ask BrewAssist about this file, request a patch, or send to BrewTruth…'
              }
              value={assistantPrompt}
              onChange={(e) => setAssistantPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendToAssistant();
                }
              }}
            />
            <button
              className="assistant-send assistant-send--ghost"
              type="button"
              onClick={() =>
                setAssistantPrompt(
                  diffSummary
                    ? `Explain this diff and summarize its risk: ${filePath}`
                    : assistantPrompt || `Review ${filePath}`
                )
              }
            >
              Explain
            </button>
            <button
              className="assistant-send"
              type="button"
              onClick={handleSendToAssistant}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewerModal;
