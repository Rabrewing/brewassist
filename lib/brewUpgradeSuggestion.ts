// File: lib/brewUpgradeSuggestion.ts
// Phase: 4.2 Create lib/brewUpgradeSuggestion.ts
// Summary: Generates upgrade suggestions based on sandbox run analysis.

import path from 'path';
import fs from 'fs/promises';
import { getRunDir, getSandboxRoot } from './brewSandbox';
import { InsightSummary } from './brewInsightEngine'; // Assuming InsightSummary is exported

export type UpgradeSuggestion = {
  id: string;
  type: 'refactor' | 'feature' | 'doc' | 'test' | 'performance' | 'security';
  component: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  justification: string;
  proposal: string;
  estimatedComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedEffort: string; // e.g., "1-2 hours", "1 day"
  filesToTouch: string[];
  sandboxPatchPath?: string; // Path to a generated patch if applicable
  createdAt: string;
};

/**
 * Generates upgrade suggestions based on the analysis of a sandbox run.
 * @param {string} runId The ID of the current sandbox run.
 * @returns {Promise<UpgradeSuggestion[]>} An array of generated upgrade suggestions.
 */
export async function generateUpgradeSuggestions(
  runId: string
): Promise<UpgradeSuggestion[]> {
  const runDirectory = getRunDir(runId);
  const suggestionsFilePath = path.join(runDirectory, 'suggestions.json');
  const latestSuggestionsFilePath = path.join(
    getSandboxRoot(),
    'suggestions',
    'latest.json'
  );

  let insights: InsightSummary | undefined;
  let diagnosticResult: any[] = []; // Placeholder for diagnostic details

  try {
    insights = JSON.parse(
      await fs.readFile(path.join(runDirectory, 'insights.json'), 'utf8')
    );
  } catch (e) {
    /* ignore if file not found */
  }
  try {
    diagnosticResult = JSON.parse(
      await fs.readFile(path.join(runDirectory, 'diagnostics.json'), 'utf8')
    );
  } catch (e) {
    /* ignore if file not found */
  }

  const suggestions: UpgradeSuggestion[] = [];

  // Example logic for generating suggestions (this will be expanded and made more intelligent)
  if (insights) {
    if (insights.issuesBySeverity.ERROR > 0) {
      suggestions.push({
        id: `upgrade-${runId}-critical-errors`,
        type: 'refactor',
        component: 'core-logic',
        title: 'Address Critical Errors Identified in Scan',
        severity: 'HIGH',
        justification: `The scan identified ${insights.issuesBySeverity.ERROR} critical errors that need immediate attention.`,
        proposal:
          'Review diagnostic reports and implement fixes for all ERROR level issues.',
        estimatedComplexity: 'HIGH',
        riskLevel: 'MEDIUM', // Fixing errors is generally medium risk if done carefully
        estimatedEffort: 'Varies based on error complexity',
        filesToTouch: [], // This would be populated from diagnosticResult
        createdAt: new Date().toISOString(),
      });
    }

    if (insights.issuesBySeverity.WARNING > 0) {
      suggestions.push({
        id: `upgrade-${runId}-warnings`,
        type: 'refactor',
        component: 'code-quality',
        title: 'Refactor Code to Resolve Warnings',
        severity: 'MEDIUM',
        justification: `The scan identified ${insights.issuesBySeverity.WARNING} warnings that could lead to future issues or indicate suboptimal code.`,
        proposal:
          'Review and refactor code sections flagged by warnings to improve maintainability and prevent potential bugs.',
        estimatedComplexity: 'MEDIUM',
        riskLevel: 'LOW',
        estimatedEffort: '1-2 days',
        filesToTouch: [], // This would be populated from diagnosticResult
        createdAt: new Date().toISOString(),
      });
    }

    if (
      insights.riskLevel === 'HIGH' &&
      insights.truthScore &&
      insights.truthScore < 0.8
    ) {
      suggestions.push({
        id: `upgrade-${runId}-truth-risk`,
        type: 'security',
        component: 'brewtruth-engine',
        title: 'Review High-Risk/Low-Truth Changes',
        severity: 'HIGH',
        justification: `A high-risk change with a low truth score (${insights.truthScore.toFixed(2)}) was detected, indicating potential inconsistencies or unsafe modifications.`,
        proposal:
          'Thoroughly review the proposed changes and the truth analysis to understand the underlying reasons for the high risk and low truth score. Re-evaluate the necessity and safety of these changes.',
        estimatedComplexity: 'HIGH',
        riskLevel: 'HIGH',
        estimatedEffort: '1 day',
        filesToTouch: [],
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Ensure the suggestions directory exists
  await fs.mkdir(path.dirname(latestSuggestionsFilePath), { recursive: true });

  await fs.writeFile(
    suggestionsFilePath,
    JSON.stringify(suggestions, null, 2),
    'utf8'
  );
  await fs.writeFile(
    latestSuggestionsFilePath,
    JSON.stringify(suggestions, null, 2),
    'utf8'
  );

  return suggestions;
}
