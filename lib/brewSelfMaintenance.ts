// File: lib/brewSelfMaintenance.ts
// Phase: 5.1 Create lib/brewSelfMaintenance.ts
// Summary: Orchestrates the full self-maintenance loop within the sandbox.

import { ensureSandboxDirs, getRunDir, getMirrorRoot } from './brewSandbox';
import { buildMirror } from './brewSandboxMirror';
import { computeDiff } from './brewDiffEngine';
import { createPatchBundle, PatchBundleMeta } from './brewPatchEngine';
import { buildInsights, InsightSummary } from './brewInsightEngine';
import {
  generateUpgradeSuggestions,
  UpgradeSuggestion,
} from './brewUpgradeSuggestion';
import { logSandboxRun } from './brewLastServer';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process'; // For running shell commands like lint/test/typecheck

// Placeholder for BrewTruth integration
// In a real scenario, this would be an import from a BrewTruth module or an API call
type BrewTruthReview = {
  truthScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
  summary: string;
};

export type SelfMaintenanceMode = 'manual' | 'scheduled' | 'event' | 'persona';

export interface SelfMaintenanceResult {
  runId: string;
  issuesFound: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  truthScore?: number;
  changedFiles: string[];
  patchPath?: string;
  insights?: InsightSummary;
  suggestions?: UpgradeSuggestion[];
}

/**
 * Runs the full self-maintenance loop within the sandbox.
 * @param {object} [options] Options for the maintenance run.
 * @param {SelfMaintenanceMode} [options.mode="manual"] The mode of the maintenance run.
 * @param {string} [options.trigger] The event or reason that triggered the run.
 * @returns {Promise<SelfMaintenanceResult>} The result of the maintenance run.
 */
