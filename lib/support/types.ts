import type { CockpitMode } from '@/lib/brewTypes';

export interface SupportTrace {
  persona: string;
  cockpitMode: CockpitMode;
  activeMode: 'LLM' | 'HRM' | 'AGENT' | 'LOOP';
  capabilityIds: string[];
  input: string;
  response: string;
  devOps8Snapshot: any; // Type to be defined based on DevOps8
  brewTruthScore: number;
  flags: string[];
  timestamp: string;
}

export interface SupportEvaluation {
  trustScore: number;
  riskTier: 'low' | 'medium' | 'high';
  confidenceDelta: number;
  flags: string[];
}
