import type { User } from '@supabase/supabase-js';
import {
  resolveOrgRoleCapabilities,
  type OrgRolePermissions,
} from '@/lib/enterprise/rbac';

type SupabaseAdminClient = ReturnType<
  typeof import('@/lib/supabase/server').createSupabaseAdminClient
>;

export type AccountSessionSummary = {
  accountId: string;
  email: string;
  displayName: string;
  plan: string;
  accountStanding: 'active' | 'inactive';
  ownerMode: boolean;
  role: string;
  capabilities: OrgRolePermissions & {
    canManageIdentity: boolean;
    canManageProviders: boolean;
  };
  orgId: string | null;
  workspaceId: string | null;
};

export type WorkspaceSummary = {
  workspaceId: string;
  name: string;
  role: string;
  billingMode: 'byok' | 'brew-managed' | 'hybrid';
  active: boolean;
};

export type EntitlementSummary = {
  platformAccess: boolean;
  authSources: Array<'byok' | 'brew-managed'>;
  providers: string[];
  models: Record<string, string[]>;
  intelligenceMeters: {
    agentStep: boolean;
    executionChain: boolean;
    memoryRetention: boolean;
  };
};

export type BillingSummary = {
  plan: string;
  platformFeeUsd: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  managedSpendUsd: number;
  intelligenceSpendUsd: number;
  creditsRemainingUsd: number;
  providerUsage: ProviderUsageSummary;
  stripeReady: boolean;
  subscription: {
    externalSubscriptionId: string | null;
    status: string;
    billingInterval: 'monthly' | 'yearly' | 'unknown';
    customerId: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    workspaceId: string | null;
    cancelAtPeriodEnd: boolean;
    cancelAt: string | null;
  } | null;
  customer: {
    externalCustomerId: string | null;
    billingEmail: string | null;
    status: string;
  } | null;
  latestInvoice: {
    invoiceId: string | null;
    eventType: string;
    eventLabel: string;
    eventCategory: 'invoice' | 'payment' | 'checkout';
    status: string;
    amountUsd: number | null;
    createdAt: string | null;
  } | null;
  invoiceHistory: Array<{
    invoiceId: string | null;
    eventType: string;
    eventLabel: string;
    eventCategory: 'invoice' | 'payment' | 'checkout';
    status: string;
    amountUsd: number | null;
    createdAt: string | null;
  }>;
};

export type CreditsSummary = {
  creditsRemainingUsd: number;
  autoRechargeEnabled: boolean;
  billingRail: 'stripe-pending';
  stripeReady: boolean;
};

export type ProviderUsageSummary = {
  totalCalls: number;
  totalChars: number;
  byProvider: Array<{
    provider: string;
    source: 'env' | 'hosted';
    authMode: 'managed' | 'byok';
    lane: 'executor' | 'planner' | 'reviewer' | 'memory' | 'research';
    callCount: number;
    charCount: number;
    lastSeenAt: string | null;
  }>;
  byLane: Array<{
    lane: 'executor' | 'planner' | 'reviewer' | 'memory' | 'research';
    callCount: number;
    charCount: number;
    lastSeenAt: string | null;
  }>;
};

export type ManagedProviderSummary = {
  providers: Array<{
    id: string;
    enabled: boolean;
    authModes: Array<'byok' | 'brew-managed'>;
    models: string[];
    source: 'workspace-keys' | 'plan-default';
  }>;
  usage: ProviderUsageSummary;
};

export type SessionContinuitySummary = {
  sessions: Array<{
    sessionId: string;
    workspaceId: string | null;
    currentStage: string;
    lastSeenAt: string;
    latestRunId: string | null;
    latestRunStatus: string | null;
    latestCloseoutStatus: string | null;
    latestRunCreatedAt: string | null;
  }>;
};

export type SessionRestoreSummary = {
  sessionId: string;
  workspaceId: string | null;
  currentStage: string;
  lastSeenAt: string;
  latestRunId: string | null;
  latestRunStatus: string | null;
  latestCloseoutStatus: string | null;
  latestRunCreatedAt: string | null;
  context: SessionRestoreContext | null;
};

export type SessionRestoreContext = {
  latestEventType: string | null;
  stage: string;
  summary: string;
  assistantSummary: string;
  confirmDecision: 'apply' | 'always_apply' | 'reject_comment' | null;
  confirmFiles: string[];
  applySuccess: boolean | null;
  applyCommitHash: string | null;
  applyBranch: string | null;
  applyFiles: string[];
  brewpmVerdict: 'approved' | 'changes_requested' | 'rejected' | null;
  brewpmSummary: string | null;
  brewpmCorrections: string[];
};

