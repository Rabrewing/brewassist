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
      openai: ['gpt-5.4', 'gpt-5.4-mini'],
      anthropic: ['claude-3.5-sonnet'],
      gemini: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    };
  }

  if (plan === 'team') {
    return {
      openai: ['gpt-5.4-mini'],
      anthropic: ['claude-3.5-sonnet'],
      gemini: ['gemini-2.5-flash'],
    };
  }

  if (plan === 'pro') {
    return {
      openai: ['gpt-5.4-mini'],
      anthropic: ['claude-3.5-sonnet'],
      gemini: ['gemini-2.5-flash'],
    };
  }

  if (plan === 'starter') {
    return {
      openai: ['gpt-5.4-mini'],
    };
  }

  return {
    openai: ['gpt-5.4-mini'],
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
    .select('metric_name, metric_value')
    .eq('org_id', orgId);

  if (error) throw error;
  return (data ?? []) as UsageRecordRow[];
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

  return {
    accountId: user.id,
    email,
    displayName,
    plan: normalizePlan(org?.plan),
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
    return { providers: [] };
  }

  const plan = normalizePlan(org.plan);
  const providerKeys = await loadProviderKeys(client, org.id);
  const planModels = getPlanDefaultModels(plan);
  const authSources = getAuthSources(plan, providerKeys);
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
