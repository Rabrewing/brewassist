export interface BrewDocsProposal {
  id: string;
  targetFile: string;
  rationale: string;
  diff: string; // unified diff
  confidence: number; // 0-1
  phaseTag: string; // e.g., S5, S6
  createdBy: string; // agent/human
  timestamp: string;
  status: 'open' | 'approved' | 'rejected' | 'applied';
  source: string; // e.g., 'audit', 'support', 'manual'
  appliedAt?: string;
  appliedBy?: string;
}
