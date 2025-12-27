// lib/toolbeltLog.ts
import type { BrewTier } from '../commands/types'; // Use BrewTier from commands/types
import type { CapabilitySurface } from './capabilities/registry'; // Use CapabilitySurface for mode
import type { RiskLevel } from './brewCognition'; // RiskLevel is defined in brewCognition

export type ToolbeltEventType =
  | 'mode_changed'
  | 'tier_changed'
  | 'action_blocked'
  | 'action_allowed'
  | 'action_needs_confirm';

export interface ToolbeltEvent {
  type: ToolbeltEventType;
  mode: CapabilitySurface; // Use CapabilitySurface
  tier: BrewTier; // Use BrewTier
  timestamp: string;
  message: string;
  details?: any;
}

const buffer: ToolbeltEvent[] = [];

export function logToolbeltEvent(event: ToolbeltEvent) {
  buffer.push(event);
  if (buffer.length > 100) buffer.shift();
  // Dev-only log for now
  if (process.env.NODE_ENV === 'development') {
    console.log('[ToolbeltEvent]', event);
  }
}

export function getToolbeltEvents(): ToolbeltEvent[] {
  return [...buffer];
}
