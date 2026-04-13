import { createMocks } from 'node-mocks-http';

import handler from '../../pages/api/replay-history';

const runRows = [
  {
    id: 'run-1',
    org_id: 'org-1',
    session_id: 'session-1',
    workspace_id: 'workspace-1',
    status: 'completed',
    truth_score: 0.9,
    created_by: 'user-1',
    created_at: '2026-04-12T00:00:00Z',
  },
];

const order = jest.fn(() => {
  const ordered: any = Promise.resolve({
    data: runRows,
    error: null,
  });
  ordered.limit = jest.fn(async () => ({ data: runRows, error: null }));
  return ordered;
});

const inQuery = jest.fn(async () => ({
  data: [
    {
      run_id: 'run-1',
      event_type: 'replay.available',
      payload: { summary: 'Replay trace available' },
      created_at: '2026-04-12T00:00:01Z',
    },
    {
      run_id: 'run-1',
      event_type: 'collab.message',
      payload: {
        summary: 'Planner: Execution handoff is ready',
        payload: {
          author: 'Planner',
          message: 'Execution handoff is ready',
          kind: 'handoff',
          source: 'agent',
        },
      },
      created_at: '2026-04-12T00:00:02Z',
    },
  ],
  error: null,
}));

jest.mock('@/lib/supabase/server', () => ({
  getAuthenticatedUser: jest.fn(async () => ({
    id: 'user-1',
    email: 'user@example.com',
  })),
  getSupabaseEnterpriseRole: jest.fn(async () => 'admin'),
  createSupabaseAdminClient: jest.fn(() => ({
    from: (table: string) => {
      if (table === 'runs') {
        const query: any = {
          select: jest.fn(() => query),
          eq: jest.fn(() => query),
          order,
        };
        return query;
      }

      const query: any = {
        select: jest.fn(() => query),
        eq: jest.fn(() => query),
        in: jest.fn(() => ({
          order: jest.fn(async () => inQuery()),
        })),
      };
      return query;
    },
  })),
}));

describe('replay history api', () => {
  it('returns recent runs for the org scope', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer token',
        'x-brewassist-org-id': 'org-1',
        'x-brewassist-workspace-id': 'workspace-1',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      runs: [
        {
          id: 'run-1',
          events: [
            {
              event_type: 'replay.available',
            },
            {
              event_type: 'collab.message',
            },
          ],
        },
      ],
    });
  });

  it('returns a specific run when runId is provided', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        runId: 'run-1',
      },
      headers: {
        authorization: 'Bearer token',
        'x-brewassist-org-id': 'org-1',
        'x-brewassist-workspace-id': 'workspace-1',
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).runs[0]?.id).toBe('run-1');
  });
});
