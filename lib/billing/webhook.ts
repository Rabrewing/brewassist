import type { SupabaseClient } from '@supabase/supabase-js';

import {
  recordStripeEvent,
  updateOrganizationPlan,
  upsertBillingCustomer,
  upsertBillingSubscription,
} from '@/lib/billing/controlPlane';

type StripeEvent = {
  id: string;
  type: string;
  data?: {
    object?: Record<string, any>;
  };
};

function readMetadata(object: Record<string, any> | undefined) {
  return (object?.metadata ?? {}) as Record<string, string>;
}

function readPeriodUnix(value: unknown) {
  if (typeof value !== 'number') return null;
  return new Date(value * 1000).toISOString();
}

function readSubscriptionMetadata(object: Record<string, any> | undefined) {
  const base = { ...(object?.metadata ?? {}) } as Record<string, unknown>;

  if (typeof object?.cancel_at_period_end === 'boolean') {
    base.cancelAtPeriodEnd = object.cancel_at_period_end;
  }

  const cancelAt = readPeriodUnix(object?.cancel_at);
  if (cancelAt) {
    base.cancelAt = cancelAt;
  }

  return base;
}

function readSubscriptionItemPriceNickname(object: Record<string, any> | undefined) {
  const metadataPlanId = object?.metadata?.planId;
  if (typeof metadataPlanId === 'string' && metadataPlanId.trim()) {
    return metadataPlanId.trim().toLowerCase();
  }

  return (
    object?.items?.data?.[0]?.price?.nickname ??
    object?.plan?.nickname ??
    'unknown'
  );
}

export async function handleStripeWebhookEvent(
  client: SupabaseClient,
  event: StripeEvent
) {
  const object = event.data?.object ?? {};
  const metadata = readMetadata(object);
  const orgId = metadata.orgId ?? metadata.org_id;

  if (!orgId) {
    return {
      recorded: false,
      reason: 'missing-org-id',
    };
  }

  const recorded = await recordStripeEvent(client, {
    orgId,
    eventId: event.id,
    eventType: event.type,
    payload: object,
    status: 'received',
  });

  if (!recorded) {
    return {
      recorded: false,
      reason: 'duplicate-event',
    };
  }

  const actorId = metadata.actorId ?? metadata.actor_id ?? metadata.userId ?? metadata.user_id;

  switch (event.type) {
    case 'customer.created':
    case 'customer.updated': {
      if (typeof object.id !== 'string' || !actorId) break;

      await upsertBillingCustomer(client, {
        orgId,
        actorId,
        billingEmail:
          typeof object.email === 'string' ? object.email : metadata.billingEmail ?? null,
        externalCustomerId: object.id,
        status: typeof object.deleted === 'boolean' && object.deleted ? 'deleted' : 'active',
        metadata: object.metadata ?? {},
      });
      break;
    }
    case 'checkout.session.completed': {
      if (!actorId) break;

      if (typeof object.customer === 'string') {
        await upsertBillingCustomer(client, {
          orgId,
          actorId,
          billingEmail:
            typeof object.customer_details?.email === 'string'
              ? object.customer_details.email
              : metadata.billingEmail ?? null,
          externalCustomerId: object.customer,
          status: 'active',
          metadata: object.metadata ?? {},
        });
      }

      if (typeof object.subscription === 'string') {
        await upsertBillingSubscription(client, {
          orgId,
          workspaceId: metadata.workspaceId ?? metadata.workspace_id ?? null,
          externalSubscriptionId: object.subscription,
          planCode: metadata.planId ?? 'unknown',
          status: 'active',
          metadata: object.metadata ?? {},
          actorId,
        });
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      if (typeof object.id !== 'string' || !actorId) break;

      const planCode = readSubscriptionItemPriceNickname(object);

      await upsertBillingSubscription(client, {
        orgId,
        workspaceId: metadata.workspaceId ?? metadata.workspace_id ?? null,
        externalSubscriptionId: object.id,
        planCode,
        status: String(object.status ?? 'unknown'),
        currentPeriodStart: readPeriodUnix(object.current_period_start),
        currentPeriodEnd: readPeriodUnix(object.current_period_end),
        metadata: readSubscriptionMetadata(object),
        actorId,
      });

      await updateOrganizationPlan(
        client,
        orgId,
        event.type === 'customer.subscription.deleted' ? 'free' : planCode
      );
      break;
    }
    default:
      break;
  }

  return {
    recorded: true,
    reason: 'processed',
  };
}
