'use client';

import React, { useState } from 'react';

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

type PublicAuthPanelProps = {
  title?: string;
  subtitle?: string;
  compact?: boolean;
};

export function PublicAuthPanel({
  title = 'Sign in or create your account',
  subtitle = 'Use a magic link to enter BrewAssist. New users and returning users use the same flow.',
  compact = false,
}: PublicAuthPanelProps) {
  const { signInWithEmail, loading, error } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    try {
      await signInWithEmail(email.trim());
      setStatus('Check your email for the sign-in link.');
    } catch (err: any) {
      setStatus(
        err?.message
          ? `Sign-in failed: ${err.message}`
          : 'Sign-in failed. Try again.'
      );
    }
  };

  return (
    <section className={`public-auth-panel ${compact ? 'is-compact' : ''}`}>
      <div className="public-landing-kicker">Access BrewAssist</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <form className="public-landing-form public-auth-form" onSubmit={submit}>
        <input
          type="email"
          id={compact ? 'pricing-email' : 'landing-email'}
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="public-landing-input"
          autoComplete="email"
          required
        />
        <button
          type="submit"
          className="public-landing-button public-landing-button--primary"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Email Magic Link'}
        </button>
        <button
          type="submit"
          className="public-landing-button public-landing-button--ghost"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Create Account'}
        </button>
      </form>
      <div className="public-auth-meta">
        <span>
          Magic link works for both sign-in and first-time account creation.
        </span>
        <a href="mailto:hello@brewassist.app">Need enterprise onboarding?</a>
      </div>
      {(status || error) && (
        <div className="public-landing-status">{status || error}</div>
      )}
    </section>
  );
}
