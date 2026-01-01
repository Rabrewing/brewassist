export interface BrewLastSnapshot {
  lastMode: 'admin' | 'customer';
  lastPersona: string;
  lastTier: number;
  lastToolbelt: string[]; // capability IDs used
  lastSessionId: string;
  lastBuildOutcome: {
    lint: boolean;
    typecheck: boolean;
    test: boolean;
    uiTest: boolean;
    build: boolean;
  };
  lastRepoRef?: string;
  lastUpdated: string;
  skippedReason?: string; // if write was skipped
}

export const BREWLAST_FILE = '.brewlast.json';
