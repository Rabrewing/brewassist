import { createSupabaseAdminClient } from '@/lib/supabase/server';

import type { AgentRuntime } from './runtime';

type PersistRunArgs = {
  runtime: AgentRuntime;
  status: 'completed' | 'timeout' | 'error' | 'blocked';
};

export async function persistAgentRun({ runtime, status }: PersistRunArgs) {
  if (!runtime.context.orgId) {
    return { ok: true, skipped: 'missing-org' as const };
  }

  const client = createSupabaseAdminClient();

  const sessionPayload = {
    id: runtime.context.sessionId,
    org_id: runtime.context.orgId,
    user_id: runtime.context.userId,
    workspace_id: runtime.context.workspaceId ?? null,
    current_stage: runtime.state.stage,
    last_seen_at: new Date().toISOString(),
    created_by: runtime.context.userId,
  };

  const { error: sessionError } = await client
    .from('sessions')
    .upsert(sessionPayload, {
      onConflict: 'id',
    });

  if (sessionError) throw sessionError;

  const runPayload = {
    id: runtime.context.runId,
    org_id: runtime.context.orgId,
    session_id: runtime.context.sessionId,
    workspace_id: runtime.context.workspaceId ?? null,
    status,
    truth_score: runtime.state.telemetry.truthScore,
    created_by: runtime.context.userId,
  };

  const { error: runError } = await client.from('runs').upsert(runPayload, {
    onConflict: 'id',
  });

  if (runError) throw runError;

  if (runtime.events.length === 0) {
    return { ok: true, skipped: 'no-events' as const };
  }

  const eventRows = runtime.events.map((event) => ({
    org_id: runtime.context.orgId,
    run_id: runtime.context.runId,
    event_type: event.eventType,
    payload: {
      sessionId: event.sessionId,
      runId: event.runId,
      stage: event.stage,
      agentId: event.agentId,
      timestamp: event.timestamp,
      actor: event.actor,
      summary: event.summary,
      payload: event.payload,
      policyState: event.policyState ?? null,
      telemetry: event.telemetry,
      uiHints: event.uiHints ?? null,
    },
    created_by: runtime.context.userId,
  }));

  const { error: eventError } = await client
    .from('run_events')
    .insert(eventRows);

  if (eventError) throw eventError;

  return { ok: true };
}
