// contexts/ToolbeltContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ToolbeltBrewMode, ToolbeltTier, ToolbeltRulesSnapshot } from '@/lib/toolbeltConfig';
import { computeToolbeltRules } from '@/lib/toolbeltConfig';
import { logToolbeltEvent } from '@/lib/toolbeltLog';

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
  const [mode, setModeState] = useState<ToolbeltBrewMode>(DEFAULT_MODE);
  const [tier, setTierState] = useState<ToolbeltTier>(DEFAULT_TIER);

  const value: ToolbeltContextValue = useMemo(() => {
    const effectiveRules = computeToolbeltRules(mode, tier);
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
        setTierState(next);
        logToolbeltEvent({
          type: 'tier_changed',
          mode,
          tier: next,
          timestamp: new Date().toISOString(),
        });
      },
    };
  }, [mode, tier]);

  return <ToolbeltContext.Provider value={value}>{children}</ToolbeltContext.Provider>;
};

export function useToolbelt(): ToolbeltContextValue {
  const ctx = useContext(ToolbeltContext);
  if (!ctx) {
    throw new Error('useToolbelt must be used within a ToolbeltProvider');
  }
  return ctx;
}
