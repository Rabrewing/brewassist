import { SupportEvent } from './types';

export type TriageResult =
  | 'immediate_fix'
  | 'sandbox_patch'
  | 'future_roadmap'
  | 'documentation_gap';

export interface TriagedEvent extends SupportEvent {
  triageResult: TriageResult;
  confidence: number;
  suggestedActions: string[];
}

export function triageSupportEvent(event: SupportEvent): TriagedEvent {
  const triageResult = determineTriage(event);
  const triaged: TriagedEvent = {
    ...event,
    triageResult,
    confidence: calculateConfidence(event),
    suggestedActions: generateActions(triageResult),
  };

  return triaged;
}

function determineTriage(event: SupportEvent): TriageResult {
  // Simple rule-based triage
  if (event.severity === 'critical' && event.intent.includes('error')) {
    return 'immediate_fix';
  }

  if (event.severity === 'high' && event.context?.hasCode === true) {
    return 'sandbox_patch';
  }

  if (event.description.includes('missing documentation')) {
    return 'documentation_gap';
  }

  return 'future_roadmap';
}

function calculateConfidence(event: SupportEvent): number {
  // Simplified confidence scoring
  let score = 0.5;

  if (event.severity === 'critical') score += 0.3;
  if (event.context?.hasCode) score += 0.2;
  if (event.description.length > 50) score += 0.1;

  return Math.min(score, 1.0);
}

function generateActions(triageResult: TriageResult): string[] {
  const actions: string[] = [];

  switch (triageResult) {
    case 'immediate_fix':
      actions.push('Escalate to engineering team');
      actions.push('Create hotfix branch');
      break;
    case 'sandbox_patch':
      actions.push('Generate sandbox test case');
      actions.push('Propose code fix');
      break;
    case 'documentation_gap':
      actions.push('Create BrewDocs proposal');
      actions.push('Update knowledge base');
      break;
    case 'future_roadmap':
      actions.push('Add to product roadmap');
      actions.push('Gather user feedback');
      break;
  }

  return actions;
}
