import type { NextApiRequest, NextApiResponse } from 'next';

import {
  getBillingCustomer,
  upsertBillingCustomer,
} from '@/lib/billing/controlPlane';
import {
  createStripeCheckoutSession,
  createStripeCustomer,
  resolveAppUrl,
  updateStripeCustomer,
} from '@/lib/billing/stripe';
import {
  isStripePlanId,
  type StripeBillingInterval,
  resolveStripePlanPrice,
} from '@/lib/billing/stripeCatalog';
import { resolveConsoleContext } from '@/lib/console/controlPlane';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { createSupabaseAdminClient, getAuthenticatedUser } from '@/lib/supabase/server';

type CheckoutBody = {
  planId?: string;
  interval?: StripeBillingInterval;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body ?? {}) as CheckoutBody;
  if (!body.planId || !isStripePlanId(body.planId)) {
    return res.status(400).json({ error: 'A supported self-serve planId is required' });
  }

  const interval =
    body.interval === 'monthly' || body.interval === 'yearly'
      ? body.interval
      : 'monthly';

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const client = createSupabaseAdminClient();
    const enterpriseContext = parseEnterpriseContext(req);
    const { org, workspace } = await resolveConsoleContext(
      client,
      user,
      enterpriseContext.orgId,
      enterpriseContext.workspaceId
    );

    if (!org) {
      return res.status(400).json({ error: 'Active organization is required' });
    }

    const price = resolveStripePlanPrice(body.planId, interval);
    const existingCustomer = await getBillingCustomer(client, org.id);
    const metadata = {
      orgId: org.id,
      workspaceId: workspace?.id ?? '',
      actorId: user.id,
      planId: body.planId,
      interval,
    };

    let customerId = existingCustomer?.external_customer_id ?? null;
    if (!customerId) {
      const createdCustomer = await createStripeCustomer({
        email: user.email ?? '',
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          org.name,
        metadata,
      });
      customerId = createdCustomer.id;
      await upsertBillingCustomer(client, {
        orgId: org.id,
        actorId: user.id,
        billingEmail: user.email ?? null,
        externalCustomerId: createdCustomer.id,
        status: 'pending-checkout',
        metadata,
      });
    } else {
      await updateStripeCustomer(customerId, {
        email: user.email ?? undefined,
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          org.name,
        metadata,
      });
    }

    const appUrl = resolveAppUrl(req.headers);
    const session = await createStripeCheckoutSession({
      customerId,
      priceId: price.priceId,
      successUrl: `${appUrl}/console/billing?checkout=success`,
      cancelUrl: `${appUrl}/console/billing?checkout=cancelled`,
      clientReferenceId: org.id,
      metadata,
    });

    return res.status(200).json({
      url: session.url,
      checkoutSessionId: session.id,
    });
  } catch (error: any) {
    console.error('[api/billing/checkout]', error?.message ?? error);
    return res.status(500).json({
      error: error?.message ?? 'Failed to create Stripe checkout session',
    });
  }
}
