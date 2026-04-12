'use client';

import React, { createContext, useContext, useState } from 'react';
import type { CockpitMode } from '@/lib/brewTypes';
import type { HybridWorkflowStage } from '@/lib/hybridWorkflow';

export interface DevOps8RuntimeSnapshot {
  isStreaming: boolean;
  plannerChurnCount: number;
  lastLatencyMs: number;
  interruptions: number;
  chunkCount: number;
  feedbackGaps: number;
  brewLastWrites: number;
  memorySkips: number;
  permissionGatingBlocks: number;
  conflicts: number;
  policyGateFailures: number;
  brewTruthScore: number;
  testConfidence: number;
  schemaDiffsDetected: boolean;
  definedScopeItems: number;
  executedItems: number;
  scopeCreepIncidents: number;
  boundaryViolations: number;
  recentChecks: number;
  coverage: number;
  violations: number;
  cockpitMode: CockpitMode;
  tier: 'basic' | 'pro' | 'rb';
  personaId: string;
  currentStage: HybridWorkflowStage;
  lastRunLabel: string;
  lastUpdatedAt: string;
}

const DEFAULT_RUNTIME: DevOps8RuntimeSnapshot = {
  isStreaming: false,
  plannerChurnCount: 0,
  lastLatencyMs: 0,
  interruptions: 0,
  chunkCount: 0,
  feedbackGaps: 0,
  brewLastWrites: 0,
  memorySkips: 0,
  permissionGatingBlocks: 0,
  conflicts: 0,
  policyGateFailures: 0,
  brewTruthScore: 1,
  testConfidence: 1,
  schemaDiffsDetected: false,
  definedScopeItems: 1,
  executedItems: 0,
  scopeCreepIncidents: 0,
  boundaryViolations: 0,
  recentChecks: 0,
  coverage: 1,
  violations: 0,
  cockpitMode: 'admin',
  tier: 'basic',
  personaId: 'customer',
  currentStage: 'intent',
  lastRunLabel: '',
  lastUpdatedAt: new Date().toISOString(),
};

interface DevOps8RuntimeContextValue {
  runtime: DevOps8RuntimeSnapshot;
  setRuntime: React.Dispatch<React.SetStateAction<DevOps8RuntimeSnapshot>>;
}

const DevOps8RuntimeContext = createContext<
  DevOps8RuntimeContextValue | undefined
>(undefined);

export function DevOps8RuntimeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [runtime, setRuntime] =
    useState<DevOps8RuntimeSnapshot>(DEFAULT_RUNTIME);

  return (
    <DevOps8RuntimeContext.Provider value={{ runtime, setRuntime }}>
      {children}
    </DevOps8RuntimeContext.Provider>
  );
}

export function useDevOps8Runtime() {
  const context = useContext(DevOps8RuntimeContext);
  if (!context) {
    throw new Error(
      'useDevOps8Runtime must be used within a DevOps8RuntimeProvider'
    );
  }
  return context;
}
