import type { NextApiRequest, NextApiResponse } from 'next';

import { getStripeCustomerIdForOrg } from '@/lib/billing/controlPlane';
import { createStripeBillingPortalSession, resolveAppUrl } from '@/lib/billing/stripe';
import { resolveConsoleContext } from '@/lib/console/controlPlane';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { createSupabaseAdminClient, getAuthenticatedUser } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const client = createSupabaseAdminClient();
    const enterpriseContext = parseEnterpriseContext(req);
    const { org } = await resolveConsoleContext(
      client,
      user,
      enterpriseContext.orgId,
      enterpriseContext.workspaceId
    );

    if (!org) {
      return res.status(400).json({ error: 'Active organization is required' });
    }

    const customerId = await getStripeCustomerIdForOrg(client, org.id);
    if (!customerId) {
      return res.status(404).json({
        error: 'No Stripe customer is linked for the current organization yet',
      });
    }

    const appUrl = resolveAppUrl(req.headers);
    const session = await createStripeBillingPortalSession({
      customerId,
      returnUrl: `${appUrl}/console/billing`,
    });

    return res.status(200).json({
      url: session.url,
      portalSessionId: session.id,
    });
  } catch (error: any) {
    console.error('[api/billing/portal]', error?.message ?? error);
    return res.status(500).json({
      error: error?.message ?? 'Failed to create Stripe billing portal session',
    });
  }
}
