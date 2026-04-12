import {
  deriveWorkflowStageFromInput,
  getWorkflowStageHint,
  getWorkflowStageLabel,
} from '../../lib/hybridWorkflow';

describe('hybrid workflow helpers', () => {
  it('derives replay and confirm stages from input', () => {
    expect(deriveWorkflowStageFromInput('/replay last run')).toBe('replay');
    expect(deriveWorkflowStageFromInput('/patch update file')).toBe('preview');
    expect(deriveWorkflowStageFromInput('please confirm this change')).toBe(
      'confirm'
    );
  });

  it('returns readable labels and hints', () => {
    expect(getWorkflowStageLabel('plan')).toBe('Plan');
    expect(getWorkflowStageHint('execute')).toContain('sandbox');
  });
});