type MembershipRow = {
  org_id: string;
  role_name: string;
  status: string;
  organizations:
    | {
        id: string;
        name: string;
        slug: string;
        plan?: string;
      }
    | Array<{
        id: string;
        name: string;
        slug: string;
        plan?: string;
      }>
    | null;
};

type WorkspaceRow = {
  id: string;
  org_id: string;
  name: string;
};

type UsageRecordRow = {
  metric_name: string;
  metric_value: number;
  created_at: string;
  usage_lane?: string | null;
};

type ProviderKeyRow = {
  provider: string;
  status: string;
};

type BillingSubscriptionRow = {
  external_subscription_id: string | null;
  status: string;
  plan_code: string;
  current_period_start: string | null;
  current_period_end: string | null;
  workspace_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type BillingCustomerRow = {
  external_customer_id: string | null;
  billing_email: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type BillingEventLedgerRow = {
  event_type: string;
  payload: Record<string, any>;
  created_at: string;
};

type SessionRow = {
  id: string;
  workspace_id: string | null;
  current_stage: string;
  last_seen_at: string;
};

type RunRow = {
  id: string;
  session_id: string;
  status: string;
  closeout_status: string | null;
  created_at: string;
};

type RunEventRow = {
  run_id: string;
  event_type: string;
  payload: Record<string, any>;
  created_at: string;
};

type BrewPlan = 'free' | 'starter' | 'pro' | 'team' | 'enterprise';

function unwrapOrganization(value: MembershipRow['organizations']) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function monthBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function normalizePlan(plan?: string | null): BrewPlan {
  switch ((plan ?? '').trim().toLowerCase()) {
    case 'starter':
      return 'starter';
    case 'pro':
      return 'pro';
    case 'team':
      return 'team';
    case 'enterprise':
      return 'enterprise';
    default:
      return 'free';
  }
}

function getPlatformFeeUsd(plan: BrewPlan) {
  switch (plan) {
    case 'starter':
      return 19;
    case 'pro':
      return 49;
    case 'team':
      return 99;
    case 'enterprise':
      return 0;
    default:
      return 0;
  }
}

function getPlanDefaultModels(plan: BrewPlan): Record<string, string[]> {
  if (plan === 'enterprise') {
    return {
      openai: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-pro', 'gpt-5-mini'],
      gemini: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'],
      mistral: ['mistral-large-latest', 'mistral-small-latest'],
      nims: ['nemotron-3-8b-instruct', 'llama-3.1-8b-instruct'],
    };
  }

  if (plan === 'team') {
    return {
      openai: ['gpt-5.4-mini', 'gpt-5.4-pro', 'gpt-5-mini'],
      gemini: ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
      mistral: ['mistral-small-latest'],
    };
  }

  if (plan === 'pro') {
    return {
      openai: ['gpt-5.4-mini', 'gpt-5.4-pro', 'gpt-5-mini'],
      gemini: ['gemini-2.5-flash', 'gemini-2.5-flash-lite'],
      mistral: ['mistral-small-latest'],
    };
  }

  if (plan === 'starter') {
    return {
      openai: ['gpt-5.4-mini'],
      gemini: ['gemini-2.5-flash'],
    };
  }

  return {
    openai: ['gpt-5.4-mini'],
    gemini: ['gemini-2.5-flash'],
  };
}

function getAuthSources(plan: BrewPlan, providerKeys: ProviderKeyRow[]) {
  const hasWorkspaceKeys = providerKeys.some((key) => key.status === 'active');
  const sources: Array<'byok' | 'brew-managed'> = [];

  if (hasWorkspaceKeys) {
    sources.push('byok');
  }

  if (plan === 'pro' || plan === 'team' || plan === 'enterprise') {
    sources.push('brew-managed');
  }

  return sources;
}

function getBillingMode(
  plan: BrewPlan,
  providerKeys: ProviderKeyRow[]
): 'byok' | 'brew-managed' | 'hybrid' {
  const authSources = getAuthSources(plan, providerKeys);

  if (authSources.includes('byok') && authSources.includes('brew-managed')) {
    return 'hybrid';
  }

  if (authSources.includes('brew-managed')) {
    return 'brew-managed';
  }

  return 'byok';
}

async function loadMemberships(client: SupabaseAdminClient, userId: string) {
  const { data, error } = await client
    .from('memberships')
    .select('org_id, role_name, status, organizations(id, name, slug, plan)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
  return (data ?? []) as MembershipRow[];
}

async function loadWorkspaces(client: SupabaseAdminClient, orgId: string) {
  const { data, error } = await client
    .from('workspaces')
    .select('id, org_id, name')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as WorkspaceRow[];
}

async function loadProviderKeys(client: SupabaseAdminClient, orgId: string) {
  const { data, error } = await client
    .from('provider_keys')
    .select('provider, status')
    .eq('org_id', orgId);

  if (error) throw error;
  return (data ?? []) as ProviderKeyRow[];
}

async function loadUsageRecords(client: SupabaseAdminClient, orgId: string) {
  const { data, error } = await client
    .from('usage_meter_records')
    .select('metric_name, metric_value, created_at, usage_lane')
    .eq('org_id', orgId);

  if (error) throw error;
  return (data ?? []) as UsageRecordRow[];
}

function buildProviderUsageSummary(usage: UsageRecordRow[]) {
  const pattern =
    /^provider_(call|chars)_([a-z0-9-]+)_(env|hosted)_(managed|byok)$/i;
  const normalizeLane = (value?: string | null) => {
    const lane = (value ?? '').trim().toLowerCase();
    if (
      lane === 'executor' ||
      lane === 'planner' ||
      lane === 'reviewer' ||
      lane === 'memory' ||
      lane === 'research'
    ) {
      return lane;
    }
    return 'executor';
  };
  const byProvider = new Map<
    string,
    {
      provider: string;
      source: 'env' | 'hosted';
      authMode: 'managed' | 'byok';
      lane: 'executor' | 'planner' | 'reviewer' | 'memory' | 'research';
      callCount: number;
      charCount: number;
      lastSeenAt: string | null;
    }
  >();
  const byLane = new Map<
    string,
    {
      lane: 'executor' | 'planner' | 'reviewer' | 'memory' | 'research';
      callCount: number;
      charCount: number;
      lastSeenAt: string | null;
    }
  >();

  let totalCalls = 0;
  let totalChars = 0;

  for (const item of usage) {
    const match = item.metric_name.match(pattern);
    if (!match) continue;

    const [, metricKind, provider, source, authMode] = match;
    const lane = normalizeLane(item.usage_lane);
    const key = `${provider}:${source}:${authMode}:${lane}`;
    const current = byProvider.get(key) ?? {
      provider,
      source: source.toLowerCase() as 'env' | 'hosted',
      authMode: authMode.toLowerCase() as 'managed' | 'byok',
      lane,
      callCount: 0,
      charCount: 0,
      lastSeenAt: null,
    };
    const laneCurrent = byLane.get(lane) ?? {
      lane,
      callCount: 0,
      charCount: 0,
      lastSeenAt: null,
    };

    if (metricKind.toLowerCase() === 'call') {
      current.callCount += Number(item.metric_value ?? 0);
      totalCalls += Number(item.metric_value ?? 0);
      laneCurrent.callCount += Number(item.metric_value ?? 0);
    }

    if (metricKind.toLowerCase() === 'chars') {
      current.charCount += Number(item.metric_value ?? 0);
      totalChars += Number(item.metric_value ?? 0);
      laneCurrent.charCount += Number(item.metric_value ?? 0);
    }

    if (
      !current.lastSeenAt ||
      new Date(item.created_at).getTime() > new Date(current.lastSeenAt).getTime()
    ) {
      current.lastSeenAt = item.created_at;
    }
    if (
      !laneCurrent.lastSeenAt ||
      new Date(item.created_at).getTime() > new Date(laneCurrent.lastSeenAt).getTime()
    ) {
      laneCurrent.lastSeenAt = item.created_at;
    }

    byProvider.set(key, current);
    byLane.set(lane, laneCurrent);
  }

  return {
    totalCalls,
    totalChars,
    byProvider: Array.from(byProvider.values()).sort((a, b) =>
      a.provider.localeCompare(b.provider) ||
      a.source.localeCompare(b.source) ||
      a.authMode.localeCompare(b.authMode) ||
      a.lane.localeCompare(b.lane)
    ),
    byLane: Array.from(byLane.values()).sort((a, b) =>
      a.lane.localeCompare(b.lane)
    ),
  };
}

async function loadBillingSubscription(
  client: SupabaseAdminClient,
  orgId: string
) {
  const { data, error } = await client
    .from('billing_subscriptions')
    .select(
      'external_subscription_id, status, plan_code, current_period_start, current_period_end, workspace_id, metadata, created_at'
    )
    .eq('org_id', orgId)
    .eq('provider', 'stripe')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as BillingSubscriptionRow | null;
}

async function loadBillingCustomer(
  client: SupabaseAdminClient,
  orgId: string
) {
  const { data, error } = await client
    .from('billing_customers')
    .select('external_customer_id, billing_email, status, metadata, created_at')
    .eq('org_id', orgId)
    .eq('provider', 'stripe')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as BillingCustomerRow | null;
}

async function loadRecentBillingEvents(
  client: SupabaseAdminClient,
  orgId: string
) {
  const { data, error } = await client
    .from('billing_event_ledger')
    .select('event_type, payload, created_at')
    .eq('org_id', orgId)
    .eq('provider', 'stripe')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) throw error;
  return (data ?? []) as BillingEventLedgerRow[];
}

async function loadRecentSessions(
  client: SupabaseAdminClient,
  orgId: string,
  userId: string,
  workspaceId?: string
) {
  let query = client
    .from('sessions')
    .select('id, workspace_id, current_stage, last_seen_at')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .order('last_seen_at', { ascending: false })
    .limit(6);

  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SessionRow[];
}

async function loadRunsForSessions(
  client: SupabaseAdminClient,
  orgId: string,
  sessionIds: string[]
) {
  if (sessionIds.length === 0) return [] as RunRow[];

  const { data, error } = await client
    .from('runs')
    .select('id, session_id, status, closeout_status, created_at')
    .eq('org_id', orgId)
    .in('session_id', sessionIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RunRow[];
}

async function loadSessionById(
  client: SupabaseAdminClient,
  orgId: string,
  userId: string,
  sessionId: string,
  workspaceId?: string
) {
  let query = client
    .from('sessions')
    .select('id, workspace_id, current_stage, last_seen_at')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .eq('id', sessionId);

  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data ?? null) as SessionRow | null;
}

async function loadLatestRunForSession(
  client: SupabaseAdminClient,
  orgId: string,
  sessionId: string,
  workspaceId?: string
) {
  let query = client
    .from('runs')
    .select('id, session_id, status, closeout_status, created_at')
    .eq('org_id', orgId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return (data ?? null) as RunRow | null;
}

async function loadRunEvents(
  client: SupabaseAdminClient,
  orgId: string,
  runId: string
) {
  const { data, error } = await client
    .from('run_events')
    .select('run_id, event_type, payload, created_at')
    .eq('org_id', orgId)
    .eq('run_id', runId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as RunEventRow[];
}

function deriveSessionRestoreContext(
  session: SessionRow,
  latestRun: RunRow | null,
  events: RunEventRow[]
): SessionRestoreContext {
  const latestEvent = events[events.length - 1] ?? null;
  const latestConfirm = [...events]
    .reverse()
    .find((event) => event.event_type === 'confirm.requested');
  const latestApply = [...events]
    .reverse()
    .find((event) => event.event_type === 'apply.completed');
  const latestCollab = [...events]
    .reverse()
    .find((event) => event.event_type === 'collab.message');
  const latestReport = [...events]
    .reverse()
    .find((event) => event.event_type === 'report.emitted');
  const latestPreview = [...events]
    .reverse()
    .find((event) => event.event_type === 'preview.ready');
  const latestExecute = [...events]
    .reverse()
    .find((event) => event.event_type === 'execute.completed');
  const confirmPayload = (latestConfirm?.payload?.payload ?? {}) as {
    decision?: 'apply' | 'always_apply' | 'reject_comment';
    files?: string[];
    comment?: string;
  };
  const applyPayload = (latestApply?.payload?.payload ?? {}) as {
    success?: boolean;
    commitHash?: string | null;
    branch?: string | null;
    changedFiles?: string[];
    error?: string | null;
    output?: string | null;
  };
  const reportPayload = (latestReport?.payload?.payload ?? {}) as {
    summary?: string;
    status?: string;
  };
  const previewPayload = (latestPreview?.payload?.payload ?? {}) as {
    diffFiles?: number;
    hasChanges?: boolean;
  };
  const executePayload = (latestExecute?.payload?.payload ?? {}) as {
    responseText?: string;
    status?: string;
  };
  const collabMessage = (latestCollab?.payload?.payload ?? {}) as {
    message?: string;
  };

  const assistantSummary =
    collabMessage.message ??
    applyPayload.output ??
    reportPayload.summary ??
    executePayload.responseText ??
    (latestEvent?.event_type === 'confirm.requested'
      ? 'The session is waiting on confirmation.'
      : latestEvent?.event_type === 'apply.completed'
        ? applyPayload.success
          ? 'The sandbox apply completed and the session is ready to continue.'
          : 'The sandbox apply failed and needs attention.'
        : latestEvent?.event_type === 'preview.ready'
          ? 'A preview is ready for review.'
          : latestEvent?.event_type === 'execute.completed'
            ? 'Execution completed and the report is ready.'
            : latestEvent?.event_type === 'report.emitted'
              ? 'A report was emitted for the session.'
              : 'Session restored from persisted workflow events.');

  const summary =
    latestEvent?.event_type === 'confirm.requested'
      ? `Awaiting confirmation for ${confirmPayload.files?.length ?? 0} file${(confirmPayload.files?.length ?? 0) === 1 ? '' : 's'}.`
      : latestEvent?.event_type === 'apply.completed'
        ? applyPayload.success
          ? `Apply completed on ${applyPayload.branch ?? 'the active branch'}.`
          : `Apply failed${applyPayload.error ? `: ${applyPayload.error}` : ''}.`
        : latestEvent?.event_type === 'preview.ready'
          ? `Preview ready for ${previewPayload.diffFiles ?? 0} file${(previewPayload.diffFiles ?? 0) === 1 ? '' : 's'}.`
          : latestEvent?.event_type === 'execute.completed'
            ? `Execution completed with status ${executePayload.status ?? session.current_stage}.`
            : latestEvent?.event_type === 'report.emitted'
              ? `Report emitted for ${session.id.slice(0, 8)}.`
              : assistantSummary;

  return {
    latestEventType: latestEvent?.event_type ?? null,
    stage: session.current_stage,
    summary,
    assistantSummary,
    confirmDecision: confirmPayload.decision ?? null,
    confirmFiles: Array.isArray(confirmPayload.files)
      ? confirmPayload.files.filter((file): file is string => typeof file === 'string')
      : [],
    applySuccess:
      typeof applyPayload.success === 'boolean' ? applyPayload.success : null,
    applyCommitHash:
      typeof applyPayload.commitHash === 'string'
        ? applyPayload.commitHash
        : null,
    applyBranch:
      typeof applyPayload.branch === 'string' ? applyPayload.branch : null,
    applyFiles: Array.isArray(applyPayload.changedFiles)
      ? applyPayload.changedFiles.filter((file): file is string => typeof file === 'string')
      : [],
    brewpmVerdict: null,
    brewpmSummary: latestRun?.closeout_status ?? null,
    brewpmCorrections: [],
  };
}

function readBillingInterval(subscription: BillingSubscriptionRow | null) {
  const interval = subscription?.metadata?.interval;
  if (interval === 'monthly' || interval === 'yearly') {
    return interval;
  }
  return 'unknown' as const;
}

function buildLatestInvoice(events: BillingEventLedgerRow[]) {
  const invoiceEvent = events.find((event) => {
    const type = event.event_type;
    return (
      type.startsWith('invoice.') ||
      type === 'payment_intent.payment_failed' ||
      type === 'payment_intent.succeeded' ||
      type === 'checkout.session.completed'
    );
  });

  if (!invoiceEvent) return null;

  const payload = invoiceEvent.payload ?? {};
  const invoiceId =
    typeof payload.invoice === 'string'
      ? payload.invoice
      : typeof payload.id === 'string' && invoiceEvent.event_type.startsWith('invoice.')
        ? payload.id
        : null;
  const amountRaw =
    typeof payload.amount_paid === 'number'
      ? payload.amount_paid
      : typeof payload.amount_due === 'number'
        ? payload.amount_due
        : typeof payload.amount_total === 'number'
          ? payload.amount_total
          : null;
  const status =
    typeof payload.status === 'string'
      ? payload.status
      : invoiceEvent.event_type === 'payment_intent.payment_failed'
        ? 'payment_failed'
        : invoiceEvent.event_type === 'payment_intent.succeeded'
          ? 'paid'
          : 'recorded';
  const { label, category } = describeBillingEvent(invoiceEvent.event_type);

  return {
    invoiceId,
    eventType: invoiceEvent.event_type,
    eventLabel: label,
    eventCategory: category,
    status,
    amountUsd: typeof amountRaw === 'number' ? amountRaw / 100 : null,
    createdAt: invoiceEvent.created_at ?? null,
  };
}

function describeBillingEvent(eventType: string): {
  label: string;
  category: 'invoice' | 'payment' | 'checkout';
} {
  switch (eventType) {
    case 'checkout.session.completed':
      return { label: 'Checkout completed', category: 'checkout' };
    case 'invoice.created':
      return { label: 'Invoice created', category: 'invoice' };
    case 'invoice.finalized':
      return { label: 'Invoice finalized', category: 'invoice' };
    case 'invoice.paid':
      return { label: 'Invoice paid', category: 'invoice' };
    case 'invoice.payment_failed':
      return { label: 'Invoice payment failed', category: 'invoice' };
    case 'payment_intent.succeeded':
      return { label: 'Payment succeeded', category: 'payment' };
    case 'payment_intent.payment_failed':
      return { label: 'Payment failed', category: 'payment' };
    default:
      return { label: eventType.replaceAll('.', ' '), category: 'invoice' };
  }
}

function buildInvoiceHistory(events: BillingEventLedgerRow[]) {
  return events
    .filter((event) => {
      const type = event.event_type;
      return (
        type.startsWith('invoice.') ||
        type === 'payment_intent.payment_failed' ||
        type === 'payment_intent.succeeded' ||
        type === 'checkout.session.completed'
      );
    })
    .map((event) => {
      const payload = event.payload ?? {};
      const invoiceId =
        typeof payload.invoice === 'string'
          ? payload.invoice
          : typeof payload.id === 'string' && event.event_type.startsWith('invoice.')
            ? payload.id
            : null;
      const amountRaw =
        typeof payload.amount_paid === 'number'
          ? payload.amount_paid
          : typeof payload.amount_due === 'number'
            ? payload.amount_due
            : typeof payload.amount_total === 'number'
              ? payload.amount_total
              : null;
      const status =
        typeof payload.status === 'string'
          ? payload.status
          : event.event_type === 'payment_intent.payment_failed'
            ? 'payment_failed'
            : event.event_type === 'payment_intent.succeeded'
              ? 'paid'
              : 'recorded';
      const { label, category } = describeBillingEvent(event.event_type);

      return {
        invoiceId,
        eventType: event.event_type,
        eventLabel: label,
        eventCategory: category,
        status,
        amountUsd: typeof amountRaw === 'number' ? amountRaw / 100 : null,
        createdAt: event.created_at ?? null,
      };
    })
    .slice(0, 6);
}

export async function resolveConsoleContext(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string,
  requestedWorkspaceId?: string
) {
  const memberships = await loadMemberships(client, user.id);
  const organizations = memberships
    .map((membership) => unwrapOrganization(membership.organizations))
    .filter(Boolean);

  const org =
    organizations.find((item) => item?.id === requestedOrgId) ??
    organizations[0] ??
    null;

  if (!org) {
    return {
      membership: null,
      org: null,
      workspaces: [] as WorkspaceRow[],
      workspace: null as WorkspaceRow | null,
    };
  }

  const membership =
    memberships.find((item) => item.org_id === org.id) ?? null;
  const workspaces = await loadWorkspaces(client, org.id);
  const workspace =
    workspaces.find((item) => item.id === requestedWorkspaceId) ??
    workspaces[0] ??
    null;

  return {
    membership,
    org,
    workspaces,
    workspace,
  };
}

export async function buildAccountSessionSummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string,
  requestedWorkspaceId?: string
): Promise<AccountSessionSummary> {
  const { membership, org, workspace } = await resolveConsoleContext(
    client,
    user,
    requestedOrgId,
    requestedWorkspaceId
  );

  const email = user.email ?? '';
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    email.split('@')[0] ??
    'BrewAssist User';
  const capabilities =
    org && membership
      ? await resolveOrgRoleCapabilities({
          client,
          orgId: org.id,
          userId: user.id,
        })
      : {
          roleName: 'customer',
          permissions: {
            manage_org: false,
            manage_billing: false,
            manage_memberships: false,
            manage_repos: false,
            manage_policies: false,
            approve_runs: false,
            execute_runs: false,
            comment: false,
          },
          canManageIdentity: false,
          canManageProviders: false,
        };

  return {
    accountId: user.id,
    email,
    displayName,
    plan: normalizePlan(org?.plan),
    accountStanding: org ? 'active' : 'inactive',
    ownerMode: membership?.role_name === 'owner',
    role: capabilities.roleName,
    capabilities: {
      ...capabilities.permissions,
      canManageIdentity: capabilities.canManageIdentity,
      canManageProviders: capabilities.canManageProviders,
    },
    orgId: org?.id ?? null,
    workspaceId: workspace?.id ?? null,
  };
}

export async function buildWorkspaceSummaries(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string,
  requestedWorkspaceId?: string
): Promise<WorkspaceSummary[]> {
  const { membership, org, workspaces, workspace } = await resolveConsoleContext(
    client,
    user,
    requestedOrgId,
    requestedWorkspaceId
  );

  if (!org || !membership) return [];

  const providerKeys = await loadProviderKeys(client, org.id);
  const plan = normalizePlan(org.plan);
  const billingMode = getBillingMode(plan, providerKeys);

  return workspaces.map((item) => ({
    workspaceId: item.id,
    name: item.name,
    role: membership.role_name,
    billingMode,
    active: item.id === workspace?.id,
  }));
}

export async function buildEntitlementSummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string
): Promise<EntitlementSummary> {
  const { org } = await resolveConsoleContext(client, user, requestedOrgId);

  if (!org) {
    return {
      platformAccess: false,
      authSources: [],
      providers: [],
      models: {},
      intelligenceMeters: {
        agentStep: false,
        executionChain: false,
        memoryRetention: false,
      },
    };
  }

  const plan = normalizePlan(org.plan);
  const providerKeys = await loadProviderKeys(client, org.id);
  const planModels = getPlanDefaultModels(plan);
  const keyProviders = providerKeys
    .filter((item) => item.status === 'active')
    .map((item) => item.provider);
  const providers = [...new Set([...Object.keys(planModels), ...keyProviders])];

  return {
    platformAccess: true,
    authSources: getAuthSources(plan, providerKeys),
    providers,
    models: planModels,
    intelligenceMeters: {
      agentStep: plan !== 'free',
      executionChain: true,
      memoryRetention: plan === 'pro' || plan === 'team' || plan === 'enterprise',
    },
  };
}

export async function buildBillingSummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string
): Promise<BillingSummary> {
  const { org } = await resolveConsoleContext(client, user, requestedOrgId);
  const bounds = monthBounds();

  if (!org) {
    return {
      plan: 'free',
      platformFeeUsd: 0,
      currentPeriodStart: bounds.start,
      currentPeriodEnd: bounds.end,
      managedSpendUsd: 0,
      intelligenceSpendUsd: 0,
      creditsRemainingUsd: 0,
      providerUsage: {
        totalCalls: 0,
        totalChars: 0,
        byProvider: [],
        byLane: [],
      },
      stripeReady: false,
      subscription: null,
      customer: null,
      latestInvoice: null,
      invoiceHistory: [],
    };
  }

  const [usage, subscription, customer, recentEvents] = await Promise.all([
    loadUsageRecords(client, org.id),
    loadBillingSubscription(client, org.id),
    loadBillingCustomer(client, org.id),
    loadRecentBillingEvents(client, org.id),
  ]);
  const managedSpendUsd = usage
    .filter((item) => item.metric_name === 'managed_spend_usd')
    .reduce((sum, item) => sum + Number(item.metric_value), 0);
  const intelligenceSpendUsd = usage
    .filter((item) => item.metric_name === 'intelligence_spend_usd')
    .reduce((sum, item) => sum + Number(item.metric_value), 0);
  const creditsRemainingUsd = usage
    .filter((item) => item.metric_name === 'credit_balance_usd')
    .reduce((_, item) => Number(item.metric_value), 0);

  const plan = normalizePlan(subscription?.plan_code ?? org.plan);
  const currentPeriodStart = subscription?.current_period_start ?? bounds.start;
  const currentPeriodEnd = subscription?.current_period_end ?? bounds.end;

  return {
    plan,
    platformFeeUsd: getPlatformFeeUsd(plan),
    currentPeriodStart,
    currentPeriodEnd,
    managedSpendUsd,
    intelligenceSpendUsd,
    creditsRemainingUsd,
    providerUsage: buildProviderUsageSummary(usage),
    stripeReady: false,
    subscription: subscription
      ? {
          externalSubscriptionId: subscription.external_subscription_id,
          status: subscription.status,
          billingInterval: readBillingInterval(subscription),
          customerId:
            typeof subscription.metadata?.customerId === 'string'
              ? subscription.metadata.customerId
              : customer?.external_customer_id ?? null,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          workspaceId: subscription.workspace_id,
          cancelAtPeriodEnd:
            subscription.metadata?.cancelAtPeriodEnd === true,
          cancelAt:
            typeof subscription.metadata?.cancelAt === 'string'
              ? subscription.metadata.cancelAt
              : null,
        }
      : null,
    customer: customer
      ? {
          externalCustomerId: customer.external_customer_id,
          billingEmail: customer.billing_email,
          status: customer.status,
        }
      : null,
    latestInvoice: buildLatestInvoice(recentEvents),
    invoiceHistory: buildInvoiceHistory(recentEvents),
  };
}

export async function buildCreditsSummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string
): Promise<CreditsSummary> {
  const billing = await buildBillingSummary(client, user, requestedOrgId);

  return {
    creditsRemainingUsd: billing.creditsRemainingUsd,
    autoRechargeEnabled: false,
    billingRail: 'stripe-pending',
    stripeReady: false,
  };
}

