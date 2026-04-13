import { parseEnterpriseContext } from '../../lib/enterpriseContext';

describe('parseEnterpriseContext', () => {
  it('reads tenant, org, and repo scope from headers', () => {
    const ctx = parseEnterpriseContext({
      headers: {
        'x-brewassist-mode': 'admin',
        'x-brewassist-tenant-id': 'tenant-1',
        'x-brewassist-org-id': 'org-1',
        'x-brewassist-workspace-id': 'workspace-1',
        'x-brewassist-project-id': 'project-1',
        'x-brewassist-repo-id': 'repo-1',
        'x-brewassist-repo-root': '/workspace/repo-1',
      },
      body: {},
      query: {},
    } as any);

    expect(ctx).toMatchObject({
      cockpitMode: 'admin',
      role: 'customer',
      tenantId: 'tenant-1',
      orgId: 'org-1',
      workspaceId: 'workspace-1',
      projectId: 'project-1',
      repoId: 'repo-1',
      repoRoot: '/workspace/repo-1',
    });
  });

  it('falls back to customer mode when headers are missing', () => {
    const ctx = parseEnterpriseContext({
      headers: {},
      body: {},
      query: {},
    } as any);

    expect(ctx.cockpitMode).toBe('customer');
    expect(ctx.role).toBe('customer');
  });
});
