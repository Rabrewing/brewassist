import { createMocks } from 'node-mocks-http';

import handler from '../../pages/api/sessions/restore';

jest.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: jest.fn(async () => ({
    id: 'user-1',
    email: 'user@example.com',
  })),
  createSupabaseAdminClient: jest.fn(() => ({
    from: (table: string) => {
      const query: any = {
        select: jest.fn(() => query),
        eq: jest.fn(() => query),
        in: jest.fn(() => query),
        order: jest.fn(() => query),
        limit: jest.fn(() => query),
      };

      const buildResponse = () => {
        if (table === 'memberships') {
          return {
            data: [
              {
                org_id: 'org-1',
                role_name: 'owner',
                status: 'active',
                organizations: {
                  id: 'org-1',
                  name: 'BrewAssist Org',
                  slug: 'brewassist',
                  plan: 'pro',
                },
              },
            ],
            error: null,
          };
        }

        if (table === 'workspaces') {
          return {
            data: [
              {
                id: 'workspace-1',
                org_id: 'org-1',
                name: 'Default Workspace',
              },
            ],
            error: null,
          };
        }

        if (table === 'sessions') {
          return {
            data: {
              id: 'session-1',
              workspace_id: 'workspace-1',
              current_stage: 'report',
              last_seen_at: '2026-04-30T12:00:00.000Z',
            },
            error: null,
          };
        }

        if (table === 'runs') {
          return {
            data: {
              id: 'run-1',
              session_id: 'session-1',
              status: 'complete',
              closeout_status: 'approved',
              created_at: '2026-04-30T12:05:00.000Z',
            },
            error: null,
          };
        }

        return { data: [], error: null };
      };

      query.maybeSingle = jest.fn(async () => {
        return buildResponse();
      });

      query.then = (resolve: any) => Promise.resolve(resolve(buildResponse()));

      return query;
    },
  })),
}));

describe('/api/sessions/restore', () => {
  it('returns the latest run for the requested session', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        sessionId: 'session-1',
      },
      headers: {
        authorization: 'Bearer token',
        'x-brewassist-org-id': 'org-1',
        'x-brewassist-workspace-id': 'workspace-1',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      restore: {
        sessionId: 'session-1',
        workspaceId: 'workspace-1',
        currentStage: 'report',
        latestRunId: 'run-1',
        latestRunStatus: 'complete',
        latestCloseoutStatus: 'approved',
        context: {
          latestEventType: null,
          stage: 'report',
          summary: 'Session restored from persisted workflow events.',
        },
      },
    });
  });
});
