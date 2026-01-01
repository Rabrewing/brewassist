// lib/brewcontext/store.ts

import type { BrewContextData } from './types';

// In-memory store for BrewContext
let currentContext: BrewContextData | null = null;

export function getBrewContext(): BrewContextData | null {
  return currentContext;
}

export function setBrewContext(context: BrewContextData): void {
  currentContext = { ...context };
}

export function updateBrewContext(updates: Partial<BrewContextData>): void {
  if (currentContext) {
    currentContext = {
      ...currentContext,
      ...updates,
      workingMemory: {
        ...currentContext.workingMemory,
        ...updates.workingMemory,
      },
    };
  } else {
    currentContext = { ...updates };
  }
}

export function clearBrewContext(): void {
  currentContext = null;
}

export function initializeBrewContext(sessionId?: string): BrewContextData {
  const context: BrewContextData = {
    sessionId: sessionId || generateSessionId(),
    startedAt: new Date().toISOString(),
    activeConstraints: [],
    workingMemory: {},
  };

  setBrewContext(context);
  return context;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Convenience getters
export function getCurrentIntent(): string | undefined {
  return currentContext?.currentIntent;
}

export function getActiveConstraints(): string[] {
  return currentContext?.activeConstraints || [];
}

export function getLastToolUsed(): string | undefined {
  return currentContext?.lastToolUsed;
}

export function getCurrentPhaseId(): string | undefined {
  return currentContext?.currentPhaseId;
}

export function getSessionId(): string | undefined {
  return currentContext?.sessionId;
}
