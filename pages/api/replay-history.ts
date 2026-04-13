import type { NextApiRequest, NextApiResponse } from 'next';

import {
  createSupabaseAdminClient,
  getAuthenticatedUser,
  getSupabaseEnterpriseRole,
} from '@/lib/supabase/server';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const enterpriseContext = parseEnterpriseContext(req);
  const runId =
    typeof req.query.runId === 'string' ? req.query.runId : undefined;
  if (!enterpriseContext.orgId) {
    return res.status(400).json({ error: 'orgId is required' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const role = await getSupabaseEnterpriseRole(
      req,
      res,
      enterpriseContext.orgId
    );
    const client = createSupabaseAdminClient();

    let runsQuery = client
      .from('runs')
      .select(
        'id, org_id, session_id, workspace_id, status, truth_score, created_by, created_at'
      )
      .eq('org_id', enterpriseContext.orgId);

    if (enterpriseContext.workspaceId) {
      runsQuery = runsQuery.eq('workspace_id', enterpriseContext.workspaceId);
    }

    if (role === 'customer') {
      runsQuery = runsQuery.eq('created_by', user.id);
    }

    if (runId) {
      runsQuery = runsQuery.eq('id', runId);
    }

    const orderedRunsQuery = runsQuery.order('created_at', {
      ascending: false,
    });
    const { data: runs, error: runsError } = runId
      ? await orderedRunsQuery
      : await orderedRunsQuery.limit(10);
    if (runsError) throw runsError;

    const runIds = (runs ?? []).map((run) => run.id);
    if (runIds.length === 0) {
      return res.status(200).json({ runs: [] });
    }

    const { data: events, error: eventsError } = await client
      .from('run_events')
      .select('run_id, event_type, payload, created_at')
      .eq('org_id', enterpriseContext.orgId)
      .in('run_id', runIds)
      .order('created_at', { ascending: true });

    if (eventsError) throw eventsError;

    const eventsByRun = new Map<string, typeof events>();
    (events ?? []).forEach((event) => {
      const current = eventsByRun.get(event.run_id) ?? [];
      current.push(event);
      eventsByRun.set(event.run_id, current);
    });

    return res.status(200).json({
      runs: (runs ?? []).map((run) => ({
        ...run,
        events: eventsByRun.get(run.id) ?? [],
      })),
    });
  } catch (error: any) {
    console.error('[replay-history] failed', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
    });
    return res
      .status(500)
      .json({ error: error?.message ?? 'Replay history failed' });
  }
}
