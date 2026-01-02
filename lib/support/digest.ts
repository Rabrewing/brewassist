import { TriagedSupportTrace } from './triage';

export interface DailyDigest {
  date: string;
  totalEvents: number;
  criticalIssues: TriagedSupportTrace[];
  recurringThemes: { theme: string; count: number }[];
  suggestedActions: string[];
  generatedProposals: number;
}

export function generateDailyDigest(
  events: TriagedSupportTrace[]
): DailyDigest {
  const today = new Date().toISOString().split('T')[0];

  const criticalIssues = events.filter(
    (e) => e.triageResult === 'RISK_BLOCKER'
  );
  const themes = analyzeThemes(events);
  const actions = generateSuggestedActions(events);
  const proposals = events.filter(
    (e) => e.triageResult === 'PHASE_RELEASE_CANDIDATE' // Assuming this leads to proposals
  ).length;

  return {
    date: today,
    totalEvents: events.length,
    criticalIssues,
    recurringThemes: themes,
    suggestedActions: actions,
    generatedProposals: proposals,
  };
}

function analyzeThemes(
  events: TriagedSupportTrace[]
): { theme: string; count: number }[] {
  const themeMap = new Map<string, number>();

  events.forEach((event) => {
    const theme = extractTheme(event.input);
    themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
  });

  return Array.from(themeMap.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function extractTheme(input: string): string {
  // Simple keyword extraction from input
  if (input.includes('error')) return 'Error Handling';
  if (input.includes('performance')) return 'Performance';
  if (input.includes('ui') || input.includes('interface')) return 'UI/UX';
  if (input.includes('documentation')) return 'Documentation';
  return 'General';
}

function generateSuggestedActions(events: TriagedSupportTrace[]): string[] {
  const actions: string[] = [];

  const riskBlockers = events.filter(
    (e) => e.triageResult === 'RISK_BLOCKER'
  ).length;
  if (riskBlockers > 0) {
    actions.push(`Address ${riskBlockers} risk blockers immediately`);
  }

  const dailyResolvables = events.filter(
    (e) => e.triageResult === 'DAILY_RESOLVABLE'
  ).length;
  if (dailyResolvables > 0) {
    actions.push(`Resolve ${dailyResolvables} daily resolvable issues`);
  }

  return actions;
}
