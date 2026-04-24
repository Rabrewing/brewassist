import type { NextApiRequest, NextApiResponse } from 'next';

import {
  loadIdentityAdminConfig,
  upsertDomainVerification,
  upsertIdentityProvider,
} from '@/lib/enterprise/identityAdmin';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import {
  createSupabaseAdminClient,
  getAuthenticatedUser,
  getSupabaseEnterpriseRole,
} from '@/lib/supabase/server';

type IdentityAdminRequestBody = {
  action?: 'upsert-provider' | 'upsert-domain';
  providerName?: string;
  protocol?: 'oidc' | 'saml';
  status?: string;
  domainHint?: string;
  issuer?: string;
  domain?: string;
  verificationMethod?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const enterpriseContext = parseEnterpriseContext(req);
  const orgId = enterpriseContext.orgId;

  if (!orgId) {
    return res.status(400).json({ error: 'Organization context is required' });
  }

  try {
    const user = await getAuthenticatedUser(req, res);
    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const role = await getSupabaseEnterpriseRole(req, res, orgId);
    const isAdmin = role === 'admin';
    const client = createSupabaseAdminClient();

    if (req.method === 'GET') {
      const config = await loadIdentityAdminConfig(client, orgId);
      return res.status(200).json({
        config,
        role,
        canManage: isAdmin,
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Admin or owner membership is required to manage enterprise identity.',
      });
    }

    const body = (req.body ?? {}) as IdentityAdminRequestBody;

    if (body.action === 'upsert-provider') {
      const providerName = body.providerName?.trim();
      const protocol = body.protocol;

      if (!providerName || !protocol) {
        return res.status(400).json({
          error: 'providerName and protocol are required',
        });
      }

      await upsertIdentityProvider(client, {
        orgId,
        userId: user.id,
        providerName,
        protocol,
        status: body.status?.trim() || 'draft',
        domainHint: body.domainHint?.trim() || null,
        issuer: body.issuer?.trim() || null,
      });
    } else if (body.action === 'upsert-domain') {
      const domain = body.domain?.trim().toLowerCase();

      if (!domain) {
        return res.status(400).json({ error: 'domain is required' });
      }

      await upsertDomainVerification(client, {
        orgId,
        userId: user.id,
        domain,
        verificationMethod: body.verificationMethod?.trim() || 'dns',
      });
    } else {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    const config = await loadIdentityAdminConfig(client, orgId);
    return res.status(200).json({
      config,
      role,
      canManage: true,
    });
  } catch (error: any) {
    console.error('[api/identity/admin/config]', error?.message ?? error);
    return res.status(500).json({
      error: error?.message ?? 'Failed to manage enterprise identity config',
    });
  }
}
