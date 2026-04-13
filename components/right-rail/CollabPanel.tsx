import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

type CollabView = 'chat' | 'screen' | 'report';

type ReplayHistoryRun = {
  id: string;
  events?: Array<{
    run_id: string;
    event_type: string;
    created_at: string;
    payload?: {
      stage?: string;
      summary?: string;
      payload?: {
        author?: string;
        message?: string;
        presence?: string;
        kind?: string;
        source?: 'agent' | 'human';
        screenShareActive?: boolean;
        reportReady?: boolean;
      };
    };
  }>;
};

type CollabEntry = {
  id: string;
  runId: string;
  author: string;
  message: string;
  presence: string;
  kind: string;
  source: 'agent' | 'human';
  stage: string;
  createdAt: string;
  screenShareActive: boolean;
  reportReady: boolean;
};

function toCollabEntries(runs: ReplayHistoryRun[]): CollabEntry[] {
  return runs
    .flatMap((run) =>
      (run.events ?? [])
        .filter((event) => event.event_type === 'collab.message')
        .map((event, index) => ({
          id: `${run.id}-${event.created_at}-${index}`,
          runId: run.id,
          author: event.payload?.payload?.author ?? 'System',
          message:
            event.payload?.payload?.message ??
            event.payload?.summary ??
            'Collaboration note recorded.',
          presence: event.payload?.payload?.presence ?? 'ready',
          kind: event.payload?.payload?.kind ?? 'status',
          source: event.payload?.payload?.source ?? 'agent',
          stage: event.payload?.stage ?? 'replay',
          createdAt: event.created_at,
          screenShareActive: Boolean(event.payload?.payload?.screenShareActive),
          reportReady: Boolean(event.payload?.payload?.reportReady),
        }))
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
}

export const CollabPanel: React.FC = () => {
  const {
    orgId,
    workspaceId,
    selectedReplayRunId,
    requestReplayOpen,
    setSelectedReplayRunId,
  } = useEnterpriseSelection();
  const { session } = useSupabaseAuth();
  const [view, setView] = useState<CollabView>('chat');
  const [entries, setEntries] = useState<CollabEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollab = useCallback(async () => {
    if (!orgId || !session?.access_token) {
      setEntries([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/replay-history', {
        headers: {
          'x-brewassist-org-id': orgId,
          ...(workspaceId ? { 'x-brewassist-workspace-id': workspaceId } : {}),
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const body = await response
          .json()
          .catch(() => ({ error: 'Unable to load collaboration history' }));
        throw new Error(body.error || 'Unable to load collaboration history');
      }

      const data = await response.json();
      setEntries(toCollabEntries(data.runs ?? []));
    } catch (loadError: any) {
      setError(loadError?.message ?? 'Unable to load collaboration history');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, session, workspaceId]);

  useEffect(() => {
    void loadCollab();
  }, [loadCollab]);

  const latestEntry = entries[0] ?? null;
  const screenShareCount = useMemo(
    () => entries.filter((entry) => entry.screenShareActive).length,
    [entries]
  );
  const reportReadyCount = useMemo(
    () => entries.filter((entry) => entry.reportReady).length,
    [entries]
  );
  const visibleEntries = useMemo(
    () =>
      selectedReplayRunId
        ? entries.filter((entry) => entry.runId === selectedReplayRunId)
        : entries,
    [entries, selectedReplayRunId]
  );

  return (
    <div className="collab-panel">
      <div className="panel-header">
        <h3 className="panel-title">Collab</h3>
        <span className="panel-subtitle">Replay handoffs and run notes</span>
        <button
          type="button"
          className="collab-pill"
          onClick={() => void loadCollab()}
        >
          Refresh
        </button>
      </div>

      <div className="panel-body collab-panel-body">
        <div className="collab-presence-row">
          <div className="collab-presence-card">
            <span className="collab-presence-name">Recent notes</span>
            <span className="collab-presence-role">Persisted runs</span>
            <span className="collab-presence-status">{entries.length}</span>
          </div>
          <div className="collab-presence-card">
            <span className="collab-presence-name">Screen share</span>
            <span className="collab-presence-role">Flagged events</span>
            <span className="collab-presence-status">{screenShareCount}</span>
          </div>
          <div className="collab-presence-card">
            <span className="collab-presence-name">Reports ready</span>
            <span className="collab-presence-role">Review-ready runs</span>
            <span className="collab-presence-status">{reportReadyCount}</span>
          </div>
        </div>

        {selectedReplayRunId ? (
          <div className="collab-action-row">
            <span className="collab-pill">
              Focused run {selectedReplayRunId}
            </span>
            <button
              type="button"
              className="collab-pill"
              onClick={() => setSelectedReplayRunId(null)}
            >
              Show all runs
            </button>
          </div>
        ) : null}

        <div
          className="collab-toggle-row"
          role="tablist"
          aria-label="Collab modes"
        >
          <button
            type="button"
            className={`collab-toggle ${view === 'chat' ? 'is-active' : ''}`}
            onClick={() => setView('chat')}
          >
            Chat
          </button>
          <button
            type="button"
            className={`collab-toggle ${view === 'screen' ? 'is-active' : ''}`}
            onClick={() => setView('screen')}
          >
            Screen Share
          </button>
          <button
            type="button"
            className={`collab-toggle ${view === 'report' ? 'is-active' : ''}`}
            onClick={() => setView('report')}
          >
            Reports
          </button>
        </div>

        {!orgId || !session?.access_token ? (
          <div className="collab-card">
            <div className="collab-card-title">Collab feed unavailable</div>
            <p className="collab-card-copy">
              Sign in and select an org to load persisted collaboration notes.
            </p>
          </div>
        ) : isLoading ? (
          <div className="collab-card">
            <div className="collab-card-title">Loading</div>
            <p className="collab-card-copy">Loading collaboration history…</p>
          </div>
        ) : error ? (
          <div className="collab-card">
            <div className="collab-card-title">Load failed</div>
            <p className="collab-card-copy">{error}</p>
          </div>
        ) : view === 'chat' ? (
          <div className="collab-card">
            <div className="collab-card-title">Run Notes</div>
            {visibleEntries.length === 0 ? (
              <p className="collab-card-copy">
                {selectedReplayRunId
                  ? 'No collaboration notes were persisted for the selected run.'
                  : 'No collaboration notes have been persisted yet.'}
              </p>
            ) : (
              <div className="collab-message-list">
                {visibleEntries.slice(0, 8).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`collab-message ${selectedReplayRunId === entry.runId ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedReplayRunId(entry.runId);
                      requestReplayOpen();
                    }}
                  >
                    <span className="collab-message-author">
                      {entry.author} • {entry.kind} • {entry.source} •{' '}
                      {entry.stage}
                    </span>
                    <span className="collab-message-text">{entry.message}</span>
                    <span className="collab-message-meta">
                      {new Date(entry.createdAt).toLocaleString()} •{' '}
                      {entry.presence} • {entry.runId}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : view === 'screen' ? (
          <div className="collab-card">
            <div className="collab-card-title">Screen Sharing</div>
            <p className="collab-card-copy">
              {screenShareCount > 0
                ? `${screenShareCount} persisted collab event(s) requested live screen sharing.`
                : 'No persisted runs requested screen sharing yet.'}
            </p>
            <div className="collab-action-row">
              <span className="collab-pill">
                {latestEntry?.presence ?? 'ready'}
              </span>
              <span className="collab-pill">
                {latestEntry?.screenShareActive ? 'Screen on' : 'Screen off'}
              </span>
            </div>
          </div>
        ) : (
          <div className="collab-card">
            <div className="collab-card-title">Reporting</div>
            <ul className="collab-report-list">
              <li>
                {reportReadyCount} persisted event(s) marked reports ready
              </li>
              <li>
                Latest note:{' '}
                {latestEntry ? latestEntry.message : 'No report notes yet'}
              </li>
              <li>
                Scope:{' '}
                {workspaceId
                  ? 'workspace-scoped replay history'
                  : 'org-scoped replay history'}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
