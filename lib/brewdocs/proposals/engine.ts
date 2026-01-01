import { BrewDocsProposal } from './types';

export function generateProposal(
  source: string,
  targetFile: string,
  rationale: string,
  diff: string,
  confidence: number,
  phaseTag: string,
  createdBy: string
): BrewDocsProposal {
  return {
    id: `proposal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    targetFile,
    rationale,
    diff,
    confidence,
    phaseTag,
    createdBy,
    timestamp: new Date().toISOString(),
    status: 'open',
    source,
  };
}

// Example proposal generators
export function proposalFromAudit(
  finding: string,
  targetFile: string
): BrewDocsProposal {
  const rationale = `Audit finding: ${finding}`;
  const diff = `+// TODO: Address ${finding}\n`;
  return generateProposal(
    'audit',
    targetFile,
    rationale,
    diff,
    0.8,
    'S5',
    'audit-engine'
  );
}

export function proposalFromSupport(
  issue: string,
  targetFile: string
): BrewDocsProposal {
  const rationale = `Support issue: ${issue}`;
  const diff = `+## ${issue}\n\nResolution steps:\n1. TBD\n`;
  return generateProposal(
    'support',
    targetFile,
    rationale,
    diff,
    0.6,
    'S5',
    'support-engine'
  );
}
