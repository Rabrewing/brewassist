import React, { useState, useEffect } from 'react';
import { useRepoConnection } from '@/contexts/RepoConnectionContext';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';

interface SandboxDiffModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SandboxDiffModal({ open, onClose, onSuccess }: SandboxDiffModalProps) {
  const { repoProvider, repoRoot, githubToken, gitlabToken, bitbucketToken } = useRepoConnection();
  const { orgId } = useEnterpriseSelection();
  
  const [loading, setLoading] = useState(true);
  const [diff, setDiff] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchDiff = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/sandbox/diff', {
          headers: {
            'x-brewassist-repo-provider': repoProvider,
            'x-brewassist-repo-root': repoRoot,
            ...(orgId ? { 'x-brewassist-org-id': orgId } : {}),
          },
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to fetch diff');
        
        if (!data.hasChanges) {
          setDiff('No unstaged or staged changes found in the sandbox.');
        } else {
          setDiff(data.diff);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiff();
  }, [open, repoProvider, repoRoot, orgId]);

  const handlePush = async () => {
    if (!commitMessage.trim()) {
      setError('Please provide a commit message.');
      return;
    }

    setPushing(true);
    setError(null);

    let token = '';
    if (repoProvider === 'github') token = githubToken || '';
    if (repoProvider === 'gitlab') token = gitlabToken || '';
    if (repoProvider === 'bitbucket') token = bitbucketToken || '';

    try {
      const res = await fetch('/api/sandbox/apply-live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-brewassist-repo-provider': repoProvider,
          'x-brewassist-repo-root': repoRoot,
          ...(orgId ? { 'x-brewassist-org-id': orgId } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ commitMessage })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to push changes');

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPushing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ maxWidth: '800px', width: '90vw' }}>
        <div className="modal-header">
          <h2>Review Sandbox Changes</h2>
          <button className="btn-close-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="diff-viewer" style={{ 
          background: '#0d1117', 
          border: '1px solid #30363d', 
          borderRadius: '6px', 
          padding: '1rem',
          maxHeight: '400px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          whiteSpace: 'pre-wrap',
          color: '#e2e8f0',
          marginBottom: '1rem'
        }}>
          {loading ? 'Loading diff...' : diff || 'No changes to display.'}
        </div>

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Commit Message</label>
          <input 
            type="text" 
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="e.g. Update UI layout and fix spacing issues"
            style={{ 
              background: '#0f172a', 
              border: '1px solid #1e293b', 
              color: 'white', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '4px',
              width: '100%'
            }}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handlePush}
            disabled={pushing || loading || !diff || diff.includes('No unstaged')}
            style={{ 
              background: '#00c7b7', 
              color: '#020617', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px', 
              fontWeight: '600',
              cursor: pushing ? 'not-allowed' : 'pointer',
              opacity: pushing || !diff || diff.includes('No unstaged') ? 0.5 : 1
            }}
          >
            {pushing ? 'Pushing to remote...' : 'Confirm & Push'}
          </button>
        </div>
      </div>
    </div>
  );
}