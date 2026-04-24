import type { SupabaseClient } from '@supabase/supabase-js';

export type OrgIdentityProviderRecord = {
  id: string;
  org_id: string;
  provider_name: string;
  protocol: string;
  status: string;
  domain_hint: string | null;
  issuer: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type DomainVerificationRecord = {
  id: string;
  org_id: string;
  domain: string;
  verification_method: string;
  verification_token: string;
  status: string;
  verified_at: string | null;
  created_at: string;
};

export type IdentityAdminConfig = {
  migrationReady: boolean;
  providers: OrgIdentityProviderRecord[];
  domains: DomainVerificationRecord[];
  warnings: string[];
};

function isMissingRelationError(error: { code?: string } | null | undefined) {
  return error?.code === '42P01';
}

export async function loadIdentityAdminConfig(
  client: SupabaseClient,
  orgId: string
): Promise<IdentityAdminConfig> {
  const { data: providers, error: providerError } = await client
    .from('org_identity_providers')
    .select(
      'id, org_id, provider_name, protocol, status, domain_hint, issuer, metadata, created_at'
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (providerError) {
    if (isMissingRelationError(providerError)) {
      return {
        migrationReady: false,
        providers: [],
        domains: [],
        warnings: [
          'Enterprise identity tables are not available yet. Apply the latest Supabase migration before configuring SSO.',
        ],
      };
    }
    throw providerError;
  }

  const { data: domains, error: domainError } = await client
    .from('domain_verifications')
    .select(
      'id, org_id, domain, verification_method, verification_token, status, verified_at, created_at'
    )
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (domainError) {
    if (isMissingRelationError(domainError)) {
      return {
        migrationReady: false,
        providers: (providers ?? []) as OrgIdentityProviderRecord[],
        domains: [],
        warnings: [
          'Domain verification tables are not available yet. Apply the latest Supabase migration before configuring SSO.',
        ],
      };
    }
    throw domainError;
  }

  return {
    migrationReady: true,
    providers: (providers ?? []) as OrgIdentityProviderRecord[],
    domains: (domains ?? []) as DomainVerificationRecord[],
    warnings: [],
  };
}

export async function upsertIdentityProvider(
  client: SupabaseClient,
  input: {
    orgId: string;
    userId: string;
    providerName: string;
    protocol: 'oidc' | 'saml';
    status?: string;
    domainHint?: string | null;
    issuer?: string | null;
  }
) {
  const { error } = await client.from('org_identity_providers').upsert(
    {
      org_id: input.orgId,
      provider_name: input.providerName,
      protocol: input.protocol,
      status: input.status ?? 'draft',
      domain_hint: input.domainHint ?? null,
      issuer: input.issuer ?? null,
      created_by: input.userId,
    },
    {
      onConflict: 'org_id,provider_name,protocol',
    }
  );

  if (error) throw error;
}

export async function upsertDomainVerification(
  client: SupabaseClient,
  input: {
    orgId: string;
    userId: string;
    domain: string;
    verificationMethod?: string;
    status?: string;
  }
) {
  const verificationToken = `brewassist-verify-${crypto.randomUUID().slice(0, 8)}`;
  const { error } = await client.from('domain_verifications').upsert(
    {
      org_id: input.orgId,
      domain: input.domain,
      verification_method: input.verificationMethod ?? 'dns',
      verification_token: verificationToken,
      status: input.status ?? 'pending',
      created_by: input.userId,
    },
    {
      onConflict: 'org_id,domain',
    }
  );

  if (error) throw error;
}
