// lib/brewcontext/types.ts

export interface BrewContextData {
  // Current intent summary
  currentIntent?: string;

  // Active constraints
  activeConstraints?: string[];

  // Last tool used
  lastToolUsed?: string;

  // Current phase/task ID
  currentPhaseId?: string;

  // Session info
  sessionId?: string;
  startedAt?: string;

  // Working memory items
  workingMemory?: Record<string, any>;
}

export interface BrewContextOptions {
  // Whether to persist across sessions (future)
  persist?: boolean;
}
