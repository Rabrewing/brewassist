// contexts/ToolbeltContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ToolbeltBrewMode, ToolbeltTier, ToolbeltRulesSnapshot } from '@/lib/toolbeltConfig';
import { computeToolbeltRules } from '@/lib/toolbeltConfig';
import { logToolbeltEvent } from '@/lib/toolbeltLog';
import { useCockpitMode } from './CockpitModeContext';

export interface ToolbeltState {
  mode: ToolbeltBrewMode;
  tier: ToolbeltTier;
  effectiveRules: ToolbeltRulesSnapshot;
  lastUpdatedAt: string;
}

interface ToolbeltContextValue extends ToolbeltState {
  setMode: (mode: ToolbeltBrewMode) => void;
  setTier: (tier: ToolbeltTier) => void;
}

const ToolbeltContext = createContext<ToolbeltContextValue | null>(null);

const DEFAULT_MODE: ToolbeltBrewMode = 'LLM';
const DEFAULT_TIER: ToolbeltTier = 'T1_SAFE'; // Updated to new ToolbeltTier

export const ToolbeltProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode: cockpitMode } = useCockpitMode();
  const [mode, setModeState] = useState<ToolbeltBrewMode>(DEFAULT_MODE);
  const [tier, setTierState] = useState<ToolbeltTier>(DEFAULT_TIER);

  const value: ToolbeltContextValue = useMemo(() => {
    const effectiveTier = cockpitMode === 'customer' && tier === 'T3_DANGEROUS' ? 'T2_PATCH' : tier; // Updated tier names
    const effectiveRules = computeToolbeltRules(mode, effectiveTier, cockpitMode); // Pass cockpitMode
    const lastUpdatedAt = new Date().toISOString();

    return {
      mode,
      tier,
      effectiveRules,
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
        if (cockpitMode === 'customer' && next === 'T3_DANGEROUS') { // Updated tier name
          // In customer mode, silently cap at T2 instead of allowing T3.
          setTierState('T2_PATCH'); // Updated tier name
          logToolbeltEvent({
            type: 'tier_changed',
            mode: mode, // Use the aliased mode from useMemo scope
            tier: 'T2_PATCH', // Log the capped tier
            reason: 'Customer mode capped T3 to T2',
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