export async function buildManagedProviderSummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string
): Promise<ManagedProviderSummary> {
  const { org } = await resolveConsoleContext(client, user, requestedOrgId);

  if (!org) {
    return {
      providers: [],
      usage: {
        totalCalls: 0,
        totalChars: 0,
        byProvider: [],
        byLane: [],
      },
    };
  }

  const plan = normalizePlan(org.plan);
  const providerKeys = await loadProviderKeys(client, org.id);
  const planModels = getPlanDefaultModels(plan);
  const authSources = getAuthSources(plan, providerKeys);
  const keyProviders = providerKeys
    .filter((item) => item.status === 'active')
    .map((item) => item.provider);
  const providerIds = [...new Set([...Object.keys(planModels), ...keyProviders])];
  const usage = await loadUsageRecords(client, org.id);

  return {
    providers: providerIds.map((providerId) => ({
      id: providerId,
      enabled: true,
      authModes:
        keyProviders.includes(providerId) && authSources.includes('brew-managed')
          ? ['byok', 'brew-managed']
          : keyProviders.includes(providerId)
            ? ['byok']
            : ['brew-managed'],
      models: planModels[providerId] ?? [],
      source: keyProviders.includes(providerId)
        ? 'workspace-keys'
        : 'plan-default',
    })),
    usage: buildProviderUsageSummary(usage),
  };
}

