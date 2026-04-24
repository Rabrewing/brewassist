import type { SupabaseClient } from '@supabase/supabase-js';

type BillingCustomerRow = {
  id: string;
  org_id: string;
  provider: string;
  external_customer_id: string | null;
  billing_email: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
};

type BillingSubscriptionUpsertInput = {
  orgId: string;
  workspaceId?: string | null;
  externalSubscriptionId: string;
  planCode: string;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  metadata?: Record<string, unknown>;
  actorId: string;
};

type BillingSubscriptionRow = {
  id: string;
  plan_code: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  metadata: Record<string, unknown> | null;
};

export async function getBillingCustomer(
  client: SupabaseClient,
  orgId: string
) {
  const { data, error } = await client
    .from('billing_customers')
    .select('id, org_id, provider, external_customer_id, billing_email, status, metadata')
    .eq('org_id', orgId)
    .eq('provider', 'stripe')
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as BillingCustomerRow | null;
}

export async function upsertBillingCustomer(
  client: SupabaseClient,
  input: {
    orgId: string;
    actorId: string;
    billingEmail: string | null;
    externalCustomerId: string;
    status: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await client.from('billing_customers').upsert(
    {
      org_id: input.orgId,
      provider: 'stripe',
      external_customer_id: input.externalCustomerId,
      billing_email: input.billingEmail,
      status: input.status,
      metadata: input.metadata ?? {},
      created_by: input.actorId,
    },
    { onConflict: 'org_id,provider' }
  );

  if (error) throw error;
}

export async function recordStripeEvent(
  client: SupabaseClient,
  input: {
    orgId: string;
    eventId: string;
    eventType: string;
    payload: Record<string, unknown>;
    status?: string;
    processedAt?: string;
  }
) {
  const { error } = await client.from('billing_event_ledger').insert({
    org_id: input.orgId,
    provider: 'stripe',
    external_event_id: input.eventId,
    event_type: input.eventType,
    status: input.status ?? 'received',
    payload: input.payload,
    processed_at: input.processedAt ?? null,
  });

  if (error) {
    if (error.code === '23505') {
      return false;
    }
    throw error;
  }

  return true;
}

export async function upsertBillingSubscription(
  client: SupabaseClient,
  input: BillingSubscriptionUpsertInput
) {
  const { data: existing, error: existingError } = await client
    .from('billing_subscriptions')
    .select('id, plan_code, status, current_period_start, current_period_end, metadata')
    .eq('provider', 'stripe')
    .eq('external_subscription_id', input.externalSubscriptionId)
    .maybeSingle();

  if (existingError) throw existingError;
  const existingRow = (existing ?? null) as BillingSubscriptionRow | null;

  if (existingRow?.id) {
    const { error } = await client
      .from('billing_subscriptions')
      .update({
        workspace_id: input.workspaceId ?? null,
        plan_code: input.planCode || existingRow.plan_code,
        status: input.status,
        current_period_start:
          input.currentPeriodStart ?? existingRow.current_period_start,
        current_period_end:
          input.currentPeriodEnd ?? existingRow.current_period_end,
        metadata: input.metadata ?? existingRow.metadata ?? {},
      })
      .eq('id', existingRow.id);

    if (error) throw error;
    return;
  }

  const { error } = await client.from('billing_subscriptions').insert({
    org_id: input.orgId,
    workspace_id: input.workspaceId ?? null,
    provider: 'stripe',
    external_subscription_id: input.externalSubscriptionId,
    plan_code: input.planCode,
    status: input.status,
    current_period_start: input.currentPeriodStart ?? null,
    current_period_end: input.currentPeriodEnd ?? null,
    metadata: input.metadata ?? {},
    created_by: input.actorId,
  });

  if (error) throw error;
}

export async function getStripeCustomerIdForOrg(
  client: SupabaseClient,
  orgId: string
) {
  const customer = await getBillingCustomer(client, orgId);
  return customer?.external_customer_id ?? null;
}

export async function updateOrganizationPlan(
  client: SupabaseClient,
  orgId: string,
  plan: string
) {
  const { error } = await client
    .from('organizations')
    .update({ plan })
    .eq('id', orgId);

  if (error) throw error;
}
