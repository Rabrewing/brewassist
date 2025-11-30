// lib/brewassistMaintenance.ts
// S4.4 — Self-maintenance skeleton: health checks + sandbox suggestions.

import fs from 'fs';
import path from 'path';

export interface HealthCheckResult {
  ok: boolean;
  warnings: string[];
  errors: string[];
  details: Record<string, unknown>;
}

export interface MaintenanceSuggestion {
  id: string;
  kind: 'missing-file' | 'route-health' | 'toolbelt-health' | 'sandbox-health';
  description: string;
  targetPath?: string;
  fixPlanSummary?: string;
}

/**
 * Root of the BrewExec repo. In WSL this is /home/brewexec.
 */
export const BREWEXEC_ROOT = process.env.BREWEXEC_ROOT || '/home/brewexec';

/**
 * Convenience helper for sandbox path resolution.
 */
export function sandboxPath(relative: string): string {
  const base = path.join(BREWEXEC_ROOT, 'sandbox');
  return path.join(base, relative);
}

/**
 * Very small set of health checks for S4.4.
 * S4.5 can expand this into tool-by-tool diagnostics.
 */
export function runBrewAssistHealthChecks(): HealthCheckResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const details: Record<string, unknown> = {};

  const essentialFiles = [
    'pages/api/llm-tool-call.ts',
    'pages/api/brewlast.ts',
    'pages/api/brewtruth.ts',
    'lib/brewLast.ts',
    'lib/brewtruth.ts',
  ];

  details['root'] = BREWEXEC_ROOT;

  essentialFiles.forEach((rel) => {
    const full = path.join(BREWEXEC_ROOT, rel);
    if (!fs.existsSync(full)) {
      errors.push(`Missing critical file: ${rel}`);
    }
  });

  const sandboxDir = path.join(BREWEXEC_ROOT, 'sandbox');
  if (!fs.existsSync(sandboxDir)) {
    warnings.push(
      'sandbox/ directory does not exist yet (will be created on first use).'
    );
  } else {
    details['sandboxContents'] = fs.readdirSync(sandboxDir);
  }

  return {
    ok: errors.length === 0,
    warnings,
    errors,
    details,
  };
}

/**
 * Tiny suggestion engine for now, used by /api/brewassist-suggest.
 * S4.5 can call this after a specific tool failure.
 */
export function generateMaintenanceSuggestions(): MaintenanceSuggestion[] {
  const suggestions: MaintenanceSuggestion[] = [];
  const sandboxDir = path.join(BREWEXEC_ROOT, 'sandbox');

  if (!fs.existsSync(sandboxDir)) {
    suggestions.push({
      id: 'create-sandbox-dir',
      kind: 'sandbox-health',
      description:
        'Create sandbox/ folder for BrewAssist self-repair patches so production code is never modified directly.',
      targetPath: sandboxDir,
      fixPlanSummary:
        'mkdir sandbox && route all auto-generated patches there.',
    });
  }

  // Placeholder for more advanced heuristics later.
  return suggestions;
}