export async function buildSessionContinuitySummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId?: string,
  requestedWorkspaceId?: string
): Promise<SessionContinuitySummary> {
  const { org, workspace } = await resolveConsoleContext(
    client,
    user,
    requestedOrgId,
    requestedWorkspaceId
  );

  if (!org) {
    return { sessions: [] };
  }

  const sessions = await loadRecentSessions(
    client,
    org.id,
    user.id,
    workspace?.id ?? requestedWorkspaceId
  );
  const runs = await loadRunsForSessions(
    client,
    org.id,
    sessions.map((item) => item.id)
  );
  const latestRunsBySession = new Map<string, RunRow>();

  runs.forEach((run) => {
    if (!latestRunsBySession.has(run.session_id)) {
      latestRunsBySession.set(run.session_id, run);
    }
  });

  return {
    sessions: sessions.map((session) => {
      const latestRun = latestRunsBySession.get(session.id) ?? null;

      return {
        sessionId: session.id,
        workspaceId: session.workspace_id,
        currentStage: session.current_stage,
        lastSeenAt: session.last_seen_at,
        latestRunId: latestRun?.id ?? null,
        latestRunStatus: latestRun?.status ?? null,
        latestCloseoutStatus: latestRun?.closeout_status ?? null,
        latestRunCreatedAt: latestRun?.created_at ?? null,
      };
    }),
  };
}

