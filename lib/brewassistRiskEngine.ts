// lib/brewassistRiskEngine.ts
// S4.4 — Risk-aware routing + stop / override logic.

import type { BrewRiskMode } from './brewassistPersonality';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskEvaluation {
  level: RiskLevel;
  reasons: string[];
  suggestedAction: 'ALLOW' | 'WARN' | 'BLOCK';
}

export interface RiskContext {
  mode: BrewRiskMode;
  toneHint: 'neutral' | 'engaged' | 'high_stakes' | 'emergency';
  userPrompt: string;
  toolName?: string;
}

export interface RiskDecision {
  allow: boolean;
  requireOverride: boolean;
  messageToUser?: string;
  evaluation: RiskEvaluation;
}

/**
 * Super light risk heuristic. We can enrich this later.
 */
export function evaluateRisk(ctx: RiskContext): RiskEvaluation {
  const lower = ctx.userPrompt.toLowerCase();
  const reasons: string[] = [];

  let level: RiskLevel = 'LOW';

  const dangerousWords = [
    'delete',
    'rm -rf',
    'drop table',
    'truncate',
    'production',
    'prod',
    'secrets',
  ];

  if (dangerousWords.some((w) => lower.includes(w))) {
    level = 'HIGH';
    reasons.push('Prompt contains high-risk operation keywords.');
  } else if (ctx.toneHint === 'high_stakes') {
    level = 'MEDIUM';
    reasons.push('Tone indicates high-stakes change.');
  }

  const suggestedAction: RiskEvaluation['suggestedAction'] =
    level === 'HIGH' ? 'BLOCK' : level === 'MEDIUM' ? 'WARN' : 'ALLOW';

  return { level, reasons, suggestedAction };
}

/**
 * Convert risk evaluation + mode into a concrete gating decision.
 */
export function decideRisk(ctx: RiskContext): RiskDecision {
  const evaluation = evaluateRisk(ctx);

  // Default: allow
  let allow = true;
  let requireOverride = false;
  let messageToUser: string | undefined;

  if (evaluation.level === 'LOW') {
    return { allow, requireOverride, messageToUser, evaluation };
  }

  if (evaluation.level === 'MEDIUM') {
    if (ctx.mode === 'HARD') {
      allow = false;
      requireOverride = true;
      messageToUser =
        "⚠️ BrewAssist: This looks risky. I'm in HARD STOP mode. If you really want to proceed, run `/override yes` and repeat the request.";
    } else if (ctx.mode === 'SOFT') {
      allow = false;
      requireOverride = false;
      messageToUser =
        "⚠️ BrewAssist: Medium-risk action detected. Say **'go ahead'** in your next message to continue.";
    } else {
      // RB mode
      allow = false;
      requireOverride = false;
      messageToUser =
        '⚠️ BrewAssist: I see risk here. If you repeat this request, I will proceed as RB Mode allows.';
    }
  }

  if (evaluation.level === 'HIGH') {
    if (ctx.mode === 'HARD') {
      allow = false;
      requireOverride = true;
      messageToUser =
        '🛑 HARD STOP: This looks like a HIGH-RISK action (prod/secrets/delete). I will not proceed unless you explicitly run `/override yes` and repeat.';
    } else if (ctx.mode === 'SOFT') {
      allow = false;
      requireOverride = false;
      messageToUser =
        "🛑 HIGH-RISK operation detected. Say **'go ahead'** if you still want me to continue.";
    } else {
      // RB mode
      allow = false;
      requireOverride = false;
      messageToUser =
        '🛑 RB Mode: HIGH-RISK action. If you repeat this request, I will proceed — but log this as a flagged action.';
    }
  }

  return { allow, requireOverride, messageToUser, evaluation };
}
