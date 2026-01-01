import { InitEngine } from '../initEngine';

describe('Init Engine', () => {
  let engine: InitEngine;

  beforeEach(() => {
    engine = new InitEngine('/tmp/test-project'); // Mock path
  });

  test('detects new project vs existing repo', () => {
    // Mock fs for testing would be needed, but for now assume basic functionality
    const detection = engine.detectProject();
    expect(typeof detection.projectType).toBe('string');
    expect(detection.stack.language).toBeInstanceOf(Array);
  });

  test('selects appropriate initial mode based on experience', () => {
    const detection = {
      projectType: 'new' as const,
      stack: { language: ['javascript'] },
      experienceLevel: 'vibe' as const,
    };
    const mode = engine.selectInitialMode(detection);
    expect(mode.mode).toBe('LLM');
  });

  test('creates initial project profile', () => {
    const detection = {
      projectType: 'existing' as const,
      stack: { language: ['typescript'], framework: ['nextjs'] },
      experienceLevel: 'intermediate' as const,
    };
    const mode = engine.selectInitialMode(detection);
    const profile = engine.createInitialProfile(detection, mode);

    expect(profile.projectType).toBe('existing');
    expect(profile.stack.language).toContain('typescript');
    expect(profile.experienceLevel).toBe('intermediate');
    expect(profile.selectedMode).toBe('HRM');
    expect(typeof profile.timestamp).toBe('string');
  });
});
