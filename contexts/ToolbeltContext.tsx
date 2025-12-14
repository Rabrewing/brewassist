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
const DEFAULT_TIER: ToolbeltTier = 'T2_GUIDED';

export const ToolbeltProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode: cockpitMode } = useCockpitMode();
  const [mode, setModeState] = useState<ToolbeltBrewMode>(DEFAULT_MODE);
  const [tier, setTierState] = useState<ToolbeltTier>(DEFAULT_TIER);

  const value: ToolbeltContextValue = useMemo(() => {
    const effectiveTier = cockpitMode === 'customer' && tier === 'T3_POWER' ? 'T2_GUIDED' : tier;
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
        if (cockpitMode === 'customer' && next === 'T3_POWER') {
          // In customer mode, silently cap at T2 instead of allowing T3.
          setTierState('T2_GUIDED');
          logToolbeltEvent({
            type: 'tier_changed',
            mode,
            tier: 'T2_GUIDED',
            timestamp: new Date().toISOString(),
            details: 'Attempted to set Tier 3 in customer mode; capped at Tier 2.',
          });
          return;
        }
        setTierState(next);
        logToolbeltEvent({
          type: 'tier_changed',
          mode,
          tier: next,
          timestamp: new Date().toISOString(),
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
