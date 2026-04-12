import * as fs from 'fs';

import { InitEngine } from '../../lib/init/initEngine';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('InitEngine repo provider detection', () => {
  const existsSync = fs.existsSync as jest.Mock;

  beforeEach(() => {
    existsSync.mockReset();
  });

  it('detects github repos', () => {
    existsSync.mockImplementation(
      (filePath: string) =>
        filePath.endsWith('.git') || filePath.endsWith('.github')
    );

    const engine = new InitEngine('/repo');
    const detection = engine.detectProject();

    expect(detection.repoProvider).toBe('github');
  });

  it('detects bitbucket repos', () => {
    existsSync.mockImplementation(
      (filePath: string) =>
        filePath.endsWith('.git') ||
        filePath.endsWith('.bitbucket-pipelines.yml')
    );

    const engine = new InitEngine('/repo');
    const detection = engine.detectProject();

    expect(detection.repoProvider).toBe('bitbucket');
  });

  it('falls back to local when no git metadata exists', () => {
    existsSync.mockReturnValue(false);

    const engine = new InitEngine('/repo');
    const detection = engine.detectProject();

    expect(detection.repoProvider).toBe('local');
    expect(detection.projectType).toBe('new');
  });
});
