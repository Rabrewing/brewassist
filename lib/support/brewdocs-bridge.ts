import { TriagedEvent } from './triage';
import { generateProposal } from '../brewdocs/proposals/engine';

export function convertToBrewDocsProposal(
  triagedEvent: TriagedEvent
): any | null {
  // Only convert documentation gaps
  if (triagedEvent.triageResult !== 'documentation_gap') {
    return null;
  }

  // Determine target file based on context
  const targetFile = determineTargetFile(triagedEvent);

  // Generate proposal
  const proposal = generateProposal(
    'support',
    targetFile,
    `Support issue: ${triagedEvent.description}`,
    generateDiff(triagedEvent),
    triagedEvent.confidence,
    'S5',
    'support-bridge'
  );

  return proposal;
}

function determineTargetFile(event: TriagedEvent): string {
  // Simplified - in practice, use ML or rules to determine best file
  if (event.intent.includes('api')) {
    return 'brewdocs/project/API_REFERENCE.md';
  }
  if (event.intent.includes('ui')) {
    return 'brewdocs/project/UI_GUIDE.md';
  }
  return 'brewdocs/project/TROUBLESHOOTING.md';
}

function generateDiff(event: TriagedEvent): string {
  // Generate diff for documentation addition
  return `+## ${event.description}\n\n**Reported by:** ${event.persona}\n**Severity:** ${event.severity}\n\n**Suggested Resolution:**\n${event.suggestedActions?.join('\n') || 'TBD'}\n`;
}
