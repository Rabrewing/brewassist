export type HybridWorkflowStage =
  | 'intent'
  | 'plan'
  | 'preview'
  | 'confirm'
  | 'execute'
  | 'report'
  | 'replay';

export const HYBRID_WORKFLOW_STAGES: HybridWorkflowStage[] = [
  'intent',
  'plan',
  'preview',
  'confirm',
  'execute',
  'report',
  'replay',
];

export function getWorkflowStageLabel(stage: HybridWorkflowStage): string {
  switch (stage) {
    case 'intent':
      return 'Intent';
    case 'plan':
      return 'Plan';
    case 'preview':
      return 'Preview';
    case 'confirm':
      return 'Confirm';
    case 'execute':
      return 'Execute';
    case 'report':
      return 'Report';
    case 'replay':
      return 'Replay';
  }
}

export function getWorkflowStageHint(stage: HybridWorkflowStage): string {
  switch (stage) {
    case 'intent':
      return 'Capture the request and scope.';
    case 'plan':
      return 'Generate the plan before any mutation.';
    case 'preview':
      return 'Review the diff or command preview.';
    case 'confirm':
      return 'Require approval before apply.';
    case 'execute':
      return 'Run the approved action in the sandbox.';
    case 'report':
      return 'Summarize what changed and why.';
    case 'replay':
      return 'Replay the run or inspect the trace.';
  }
}

export function deriveWorkflowStageFromInput(
  input: string
): HybridWorkflowStage {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return 'intent';
  if (trimmed.startsWith('/replay')) return 'replay';
  if (trimmed.startsWith('/report')) return 'report';
  if (trimmed.startsWith('/confirm') || trimmed.includes('confirm'))
    return 'confirm';
  if (
    trimmed.startsWith('/patch') ||
    trimmed.startsWith('/git') ||
    trimmed.startsWith('/fs') ||
    trimmed.startsWith('/commit') ||
    trimmed.includes('apply') ||
    trimmed.includes('patch')
  ) {
    return 'preview';
  }
  return 'plan';
}
