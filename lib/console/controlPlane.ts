import type { User } from '@supabase/supabase-js';

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
  stripeReady: boolean;
};

export type CreditsSummary = {
  creditsRemainingUsd: number;
  autoRechargeEnabled: boolean;
  billingRail: 'stripe-pending';
  stripeReady: boolean;
};

export type ManagedProviderSummary = {
  providers: Array<{
    id: string;
    enabled: boolean;
    authModes: Array<'byok' | 'brew-managed'>;
    models: string[];
    source: 'workspace-keys' | 'plan-default';
  }>;
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
};

type ProviderKeyRow = {
  provider: string;
  status: string;
};

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

function getPlatformFeeUsd(plan: string) {
  switch (plan) {
    case 'enterprise':
      return 499;
    case 'pro':
      return 99;
    default:
      return 24;
  }
}

function getPlanDefaultModels(plan: string): Record<string, string[]> {
  if (plan === 'enterprise') {
    return {
      openai: ['gpt-5.4', 'gpt-5.4-mini'],
      anthropic: ['claude-3.5-sonnet'],
      gemini: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    };
  }

  if (plan === 'pro') {
    return {
      openai: ['gpt-5.4-mini'],
      anthropic: ['claude-3.5-sonnet'],
      gemini: ['gemini-2.5-flash'],
    };
  }

  return {
    openai: ['gpt-5.4-mini'],
  };
}

function getAuthSources(plan: string, providerKeys: ProviderKeyRow[]) {
  const hasWorkspaceKeys = providerKeys.some((key) => key.status === 'active');
  const sources: Array<'byok' | 'brew-managed'> = [];

  if (hasWorkspaceKeys) {
    sources.push('byok');
  }

  if (plan === 'pro' || plan === 'enterprise') {
    sources.push('brew-managed');
  }

  return sources;
}

function getBillingMode(
  plan: string,
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
    .select('metric_name, metric_value')
    .eq('org_id', orgId);

  if (error) throw error;
  return (data ?? []) as UsageRecordRow[];
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

  return {
    accountId: user.id,
    email,
    displayName,
    plan: org?.plan ?? 'free',
    accountStanding: org ? 'active' : 'inactive',
    ownerMode: membership?.role_name === 'owner',
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
  const billingMode = getBillingMode(org.plan ?? 'free', providerKeys);

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

  const providerKeys = await loadProviderKeys(client, org.id);
  const planModels = getPlanDefaultModels(org.plan ?? 'free');
  const keyProviders = providerKeys
    .filter((item) => item.status === 'active')
    .map((item) => item.provider);
  const providers = [...new Set([...Object.keys(planModels), ...keyProviders])];

  return {
    platformAccess: true,
    authSources: getAuthSources(org.plan ?? 'free', providerKeys),
    providers,
    models: planModels,
    intelligenceMeters: {
      agentStep: org.plan !== 'free',
      executionChain: true,
      memoryRetention: org.plan === 'pro' || org.plan === 'enterprise',
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
      stripeReady: false,
    };
  }

  const usage = await loadUsageRecords(client, org.id);
  const managedSpendUsd = usage
    .filter((item) => item.metric_name === 'managed_spend_usd')
    .reduce((sum, item) => sum + Number(item.metric_value), 0);
  const intelligenceSpendUsd = usage
    .filter((item) => item.metric_name === 'intelligence_spend_usd')
    .reduce((sum, item) => sum + Number(item.metric_value), 0);
  const creditsRemainingUsd = usage
    .filter((item) => item.metric_name === 'credit_balance_usd')
    .reduce((_, item) => Number(item.metric_value), 0);

  return {
    plan: org.plan ?? 'free',
    platformFeeUsd: getPlatformFeeUsd(org.plan ?? 'free'),
    currentPeriodStart: bounds.start,
    currentPeriodEnd: bounds.end,
    managedSpendUsd,
    intelligenceSpendUsd,
    creditsRemainingUsd,
    stripeReady: false,
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
    return { providers: [] };
  }

  const providerKeys = await loadProviderKeys(client, org.id);
  const planModels = getPlanDefaultModels(org.plan ?? 'free');
  const authSources = getAuthSources(org.plan ?? 'free', providerKeys);
  const keyProviders = providerKeys
    .filter((item) => item.status === 'active')
    .map((item) => item.provider);
  const providerIds = [...new Set([...Object.keys(planModels), ...keyProviders])];

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
  };
}
