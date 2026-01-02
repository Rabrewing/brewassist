import { TriagedSupportTrace } from './triage';

export interface BrewDocsProposal {
  tier: 2;
  source: 'support';
  targetFile: string;
  title: string;
  content: string;
  confidence: number;
  phase: 'S5';
  bridge: 'support-bridge';
}

export function convertToBrewDocsProposal(
  triagedTrace: TriagedSupportTrace
): BrewDocsProposal | null {
  // Only convert PHASE_RELEASE_CANDIDATE to Tier 2 proposals
  if (triagedTrace.triageResult !== 'PHASE_RELEASE_CANDIDATE') {
    return null;
  }

  // Determine target file based on context
  const targetFile = determineTargetFile(triagedTrace);

  // Generate proposal content
  const proposal: BrewDocsProposal = {
    tier: 2,
    source: 'support',
    targetFile,
    title: `Support insight: ${triagedTrace.input.substring(0, 50)}...`,
    content: generateContent(triagedTrace),
    confidence: triagedTrace.confidence,
    phase: 'S5',
    bridge: 'support-bridge',
  };

  return proposal;
}

function determineTargetFile(trace: TriagedSupportTrace): string {
  // Determine based on input keywords or capabilities
  if (trace.input.includes('api')) {
    return 'brewdocs/project/API_REFERENCE.md';
  }
  if (trace.input.includes('ui') || trace.input.includes('interface')) {
    return 'brewdocs/project/UI_GUIDE.md';
  }
  if (trace.capabilityIds.some((id) => id.includes('command'))) {
    return 'brewdocs/project/COMMAND_REFERENCE.md';
  }
  return 'brewdocs/project/TROUBLESHOOTING.md';
}

function generateContent(trace: TriagedSupportTrace): string {
  // Generate content for proposal
  return `## Support Insight\n\n**Persona:** ${trace.persona}\n**Input:** ${trace.input}\n**Response:** ${trace.response}\n**BrewTruth Score:** ${trace.brewTruthScore}\n\n**Context:** ${trace.cockpitMode} / ${trace.activeMode}\n**Capabilities:** ${trace.capabilityIds.join(', ')}\n`;
}
