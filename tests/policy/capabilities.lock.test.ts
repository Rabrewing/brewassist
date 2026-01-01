import { CAPABILITY_REGISTRY } from '../../lib/capabilities/registry';

describe('Capability Registry Lock Test', () => {
  test('capability registry is frozen', () => {
    const capabilityIds = Object.keys(CAPABILITY_REGISTRY).sort();

    expect(capabilityIds).toEqual([
      '/doc',
      '/fs',
      '/git',
      '/hrm',
      '/identity',
      '/patch',
      '/registry',
      '/task',
      'brewdocs.index',
      'brewdocs.inspect',
      'brewdocs.read',
      'capability.code.explain',
      'capability.file.read.analyze',
      'capability.plan.assist',
      'capability.research.external',
      'db_read',
      'db_write',
      'fs_edit',
      'fs_read',
      'fs_tree',
      'fs_write',
      'git_commit',
      'git_status',
      'research_web',
    ]);

    // Check a few key capabilities
    expect(CAPABILITY_REGISTRY['/task'].tierRequired).toBe(1);
    expect(CAPABILITY_REGISTRY['/patch'].tierRequired).toBe(2);
    expect(CAPABILITY_REGISTRY['/patch'].confirmApplyRequired).toBe(true);
    expect(CAPABILITY_REGISTRY['/patch'].sandboxRequired).toBe(true);
  });
});
