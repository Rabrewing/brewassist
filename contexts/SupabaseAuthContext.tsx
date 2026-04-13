'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

async function traceAuth(event: string, detail?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/auth-trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, detail }),
      keepalive: true,
    });
  } catch {
    // Trace should never block auth.
  }
}

type SupabaseAuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(
  null
);

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    client ? null : 'Supabase auth env is not configured yet.'
  );

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let active = true;

    client.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError(sessionError.message);
          void traceAuth('get-session-error', {
            message: sessionError.message,
          });
        }
        setSession(data.session ?? null);
        void traceAuth('get-session', {
          hasSession: Boolean(data.session),
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setError(null);
      setLoading(false);
      void traceAuth('auth-state-change', {
        hasSession: Boolean(nextSession),
      });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [client]);

  const value: SupabaseAuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    error,
    signInWithEmail: async (email: string) => {
      if (!client) {
        throw new Error('Supabase auth is not configured');
      }
      setLoading(true);
      setError(null);
      void traceAuth('sign-in-start');
      const { error: signInError } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        void traceAuth('sign-in-error', { message: signInError.message });
        throw signInError;
      }
      setLoading(false);
      void traceAuth('sign-in-requested');
    },
    signOut: async () => {
      if (!client) return;
      await client.auth.signOut();
      setSession(null);
      void traceAuth('sign-out');
    },
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context)
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  return context;
}
