import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/command';

const mockHandler = jest.fn(async (_input: string, ctx: any) => ({
  kind: 'narration',
  summary: 'ok',
  rawText: JSON.stringify(ctx),
}));

jest.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: jest.fn(async () => ({
    id: 'user-a',
    email: 'user@example.com',
  })),
  getSupabaseEnterpriseRole: jest.fn(async () => 'dev'),
}));

jest.mock('@/lib/commands/registry', () => ({
  findCommand: jest.fn(() => ({
    handler: mockHandler,
  })),
}));

describe('command api enterprise context', () => {
  beforeEach(() => {
    mockHandler.mockClear();
  });

  it('passes tenant and repo context into the command handler', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        command: '/task',
        input: 'create docs',
      },
      headers: {
        'x-brewassist-mode': 'admin',
        'x-brewassist-tenant-id': 'tenant-a',
        'x-brewassist-org-id': 'org-a',
        'x-brewassist-user-id': 'user-a',
        'x-brewassist-project-id': 'project-a',
        'x-brewassist-repo-id': 'repo-a',
      },
    });

    await handler(req as any, res as any);

    expect(mockHandler).toHaveBeenCalledWith(
      'create docs',
      expect.objectContaining({
        tenantId: 'tenant-a',
        orgId: 'org-a',
        userId: 'user-a',
        projectId: 'project-a',
        repoId: 'repo-a',
        role: 'dev',
        activeEnv: 'dev',
        rbMode: false,
      })
    );
    expect(res._getStatusCode()).toBe(200);
  });
});
