import {
  AgentRuntime,
  createAgentRuntimeContext,
} from '../../lib/agent-fabric/runtime';
import { persistAgentRun } from '../../lib/agent-fabric/persistence';

const upsert = jest.fn(async () => ({ error: null }));
const insert = jest.fn(async () => ({ error: null }));

jest.mock('../../lib/supabase/server', () => ({
  createSupabaseAdminClient: jest.fn(() => ({
    from: (table: string) => ({
      upsert: table === 'run_events' ? insert : upsert,
      insert,
    }),
  })),
}));

function createRuntime(orgId?: string) {
  return new AgentRuntime(
    createAgentRuntimeContext({
      orgId,
      userId: 'user-1',
      role: 'admin',
      cockpitMode: 'admin',
      tier: 'basic',
      personaId: 'admin',
      persona: {
        id: 'admin',
        label: 'Admin',
        tone: 'Neutral',
        emotionTier: 3,
        safetyMode: 'hard-stop',
        memoryWindow: 3,
        systemPrompt: 'admin',
      },
      input: 'hello',
      mode: 'LLM',
    })
  );
}

describe('agent fabric persistence', () => {
  beforeEach(() => {
    upsert.mockClear();
    insert.mockClear();
  });

  it('skips persistence when org scope is missing', async () => {
    const runtime = createRuntime();

    const result = await persistAgentRun({ runtime, status: 'completed' });

    expect(result).toEqual({ ok: true, skipped: 'missing-org' });
    expect(upsert).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it('persists session and run rows when org scope exists', async () => {
    const runtime = createRuntime('org-1');
    runtime.emit({
      agentId: 'collab_agent',
      eventType: 'collab.message',
      summary: 'Planner: captured',
      payload: {
        author: 'Planner',
        message: 'captured',
        kind: 'handoff',
        source: 'agent',
      },
    });

    await persistAgentRun({ runtime, status: 'completed' });

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          event_type: 'collab.message',
          payload: expect.objectContaining({
            summary: 'Planner: captured',
            payload: expect.objectContaining({
              author: 'Planner',
              message: 'captured',
              kind: 'handoff',
              source: 'agent',
            }),
          }),
        }),
      ])
    );
  });
});
