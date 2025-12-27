// contexts/ToolbeltContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import { logToolbeltEvent } from '@/lib/toolbeltLog';
import { useCockpitMode } from './CockpitModeContext';
import { BrewTier } from '@/lib/commands/types'; // Import BrewTier

export type ToolbeltBrewMode = "HRM" | "LLM" | "AGENT" | "LOOP";

export interface ToolbeltState {
  mode: ToolbeltBrewMode;
  tier: BrewTier;
  lastUpdatedAt: string;
}

interface ToolbeltContextValue extends ToolbeltState {
  setMode: (mode: ToolbeltBrewMode) => void;
  setTier: (tier: BrewTier) => void;
}

const ToolbeltContext = createContext<ToolbeltContextValue | null>(null);

const DEFAULT_MODE: ToolbeltBrewMode = 'LLM';
const DEFAULT_TIER: BrewTier = 'basic'; // Updated to BrewTier "basic"

export const ToolbeltProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode: cockpitMode } = useCockpitMode();
  const [mode, setModeState] = useState<ToolbeltBrewMode>(DEFAULT_MODE);
  const [tier, setTierState] = useState<BrewTier>(DEFAULT_TIER);

  const value: ToolbeltContextValue = useMemo(() => {
    const effectiveTier = cockpitMode === 'customer' && tier === 'rb' ? 'pro' : tier; // Updated tier names 'T3_DANGEROUS' to 'rb', 'T2_PATCH' to 'pro'
    const lastUpdatedAt = new Date().toISOString();

    return {
      mode,
      tier,
      lastUpdatedAt,
      setMode: (next) => {
        setModeState(next);
        logToolbeltEvent({
          type: 'mode_changed',
          mode: next,
          tier,
          timestamp: new Date().toISOString(),
        });
      },
      setTier: (next) => {
        if (cockpitMode === 'customer' && next === 'rb') { // Updated tier name 'T3_DANGEROUS' to 'rb'
          // In customer mode, silently cap at pro tier instead of allowing rb.
          setTierState('pro'); // Updated tier name 'T2_PATCH' to 'pro'
          logToolbeltEvent({
            type: 'tier_changed',
            mode: mode, // Use the aliased mode from useMemo scope
            tier: 'pro', // Log the capped tier
            message: 'Customer mode capped rb to pro',
            timestamp: new Date().toISOString(), // Added timestamp
          });
          return;
        }
        setTierState(next);
        logToolbeltEvent({
          type: 'tier_changed',
          mode: mode, // Use the aliased mode from useMemo scope
          tier: next,
          timestamp: new Date().toISOString(), // Added timestamp
        });
      },
    };
  }, [mode, tier, cockpitMode]);

  return <ToolbeltContext.Provider value={value}>{children}</ToolbeltContext.Provider>;
};

export function useToolbelt(): ToolbeltContextValue {
  const ctx = useContext(ToolbeltContext);
  if (!ctx) {
    throw new Error('useToolbelt must be used within a ToolbeltProvider');
  }
  return ctx;
}
