/* eslint-disable react/no-unknown-property */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

type DeviceFlowModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: (accessToken: string) => void;
};

export function DeviceFlowModal({
  open,
  onClose,
  onSuccess,
}: DeviceFlowModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string | null>(null);
  const [intervalSec, setIntervalSec] = useState(5);
  const [polling, setPolling] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isCheckingRef = useRef(false);

  const clearDeviceFlow = useCallback(() => {
    localStorage.removeItem('github_device_code');
    localStorage.removeItem('github_user_code');
    localStorage.removeItem('github_verification_uri');
    localStorage.removeItem('github_poll_interval');
    localStorage.removeItem('github_device_expires');
    setDeviceCode(null);
    setUserCode(null);
    setVerificationUri(null);
    setPolling(false);
  }, []);

  const saveDeviceFlow = (
    code: string,
    userCodeVal: string,
    uri: string,
    intervalVal: number
  ) => {
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    localStorage.setItem('github_device_code', code);
    localStorage.setItem('github_user_code', userCodeVal);
    localStorage.setItem('github_verification_uri', uri);
    localStorage.setItem('github_poll_interval', intervalVal.toString());
    localStorage.setItem('github_device_expires', expires.toString());
  };

  const checkActivation = useCallback(async () => {
    if (!deviceCode || isCheckingRef.current) return;

    isCheckingRef.current = true;
    try {
      const res = await fetch('/api/auth/device/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_code: deviceCode }),
      });
      const data = await res.json();

      if (data.access_token) {
        setPolling(false);
        clearDeviceFlow();
        onSuccess(data.access_token);
      } else if (data.error === 'authorization_pending') {
        // Still waiting
      } else if (data.error === 'slow_down') {
        setIntervalSec((prev) => prev + 5);
      } else if (data.error === 'expired_token') {
        setError('Code expired. Please get a new code.');
        setPolling(false);
        clearDeviceFlow();
      } else if (data.error) {
        // Other errors might be fatal or just temporary
        if (data.error !== 'authorization_pending') {
          console.warn('GitHub Auth Error:', data.error);
        }
      }
    } catch (err) {
      console.error('Check activation error:', err);
    } finally {
      isCheckingRef.current = false;
    }
  }, [deviceCode, clearDeviceFlow, onSuccess]);

  const startDeviceFlow = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/device/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.device_code) {
        setDeviceCode(data.device_code);
        setUserCode(data.user_code);
        setVerificationUri(data.verification_uri);
        const interval = data.interval || 5;
        setIntervalSec(interval);
        setPolling(true);
        saveDeviceFlow(
          data.device_code,
          data.user_code,
          data.verification_uri,
          interval
        );
      } else {
        setError(data.error_description || 'Failed to start device flow');
      }
    } catch (err) {
      setError('Failed to start device flow');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialization logic
  useEffect(() => {
    if (!open) {
      setPolling(false);
      return;
    }

    const savedCode = localStorage.getItem('github_device_code');
    const savedUserCode = localStorage.getItem('github_user_code');
    const savedUri = localStorage.getItem('github_verification_uri');
    const savedInterval = localStorage.getItem('github_poll_interval');
    const savedExpires = localStorage.getItem('github_device_expires');

    if (savedCode && savedUserCode && savedUri) {
      const expires = parseInt(savedExpires || '0', 10);
      if (expires > Date.now()) {
        setDeviceCode(savedCode);
        setUserCode(savedUserCode);
        setVerificationUri(savedUri);
        setIntervalSec(parseInt(savedInterval || '5', 10));
        setPolling(true);
      } else {
        clearDeviceFlow();
        startDeviceFlow();
      }
    } else {
      startDeviceFlow();
    }
  }, [open, clearDeviceFlow, startDeviceFlow]);

  // Polling interval
  useEffect(() => {
    if (!polling || !deviceCode) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      checkActivation();
    }, intervalSec * 1000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [polling, deviceCode, intervalSec, checkActivation]);

  // Tab focus auto-detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && polling) {
        checkActivation();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [polling, checkActivation]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Connect GitHub</h2>
          <button className="btn-close-icon" onClick={onClose}>&times;</button>
        </div>

        {loading && !deviceCode && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Initiating secure connection...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button className="btn-retry" onClick={startDeviceFlow}>Try Again</button>
          </div>
        )}

        {userCode && !error && (
          <div className="device-flow-steps">
            <div className="step-item">
              <span className="step-num">1</span>
              <p>Enter this code on GitHub:</p>
            </div>
            
            <div className="user-code-container">
              <div className="user-code">{userCode}</div>
              <button 
                className="btn-copy" 
                onClick={() => {
                  navigator.clipboard.writeText(userCode);
                }}
                title="Copy code"
              >
                📋
              </button>
            </div>

            <div className="step-item">
              <span className="step-num">2</span>
              <p>Authorize the application:</p>
            </div>

            <a
              href={verificationUri || 'https://github.com/login/device'}
              target="_blank"
              rel="noopener noreferrer"
              className="device-link"
            >
              Open GitHub Authorization
            </a>

            <div className="info-box">
              <p>
                <strong>Pro Tip:</strong> After you click authorize on GitHub, 
                come back here. We&apos;ll automatically detect the connection.
              </p>
            </div>

            {polling && (
              <div className="polling-indicator">
                <div className="pulse-dot"></div>
                <span>Waiting for GitHub...</span>
              </div>
            )}

            <button
              type="button"
              className="btn-check-now"
              onClick={() => {
                checkActivation();
              }}
              disabled={isCheckingRef.current}
            >
              {isCheckingRef.current ? 'Checking...' : 'Check Status Now'}
            </button>
          </div>
        )}

        <div className="modal-actions">
          <button
            onClick={() => {
              clearDeviceFlow();
              onClose();
            }}
            className="btn-cancel"
          >
            Cancel
          </button>
          {deviceCode && (
            <button
              onClick={() => {
                clearDeviceFlow();
                startDeviceFlow();
              }}
              className="btn-refresh"
            >
              Refresh Code
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .modal-content {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          color: #c9d1d9;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          color: #f0f6fc;
        }
        .btn-close-icon {
          background: transparent;
          border: none;
          color: #8b949e;
          font-size: 24px;
          cursor: pointer;
          line-height: 1;
        }
        .btn-close-icon:hover {
          color: #f0f6fc;
        }
        .loading-state {
          text-align: center;
          padding: 40px 0;
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(56, 139, 253, 0.2);
          border-top-color: #58a6ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .user-code-container {
          position: relative;
          margin: 12px 0 24px;
        }
        .user-code {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 2px;
          text-align: center;
          padding: 20px;
          background: #161b22;
          border: 1px dashed #30363d;
          border-radius: 8px;
          color: #58a6ff;
        }
        .btn-copy {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: #21262d;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          opacity: 0.7;
        }
        .btn-copy:hover {
          opacity: 1;
          background: #30363d;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .step-num {
          background: #238636;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          flex-shrink: 0;
        }
        .device-link {
          display: block;
          width: 100%;
          padding: 14px;
          background: #238636;
          color: #ffffff;
          text-align: center;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-bottom: 24px;
          transition: background 0.2s;
        }
        .device-link:hover {
          background: #2ea043;
        }
        .info-box {
          background: rgba(56, 139, 253, 0.1);
          border: 1px solid rgba(56, 139, 253, 0.2);
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .polling-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 14px;
          color: #8b949e;
          margin-bottom: 16px;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(59, 130, 246, 0.4);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .btn-check-now {
          width: 100%;
          padding: 12px;
          background: #21262d;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #c9d1d9;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-check-now:hover:not(:disabled) {
          background: #30363d;
          border-color: #8b949e;
        }
        .btn-check-now:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .modal-actions {
          margin-top: 32px;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          border-top: 1px solid #30363d;
          padding-top: 20px;
        }
        .btn-cancel {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #8b949e;
          cursor: pointer;
        }
        .btn-cancel:hover {
          color: #f0f6fc;
          border-color: #8b949e;
        }
        .btn-refresh {
          padding: 8px 16px;
          background: #21262d;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #c9d1d9;
          cursor: pointer;
        }
        .btn-refresh:hover {
          background: #30363d;
        }
        .error-message {
          color: #f85149;
          background: rgba(248, 81, 73, 0.1);
          border: 1px solid rgba(248, 81, 73, 0.2);
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .btn-retry {
          margin-top: 10px;
          background: #f85149;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
