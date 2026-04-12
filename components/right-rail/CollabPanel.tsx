import React, { useState } from 'react';

type CollabView = 'chat' | 'screen' | 'report';

const PRESENCE = [
  { name: 'Ava', role: 'Design', status: 'Live' },
  { name: 'Noah', role: 'Ops', status: 'Review' },
  { name: 'Maya', role: 'Security', status: 'Standby' },
];

const CHAT_LOG = [
  { author: 'Ava', text: 'I can stay in the room while the diff is reviewed.' },
  { author: 'Noah', text: 'Screen share is ready for escalation if needed.' },
  {
    author: 'Maya',
    text: 'Reporting is set to capture approvals and next steps.',
  },
];

export const CollabPanel: React.FC = () => {
  const [view, setView] = useState<CollabView>('chat');

  return (
    <div className="collab-panel">
      <div className="panel-header">
        <h3 className="panel-title">Collab</h3>
        <span className="panel-subtitle">Team room • notes • reports</span>
        <span className="status-chip status-chip-live">Ready</span>
      </div>

      <div className="panel-body collab-panel-body">
        <div className="collab-presence-row">
          {PRESENCE.map((person) => (
            <div key={person.name} className="collab-presence-card">
              <span className="collab-presence-name">{person.name}</span>
              <span className="collab-presence-role">{person.role}</span>
              <span className="collab-presence-status">{person.status}</span>
            </div>
          ))}
        </div>

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

        {view === 'chat' && (
          <div className="collab-card">
            <div className="collab-card-title">Team Chat</div>
            <div className="collab-message-list">
              {CHAT_LOG.map((entry) => (
                <div key={entry.author} className="collab-message">
                  <span className="collab-message-author">{entry.author}</span>
                  <span className="collab-message-text">{entry.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'screen' && (
          <div className="collab-card">
            <div className="collab-card-title">Screen Sharing</div>
            <p className="collab-card-copy">
              Live sharing is surfaced here as the launch point for a larger
              focused session view.
            </p>
            <div className="collab-action-row">
              <span className="collab-pill">Invite ready</span>
              <span className="collab-pill">Recording off</span>
            </div>
          </div>
        )}

        {view === 'report' && (
          <div className="collab-card">
            <div className="collab-card-title">Reporting</div>
            <ul className="collab-report-list">
              <li>Approvals captured</li>
              <li>Run summary pending</li>
              <li>Audit trail export ready</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