export async function runSelfMaintenance(options?: {
  mode?: SelfMaintenanceMode;
  trigger?: string;
}): Promise<SelfMaintenanceResult> {
  const mode = options?.mode || 'manual';
  const runId = `s4-5-${Date.now()}`;
  const runDirectory = getRunDir(runId);

  console.log(`[${runId}] Starting self-maintenance run in ${mode} mode.`);

  let issuesFound = 0;
  let overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' = 'UNKNOWN';
  let overallTruthScore: number | undefined;
  let changedFiles: string[] = [];
  let patchPath: string | undefined;
  let insights: InsightSummary | undefined;
  let suggestions: UpgradeSuggestion[] | undefined;

  try {
    // 1. Generate runId (already done above)
    // 2. Ensure sandbox directories exist
    await ensureSandboxDirs();
    await fs.mkdir(runDirectory, { recursive: true });

    // 3. Build mirror
    console.log(`[${runId}] Building sandbox mirror...`);
    const mirrorSummary = await buildMirror(runId, 'full');
    console.log(
      `[${runId}] Mirror built. Roots copied: ${mirrorSummary.rootsIncluded.length}`
    );

    // 4. Run Scan Engine (Placeholder - calls to external tools/APIs)
    console.log(`[${runId}] Running Scan Engine (lint, typecheck, tests)...`);
    // In a real implementation, these would call shell scripts or APIs
    // For now, we'll simulate or use basic exec calls
    const scanResults: { type: string; output: string; error?: string }[] = [];

    // Example: Run lint (assuming a lint script exists and outputs to stdout/stderr)
    try {
      const { stdout, stderr } = await new Promise<{
        stdout: string;
        stderr: string;
      }>((resolve, reject) => {
        exec(
          'pnpm lint --json',
          { cwd: getMirrorRoot() },
          (error, stdout, stderr) => {
            if (error && error.code !== 0) {
              // Lint often exits with 1 on errors, but we want the output
              return resolve({ stdout, stderr });
            }
            resolve({ stdout, stderr });
          }
        );
      });
      scanResults.push({ type: 'lint', output: stdout, error: stderr });
      // Basic check for lint errors
      if (stdout.includes('"severity": "error"')) {
        // Very basic check
        issuesFound++;
      }
    } catch (e) {
      console.warn(`[${runId}] Lint scan failed: ${e}`);
      scanResults.push({ type: 'lint', output: '', error: String(e) });
    }
    await fs.writeFile(
      path.join(runDirectory, 'scan.json'),
      JSON.stringify(scanResults, null, 2),
      'utf8'
    );
    console.log(
      `[${runId}] Scan Engine complete. Issues found (pre-diagnostic): ${issuesFound}`
    );

    // 5. Run Diagnostic Engine logic (Placeholder)
    console.log(`[${runId}] Running Diagnostic Engine...`);
    // This would parse scanResults and classify issues
    const diagnosticResults = [
      {
        severity: issuesFound > 0 ? 'ERROR' : 'NOTICE',
        classification: 'CODE_QUALITY',
        message:
          issuesFound > 0
            ? 'Lint errors detected'
            : 'No major issues detected by lint',
        component: 'lint',
        file: 'N/A',
        requiresFix: issuesFound > 0,
      },
    ];
    await fs.writeFile(
      path.join(runDirectory, 'diagnostics.json'),
      JSON.stringify(diagnosticResults, null, 2),
      'utf8'
    );
    console.log(`[${runId}] Diagnostic Engine complete.`);

    // 6. (Initial version) Fix Generator (stubbed for now)
    console.log(`[${runId}] Fix Generator (stubbed)...`);
    // For S4.5 baseline, it's okay to log issues and not yet auto-write code.
    // If implementing, write changes only under mirror paths.
    // Example: if diagnosticResults indicates a simple fix, apply it to the mirror here.

    // 7. Run Diff & Patch
    console.log(`[${runId}] Computing diff and creating patch bundle...`);
    const diffResult = await computeDiff(runId);
    changedFiles = diffResult.changedFiles;
    const patchBundleMeta: PatchBundleMeta = await createPatchBundle(runId, {
      diffText: diffResult.diffText,
      changedFiles: diffResult.changedFiles,
    });
    patchPath = patchBundleMeta.patchPath;
    console.log(
      `[${runId}] Diff computed. Changed files: ${changedFiles.length}. Patch created at: ${patchPath}`
    );

    // 8. Run BrewTruth Analyzer (Placeholder - call existing truth engine)
    console.log(`[${runId}] Running BrewTruth Analyzer...`);
    const truthReview: BrewTruthReview = {
      // Simulated truth review
      truthScore: changedFiles.length > 0 ? 0.75 : 0.95, // Lower score if changes, higher if no changes
      riskLevel: changedFiles.length > 0 ? 'MEDIUM' : 'LOW',
      flags: [],
      summary: 'Simulated truth review based on changes.',
    };
    await fs.writeFile(
      path.join(runDirectory, 'truthReview.json'),
      JSON.stringify(truthReview, null, 2),
      'utf8'
    );
    overallRisk = truthReview.riskLevel;
    overallTruthScore = truthReview.truthScore;
    console.log(
      `[${runId}] BrewTruth Analyzer complete. Risk: ${overallRisk}, Truth Score: ${overallTruthScore}`
    );

    // 9. Run Insights & Suggestions
    console.log(`[${runId}] Generating insights and upgrade suggestions...`);
    insights = await buildInsights(runId);
    suggestions = await generateUpgradeSuggestions(runId);
    console.log(`[${runId}] Insights and suggestions generated.`);

    // 10. BrewLast Logging
    console.log(`[${runId}] Logging to BrewLast...`);
    await logSandboxRun({
      runId,
      type: 'maintenance', // All self-maintenance modes map to 'maintenance' for logging
      summary:
        insights?.summaryText ||
        `Self-maintenance run completed with ${issuesFound} issues.`,
      riskLevel: overallRisk,
      truthScore: overallTruthScore,
      patchPath: patchPath,
    });
    console.log(`[${runId}] Logged to BrewLast.`);
  } catch (error) {
    console.error(`[${runId}] Self-maintenance run failed:`, error);
    // Log failure to BrewLast as well
    await logSandboxRun({
      runId,
      type: 'maintenance',
      summary: `Self-maintenance run failed: ${error instanceof Error ? error.message : String(error)}`,
      riskLevel: 'HIGH',
      truthScore: 0,
    });
    throw error; // Re-throw to indicate failure
  }

  console.log(`[${runId}] Self-maintenance run finished.`);
  return {
    runId,
    issuesFound,
    riskLevel: overallRisk,
    truthScore: overallTruthScore,
    changedFiles,
    patchPath,
    insights,
    suggestions,
  };
}
