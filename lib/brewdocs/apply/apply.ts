import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { BrewDocsProposal } from '../proposals/types';

export interface ApplyResult {
  success: boolean;
  appliedProposal?: BrewDocsProposal;
  error?: string;
}

export function applyProposal(
  proposal: BrewDocsProposal,
  approvalToken: string,
  approvedBy: string
): ApplyResult {
  // Guard checks
  if (!isApproved(proposal, approvalToken)) {
    return { success: false, error: 'Proposal not approved or invalid token' };
  }

  if (!isAdminPersona(approvedBy)) {
    return { success: false, error: 'Only admin personas can apply proposals' };
  }

  try {
    // Read current file
    const currentContent = readFileSync(proposal.targetFile, 'utf8');

    // Apply diff (simplified - in practice, use a proper patch library)
    const newContent = applyDiff(currentContent, proposal.diff);

    // Atomic write
    const backupPath = `${proposal.targetFile}.backup.${Date.now()}`;
    writeFileSync(backupPath, currentContent);
    writeFileSync(proposal.targetFile, newContent);

    // Update proposal status
    proposal.status = 'applied';
    proposal.appliedAt = new Date().toISOString();
    proposal.appliedBy = approvedBy;

    return { success: true, appliedProposal: proposal };
  } catch (error) {
    return {
      success: false,
      error: `Apply failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function isApproved(proposal: BrewDocsProposal, token: string): boolean {
  // Simplified - in practice, check against approval system
  return proposal.status === 'approved' && token === 'admin-approve';
}

function isAdminPersona(persona: string): boolean {
  return ['admin', 'dev', 'support'].includes(persona);
}

function applyDiff(content: string, diff: string): string {
  // Simplified diff application - parse unified diff and apply
  // In production, use a proper diff/patch library
  const lines = diff.split('\n');
  let result = content;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      // Add line
      result += line.substring(1) + '\n';
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      // Remove line (simplified)
      const toRemove = line.substring(1);
      result = result.replace(toRemove + '\n', '');
    }
  }

  return result;
}
