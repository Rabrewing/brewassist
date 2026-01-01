import { validateDiff } from '../diff/validate';

export function canApplyProposal(
  proposal: any,
  persona: string
): { allowed: boolean; reason?: string } {
  // Must be admin persona
  if (!['admin', 'dev', 'support'].includes(persona)) {
    return { allowed: false, reason: 'Insufficient persona permissions' };
  }

  // Validate diff doesn't touch frozen surfaces
  const validation = validateDiff(proposal.diff, proposal.targetFile);
  if (!validation.valid) {
    return { allowed: false, reason: validation.reason };
  }

  // Check confidence threshold
  if (proposal.confidence < 0.7) {
    return {
      allowed: false,
      reason: 'Proposal confidence too low for auto-apply',
    };
  }

  return { allowed: true };
}
