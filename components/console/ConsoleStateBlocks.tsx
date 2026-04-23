import React from 'react';

export function ConsoleLoadingCard({ label }: { label: string }) {
  return (
    <section className="console-card">
      <div className="console-card-heading">
        <strong>{label}</strong>
      </div>
      <div className="public-landing-status">Loading hosted control-plane data…</div>
    </section>
  );
}

export function ConsoleErrorCard({ message }: { message: string }) {
  return (
    <section className="console-card">
      <div className="console-card-heading">
        <strong>Control-Plane Error</strong>
      </div>
      <div className="public-landing-status">Console data failed: {message}</div>
    </section>
  );
}
