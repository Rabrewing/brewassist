import { TriagedEvent } from './triage';

export interface DailyDigest {
  date: string;
  totalEvents: number;
  criticalIssues: TriagedEvent[];
  recurringThemes: { theme: string; count: number }[];
  suggestedActions: string[];
  generatedProposals: number;
}

export function generateDailyDigest(events: TriagedEvent[]): DailyDigest {
  const today = new Date().toISOString().split('T')[0];

  const criticalIssues = events.filter((e) => e.severity === 'critical');
  const themes = analyzeThemes(events);
  const actions = generateSuggestedActions(events);
  const proposals = events.filter(
    (e) => e.triageResult === 'documentation_gap'
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
  events: TriagedEvent[]
): { theme: string; count: number }[] {
  const themeMap = new Map<string, number>();

  events.forEach((event) => {
    const theme = extractTheme(event.description);
    themeMap.set(theme, (themeMap.get(theme) || 0) + 1);
  });

  return Array.from(themeMap.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function extractTheme(description: string): string {
  // Simple keyword extraction
  if (description.includes('error')) return 'Error Handling';
  if (description.includes('performance')) return 'Performance';
  if (description.includes('ui') || description.includes('interface'))
    return 'UI/UX';
  if (description.includes('documentation')) return 'Documentation';
  return 'General';
}

function generateSuggestedActions(events: TriagedEvent[]): string[] {
  const actions: string[] = [];

  const immediateFixes = events.filter(
    (e) => e.triageResult === 'immediate_fix'
  ).length;
  if (immediateFixes > 0) {
    actions.push(
      `Address ${immediateFixes} critical issues requiring immediate fixes`
    );
  }

  const docGaps = events.filter(
    (e) => e.triageResult === 'documentation_gap'
  ).length;
  if (docGaps > 0) {
    actions.push(
      `Review ${docGaps} documentation gaps and create BrewDocs proposals`
    );
  }

  return actions;
}
