// lib/brewTruthGateway.ts
import type { BrewMode } from './brewModes';

export type BrewTruthDecision =
  | { action: 'proceed'; message?: string }
  | { action: 'confirm'; message: string }
  | { action: 'block'; message: string };

export function decideFromTruth(
  mode: BrewMode,
  truthScore: number,
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH',
  summary: string
): BrewTruthDecision {
  // LOW + MEDIUM => always allowed, just annotate.
  if (riskLevel === 'LOW' || riskLevel === 'MEDIUM') {
    return {
      action: 'proceed',
      message: summary,
    };
  }

  // HIGH risk => behavior depends on mode.
  switch (mode) {
    case 'hard':
      return {
        action: 'block',
        message:
          '⚠️ BrewTruth flagged this as HIGH-risk. In Hard Stop mode I’m not allowed to continue.\n\n' +
          'Summary: ' +
          summary +
          '\n\nIf you truly need to proceed, update your mode or run this in a safer environment.',
      };

    case 'soft':
      return {
        action: 'confirm',
        message:
          '⚠️ BrewTruth flagged this as HIGH-risk.\n\n' +
          'Summary: ' +
          summary +
          '\n\nIf you still want to continue, say **“go ahead”** or restate the request explicitly.',
      };

    case 'rb':
    default:
      return {
        action: 'confirm',
        message:
          '⚠️ BrewTruth flagged this as HIGH-risk, but you’re in **RB Mode**.\n\n' +
          'Summary: ' +
          summary +
          '\n\nIf you repeat or confirm this request, I’ll proceed without further safety prompts.',
      };
  }
}
