import { InitialProjectProfileManager } from '../initialProfile';

describe('Initial Project Profile', () => {
  let manager: InitialProjectProfileManager;
  const testProfile = {
    projectType: 'new' as const,
    repoProvider: 'local' as const,
    stack: { language: ['javascript'] },
    experienceLevel: 'vibe' as const,
    selectedMode: 'LLM' as const,
    toolbeltTier: 1 as const,
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    manager = new InitialProjectProfileManager('/tmp/test-profile.json');
  });

  test('saves and loads profile correctly', () => {
    manager.saveProfile(testProfile);
    const loaded = manager.loadProfile();
    expect(loaded).toEqual(testProfile);
  });

  test('returns null if no profile exists', () => {
    manager.deleteProfile();
    const loaded = manager.loadProfile();
    expect(loaded).toBeNull();
  });

  test('hasProfile returns correct state', () => {
    expect(manager.hasProfile()).toBe(false);
    manager.saveProfile(testProfile);
    expect(manager.hasProfile()).toBe(true);
  });

  test('deletes profile correctly', () => {
    manager.saveProfile(testProfile);
    expect(manager.hasProfile()).toBe(true);
    manager.deleteProfile();
    expect(manager.hasProfile()).toBe(false);
  });
});
