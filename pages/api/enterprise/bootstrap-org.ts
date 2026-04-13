import type { NextApiRequest, NextApiResponse } from 'next';
import {
  createSupabaseAdminClient,
  getAuthenticatedUser,
} from '@/lib/supabase/server';
import { bootstrapEnterpriseOrg } from '@/lib/enterprise/bootstrap';

type BootstrapRequestBody = {
  orgName?: string;
  slug?: string;
  workspaceName?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body ?? {}) as BootstrapRequestBody;

  const orgName = body.orgName?.trim();
  const slug = body.slug?.trim();

  if (!orgName || !slug) {
    return res.status(400).json({ error: 'orgName and slug are required' });
  }

  try {
    const client = createSupabaseAdminClient();
    const user = await getAuthenticatedUser(req, res);

    if (!user) {
      return res.status(401).json({ error: 'Sign in required' });
    }

    const result = await bootstrapEnterpriseOrg(client, {
      userId: user.id,
      orgName,
      slug,
      workspaceName: body.workspaceName?.trim() || undefined,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[enterprise/bootstrap-org] failed', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
    });
    return res.status(500).json({
      error: error?.message ?? 'Bootstrap failed',
      detail: error?.detail ?? null,
      hint: error?.hint ?? null,
    });
  }
}
