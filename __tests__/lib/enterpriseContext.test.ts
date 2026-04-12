import { parseEnterpriseContext } from '../../lib/enterpriseContext';

describe('parseEnterpriseContext', () => {
  it('reads tenant, org, repo, and role from headers', () => {
    const ctx = parseEnterpriseContext({
      headers: {
        'x-brewassist-mode': 'admin',
        'x-brewassist-role': 'dev',
        'x-brewassist-tenant-id': 'tenant-1',
        'x-brewassist-org-id': 'org-1',
        'x-brewassist-user-id': 'user-1',
        'x-brewassist-project-id': 'project-1',
        'x-brewassist-repo-id': 'repo-1',
        'x-brewassist-repo-root': '/workspace/repo-1',
      },
      body: {},
      query: {},
    } as any);

    expect(ctx).toMatchObject({
      cockpitMode: 'admin',
      role: 'dev',
      tenantId: 'tenant-1',
      orgId: 'org-1',
      userId: 'user-1',
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
