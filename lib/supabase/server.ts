import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { EnterpriseRole } from '@/lib/enterpriseContext';

const SUPER_ADMIN_EMAIL = 'brewmaster.rb@brewassist.app';

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createSupabaseRouteClient(
  req: Pick<NextApiRequest, 'cookies' | 'headers'>,
  res: Pick<NextApiResponse, 'setHeader' | 'getHeader'>
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(req.cookies)
          .filter(([, value]) => typeof value === 'string' && value.length > 0)
          .map(([name, value]) => ({
            name,
            value: value as string,
          }));
      },
      setAll(cookiesToSet) {
        const existing = res.getHeader('Set-Cookie');
        const nextCookies = Array.isArray(existing)
          ? [...existing]
          : typeof existing === 'string'
            ? [existing]
            : [];

        cookiesToSet.forEach(({ name, value, options }) => {
          const serialized = `${name}=${value}; Path=${options?.path ?? '/'}; HttpOnly; SameSite=Lax`;
          nextCookies.push(serialized);
        });

        if (nextCookies.length > 0) {
          res.setHeader('Set-Cookie', nextCookies);
        }
      },
    },
  });
}

export async function getAuthenticatedUser(
  req: Pick<NextApiRequest, 'cookies' | 'headers'>,
  res: Pick<NextApiResponse, 'setHeader' | 'getHeader'>
) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;

  if (bearerToken) {
    const client = createSupabaseAdminClient();
    const { data, error } = await client.auth.getUser(bearerToken);

    if (error) {
      throw error;
    }

    return data.user ?? null;
  }

  const client = createSupabaseRouteClient(req, res);
  const { data, error } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user ?? null;
}

function normalizeEnterpriseRole(
  value: string | null | undefined
): EnterpriseRole {
  switch (value?.toLowerCase()) {
    case 'owner':
    case 'admin':
      return 'admin';
    case 'operator':
      return 'dev';
    case 'support':
      return 'support';
    default:
      return 'customer';
  }
}

export async function getSupabaseEnterpriseRole(
  req: Pick<NextApiRequest, 'cookies' | 'headers'>,
  res: Pick<NextApiResponse, 'setHeader' | 'getHeader'>,
  orgId?: string
): Promise<EnterpriseRole> {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return 'customer';

  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    return 'admin';
  }

  if (!orgId) return 'customer';

  const client = createSupabaseAdminClient();
  const { data, error } = await client
    .from('memberships')
    .select('role_name, status')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (error || !data) return 'customer';

  return normalizeEnterpriseRole(data.role_name);
}
