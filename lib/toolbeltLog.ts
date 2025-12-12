// lib/toolbeltLog.ts
import type { ToolbeltBrewMode } from './toolbeltConfig';
import type { ToolbeltTier, RiskLevel } from './toolbeltConfig';

export type ToolbeltEventType =
  | 'mode_changed'
  | 'tier_changed'
  | 'action_blocked'
  | 'action_allowed'
  | 'action_needs_confirm';

export interface ToolbeltEvent {
  type: ToolbeltEventType;
  mode: ToolbeltBrewMode;
  tier: ToolbeltTier;
  actionId?: string;
  riskLevel?: RiskLevel;
  reason?: string;
  timestamp: string;
}

const buffer: ToolbeltEvent[] = [];

export function logToolbeltEvent(event: ToolbeltEvent) {
  buffer.push(event);
  if (buffer.length > 100) buffer.shift();
  // Dev-only log for now
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[ToolbeltEvent]', event);
  }
}

export function getToolbeltEvents(): ToolbeltEvent[] {
  return [...buffer];
}
