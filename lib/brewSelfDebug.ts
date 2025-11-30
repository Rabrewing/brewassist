// File: lib/brewSelfDebug.ts
// Phase: 6.1 Create lib/brewSelfDebug.ts
// Summary: Enables BrewAssist to diagnose and propose fixes for specific failures.

import path from 'path';
import fs from 'fs/promises';
import { getRunDir, getSandboxRoot } from './brewSandbox';
import { logSandboxRun } from './brewLastServer';

export interface SelfDebugInput {
  filePath?: string;
  logSnippet?: string;
  errorMessage: string;
  context?: any; // Additional context like tool name, exit code, etc.
}

export interface SelfDebugResult {
  runId: string;
  analysis: any; // Detailed analysis of the failure
  suggestedFix?: string; // Proposed fix code or description
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  truthScore?: number;
}

/**
 * Analyzes a given failure and generates a diagnosis and potential fix.
 * @param {SelfDebugInput} input The input describing the failure.
 * @returns {Promise<SelfDebugResult>} The result of the debugging analysis.
 */
export async function analyzeFailure(
  input: SelfDebugInput
): Promise<SelfDebugResult> {
  const runId = `debug-${Date.now()}`;
  const runDirectory = path.join(getSandboxRoot(), 'debug', runId);

  console.log(
    `[${runId}] Starting self-debug analysis for: ${input.errorMessage}`
  );

  await fs.mkdir(runDirectory, { recursive: true });

  // --- STEP 1: Capture error (already in input) ---
  // --- STEP 2: Classify the issue (simplified for now) ---
  let classification = 'UNKNOWN_ERROR';
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
  if (input.errorMessage.includes('Toolbelt failed')) {
    classification = 'TOOLBELT_FAILURE';
    severity = 'HIGH';
  } else if (input.errorMessage.includes('TypeScript compile error')) {
    classification = 'COMPILATION_ERROR';
    severity = 'HIGH';
  } else if (input.errorMessage.includes('Persona routing failure')) {
    classification = 'PERSONA_ROUTING_ERROR';
    severity = 'MEDIUM';
  }

  const analysis = {
    errorId: runId,
    timestamp: new Date().toISOString(),
    type: classification,
    severity: severity,
    message: input.errorMessage,
    filePath: input.filePath,
    logSnippet: input.logSnippet,
    context: input.context,
    rootCause: 'Simulated root cause analysis based on error message.', // Placeholder
    recommendFix: true, // Placeholder
  };

  await fs.writeFile(
    path.join(runDirectory, 'analysis.json'),
    JSON.stringify(analysis, null, 2),
    'utf8'
  );

  // --- STEP 3: Recreate Issue in Sandbox (skipped for this initial implementation) ---
  // This would involve using brewSandboxMirror to set up a specific state and re-running the failing command.

  // --- STEP 4: Run Full Diagnostics Suite (skipped for this initial implementation) ---
  // This would involve calling lint, typecheck, tests on the mirrored code.

  // --- STEP 5: Root Cause Analysis (simplified for now) ---
  // The 'analysis' object above contains a placeholder. A real implementation would use LLM to derive this.

  // --- STEP 6: Generate Fix Plan (simplified for now) ---
  let suggestedFix = `Based on the error "${input.errorMessage}", consider checking the relevant code around ${input.filePath || 'the reported context'}.`;
  if (classification === 'TOOLBELT_FAILURE' && input.context?.tool) {
    suggestedFix = `The toolbelt command for '${input.context.tool}' failed. Review the script for '${input.context.tool}' in 'overlays/' and its arguments.`;
  } else if (classification === 'COMPILATION_ERROR') {
    suggestedFix = `A TypeScript compilation error occurred. Check the syntax and types in ${input.filePath || 'the affected files'}.`;
  }
  await fs.writeFile(
    path.join(runDirectory, 'suggestedFix.md'),
    suggestedFix,
    'utf8'
  );

  // --- STEP 7 & 8: Create Sandbox Patch & BrewTruth Review (skipped for this initial implementation) ---
  // This would involve generating a patch and running BrewTruth on it.
  const truthScore = severity === 'HIGH' ? 0.5 : 0.8; // Simulated truth score

  // --- STEP 9: Bundle Everything (skipped for this initial implementation) ---

  // --- STEP 10: Log to BrewLast ---
  await logSandboxRun({
    runId,
    type: 'debug',
    summary: `Self-debug completed for ${classification}: ${input.errorMessage.substring(0, 100)}...`,
    riskLevel: severity,
    truthScore: truthScore,
  });

  console.log(`[${runId}] Self-debug analysis complete.`);

  return {
    runId,
    analysis,
    suggestedFix,
    riskLevel: severity,
    truthScore: truthScore,
  };
}
