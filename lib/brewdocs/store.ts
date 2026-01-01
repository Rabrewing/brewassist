import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { BrewDocsProposal } from './proposals/types';

const PROPOSALS_DIR = '.brewdocs/proposals';

export function saveProposal(proposal: BrewDocsProposal): void {
  const dir = join(PROPOSALS_DIR, proposal.phaseTag);
  mkdirSync(dir, { recursive: true });

  const filePath = join(dir, `${proposal.id}.json`);
  writeFileSync(filePath, JSON.stringify(proposal, null, 2));
}

export function loadProposals(
  phase?: string,
  status?: string
): BrewDocsProposal[] {
  const phases = phase
    ? [phase]
    : readdirSync(PROPOSALS_DIR).filter((f) => f.startsWith('S'));

  const proposals: BrewDocsProposal[] = [];

  for (const p of phases) {
    const phaseDir = join(PROPOSALS_DIR, p);
    try {
      const files = readdirSync(phaseDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const proposal: BrewDocsProposal = JSON.parse(
            readFileSync(join(phaseDir, file), 'utf8')
          );
          if (!status || proposal.status === status) {
            proposals.push(proposal);
          }
        }
      }
    } catch {
      // Phase dir doesn't exist
    }
  }

  return proposals;
}

export function updateProposalStatus(
  id: string,
  status: BrewDocsProposal['status']
): boolean {
  // Find and update the proposal
  const proposals = loadProposals();
  const proposal = proposals.find((p) => p.id === id);
  if (proposal) {
    proposal.status = status;
    saveProposal(proposal);
    return true;
  }
  return false;
}
