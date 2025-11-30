// File: lib/brewInsightEngine.ts
// Phase: 4.1 Create lib/brewInsightEngine.ts
// Summary: Generates human-readable insights from scan, diagnostic, and truth review data.

import path from 'path';
import fs from 'fs/promises';
import { getRunDir, getSandboxRoot } from './brewSandbox';
import { BrewTruthReview } from './brewLast'; // Assuming BrewTruthReview is defined here or similar

export type InsightSummary = {
  runId: string;
  totalIssues: number;
  issuesBySeverity: { ERROR: number; WARNING: number; NOTICE: number };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  truthScore?: number;
  suggestedPriorities: string[];
  summaryText: string;
  createdAt: string;
};

// Placeholder types for scan and diagnostic results
type ScanResult = {
  typeErrors?: any[];
  lintErrors?: any[];
  toolbeltFailures?: any[];
  logicWarnings?: any[];
  deprecatedUsage?: any[];
  personaIssues?: any[];
  safetyIssues?: any[];
  summary?: string;
};

type DiagnosticResult = {
  severity: 'ERROR' | 'WARNING' | 'NOTICE';
  classification: string;
  requiresFix: boolean;
  component: string;
  file: string;
  message: string;
}[];

/**
 * Builds a summary of insights from various sandbox run artifacts.
 * @param {string} runId The ID of the current sandbox run.
 * @returns {Promise<InsightSummary>} A summary of the insights.
 */
export async function buildInsights(runId: string): Promise<InsightSummary> {
  const runDirectory = getRunDir(runId);
  const insightsFilePath = path.join(runDirectory, 'insights.json');
  const latestInsightsFilePath = path.join(
    getSandboxRoot(),
    'insights',
    'latest.json'
  );

  let scanResult: ScanResult = {};
  let diagnosticResult: DiagnosticResult = [];
  let truthReview: BrewTruthReview | undefined;

  try {
    scanResult = JSON.parse(
      await fs.readFile(path.join(runDirectory, 'scan.json'), 'utf8')
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
  try {
    truthReview = JSON.parse(
      await fs.readFile(path.join(runDirectory, 'truthReview.json'), 'utf8')
    );
  } catch (e) {
    /* ignore if file not found */
  }

  const issuesBySeverity = { ERROR: 0, WARNING: 0, NOTICE: 0 };
  diagnosticResult.forEach((issue) => {
    if (issue.severity in issuesBySeverity) {
      issuesBySeverity[issue.severity]++;
    }
  });

  const totalIssues =
    issuesBySeverity.ERROR + issuesBySeverity.WARNING + issuesBySeverity.NOTICE;
  const riskLevel = truthReview?.riskLevel || 'UNKNOWN';
  const truthScore = truthReview?.truthScore;

  const suggestedPriorities: string[] = [];
  if (issuesBySeverity.ERROR > 0)
    suggestedPriorities.push('Address critical errors');
  if (issuesBySeverity.WARNING > 0) suggestedPriorities.push('Review warnings');
  if (riskLevel === 'HIGH')
    suggestedPriorities.push('Investigate high-risk changes');
  if (truthScore && truthScore < 0.75)
    suggestedPriorities.push('Review low-truth-score items');

  const summaryText = `Found ${totalIssues} issues (${issuesBySeverity.ERROR} errors, ${issuesBySeverity.WARNING} warnings, ${issuesBySeverity.NOTICE} notices). Overall risk: ${riskLevel}.`;

  const insights: InsightSummary = {
    runId,
    totalIssues,
    issuesBySeverity,
    riskLevel,
    truthScore,
    suggestedPriorities,
    summaryText,
    createdAt: new Date().toISOString(),
  };

  await fs.writeFile(
    insightsFilePath,
    JSON.stringify(insights, null, 2),
    'utf8'
  );
  await fs.mkdir(path.dirname(latestInsightsFilePath), { recursive: true });
  await fs.writeFile(
    latestInsightsFilePath,
    JSON.stringify(insights, null, 2),
    'utf8'
  );

  // Optional: Write human-readable markdown summary
  const markdownSummary =
    `# Sandbox Run Insights: ${runId}\n\n` +
    `**Date:** ${insights.createdAt}\n\n` +
    `**Summary:** ${insights.summaryText}\n\n` +
    `**Total Issues:** ${insights.totalIssues}\n` +
    `- Errors: ${insights.issuesBySeverity.ERROR}\n` +
    `- Warnings: ${insights.issuesBySeverity.WARNING}\n` +
    `- Notices: ${insights.issuesBySeverity.NOTICE}\n\n` +
    `**Overall Risk Level:** ${insights.riskLevel}\n` +
    `**Truth Score:** ${insights.truthScore ? insights.truthScore.toFixed(2) : 'N/A'}\n\n` +
    `**Suggested Priorities:**\n` +
    insights.suggestedPriorities.map((p) => `- ${p}`).join('\n') +
    '\n';

  await fs.writeFile(
    path.join(runDirectory, 'insights.md'),
    markdownSummary,
    'utf8'
  );

  return insights;
}
