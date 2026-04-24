import type { NextApiRequest, NextApiResponse } from 'next';

import { getStripeReadinessSummary } from '@/lib/billing/stripeReadiness';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { getEnterpriseIdentitySummary } from '@/lib/enterprise/identityReadiness';
import { getAuthenticatedUser, getSupabaseEnterpriseRole } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const enterpriseContext = parseEnterpriseContext(req);
    const role = await getSupabaseEnterpriseRole(req, res, enterpriseContext.orgId);
    const identity = getEnterpriseIdentitySummary(role);
    const stripe = getStripeReadinessSummary();

    return res.status(200).json({
      readiness: {
        identity,
        stripe,
        trustChecklist: [
          {
            key: 'tenant-isolation',
            status: 'live',
            detail: 'Organizations, memberships, and RLS-backed access paths exist in Supabase.',
          },
          {
            key: 'auditability',
            status: 'live',
            detail: 'Audit logs and run events exist; customer-facing export and retention policy still need product surfaces.',
          },
          {
            key: 'managed-keys',
            status: 'live',
            detail: 'Managed provider contract keeps raw provider keys server-side only.',
          },
          {
            key: 'sso',
            status: identity.ssoReady ? 'live' : 'missing',
            detail: identity.ssoReady
              ? 'Enterprise SSO flags are present.'
              : 'Enterprise SSO is still pending actual IdP integration and tenant routing.',
          },
          {
            key: 'scim',
            status: identity.scimReady ? 'live' : 'planned',
            detail: identity.scimReady
              ? 'Provisioning path is enabled.'
              : 'SCIM should follow the first stable SSO implementation.',
          },
          {
            key: 'billing-controls',
            status: stripe.ready ? 'live' : 'planned',
            detail: stripe.reason,
          },
        ],
      },
    });
  } catch (error: any) {
    console.error('[api/security/enterprise-readiness]', error?.message ?? error);
    return res.status(500).json({
      error: error?.message ?? 'Failed to load enterprise readiness',
    });
  }
}
