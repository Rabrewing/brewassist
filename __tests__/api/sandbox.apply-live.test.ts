import { createMocks } from 'node-mocks-http';

import handler from '../../pages/api/sandbox/apply-live';

jest.mock('@/lib/enterpriseContext', () => ({
  parseEnterpriseContext: jest.fn(() => ({
    repoProvider: 'github',
    repoRoot: 'brewassist',
  })),
}));

jest.mock('@/lib/brewSandbox', () => ({
  getMirrorRoot: jest.fn(() => '/tmp/mirror'),
}));

jest.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: jest.fn(async () => ({ id: 'user-1', email: 'owner@example.com' })),
}));

jest.mock('child_process', () => ({
  exec: Object.assign(
    jest.fn((command: string, options: any, callback: any) => {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      if (command.includes('git rev-parse --abbrev-ref HEAD')) {
        callback(null, 'main\n', '');
        return;
      }
      if (command.includes('git rev-parse --short HEAD')) {
        callback(null, 'abc1234\n', '');
        return;
      }
      if (command.includes('git push origin main')) {
        callback(null, 'pushed\n', '');
        return;
      }
      if (command.includes('git diff-tree --no-commit-id --name-only -r HEAD')) {
        callback(null, 'pages/index.tsx\nlib/foo.ts\n', '');
        return;
      }

      callback(null, '', '');
    }),
    {
      [require('util').promisify.custom]: jest.fn(
        async (command: string, options?: any) => {
          if (command.includes('git rev-parse --abbrev-ref HEAD')) {
            return { stdout: 'main\n', stderr: '' };
          }
          if (command.includes('git rev-parse --short HEAD')) {
            return { stdout: 'abc1234\n', stderr: '' };
          }
          if (command.includes('git push origin main')) {
            return { stdout: 'pushed\n', stderr: '' };
          }
          if (command.includes('git diff-tree --no-commit-id --name-only -r HEAD')) {
            return { stdout: 'pages/index.tsx\nlib/foo.ts\n', stderr: '' };
          }
          return { stdout: '', stderr: '' };
        }
      ),
    }
  ),
}));

describe('sandbox apply-live api', () => {
  it('blocks rejected execution choices', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        commitMessage: 'BrewAssist: update UI',
        executionChoice: 'reject_comment',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(409);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Rejected execution cannot be applied.',
      executionChoice: 'reject_comment',
    });
  });

  it('rejects unknown execution choices', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        commitMessage: 'BrewAssist: update UI',
        executionChoice: 'maybe',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'executionChoice must be apply, always_apply, or reject_comment',
    });
  });

  it('returns changed files from the committed tree', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        commitMessage: 'BrewAssist: update UI',
        executionChoice: 'apply',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      success: true,
      commitHash: 'abc1234',
      branch: 'main',
      changedFiles: ['pages/index.tsx', 'lib/foo.ts'],
      executionChoice: 'apply',
    });
  });
});