export async function buildSessionRestoreSummary(
  client: SupabaseAdminClient,
  user: User,
  requestedOrgId: string,
  sessionId: string,
  requestedWorkspaceId?: string
): Promise<SessionRestoreSummary | null> {
  const { org, workspace } = await resolveConsoleContext(
    client,
    user,
    requestedOrgId,
    requestedWorkspaceId
  );

  if (!org) return null;

  const session = await loadSessionById(
    client,
    org.id,
    user.id,
    sessionId,
    workspace?.id ?? requestedWorkspaceId
  );

  if (!session) return null;

  const latestRun = await loadLatestRunForSession(
    client,
    org.id,
    session.id,
    session.workspace_id ?? workspace?.id ?? requestedWorkspaceId
  );
  const events = latestRun
    ? await loadRunEvents(client, org.id, latestRun.id)
    : [];

  return {
    sessionId: session.id,
    workspaceId: session.workspace_id,
    currentStage: session.current_stage,
    lastSeenAt: session.last_seen_at,
    latestRunId: latestRun?.id ?? null,
    latestRunStatus: latestRun?.status ?? null,
    latestCloseoutStatus: latestRun?.closeout_status ?? null,
    latestRunCreatedAt: latestRun?.created_at ?? null,
    context: latestRun
      ? deriveSessionRestoreContext(session, latestRun, events)
      : null,
  };
}
