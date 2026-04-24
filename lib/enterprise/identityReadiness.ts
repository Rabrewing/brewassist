import type { EnterpriseRole } from '@/lib/enterpriseContext';

export type IdentityCapability = {
  key:
    | 'magic-link'
    | 'oauth-social'
    | 'oidc-sso'
    | 'saml-sso'
    | 'scim'
    | 'domain-verification'
    | 'audit-logs'
    | 'tenant-rbac';
  label: string;
  status: 'live' | 'planned' | 'missing';
  detail: string;
};

export type EnterpriseIdentitySummary = {
  authFoundation: 'supabase-session';
  role: EnterpriseRole;
  modesOffered: string[];
  ssoReady: boolean;
  scimReady: boolean;
  domainVerificationReady: boolean;
  capabilities: IdentityCapability[];
  nextActions: string[];
};

function envOn(key: string) {
  const value = process.env[key]?.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

export function getEnterpriseIdentitySummary(
  role: EnterpriseRole = 'customer'
): EnterpriseIdentitySummary {
  const oidcReady = envOn('SUPABASE_SSO_OIDC_ENABLED');
  const samlReady = envOn('SUPABASE_SSO_SAML_ENABLED');
  const scimReady = envOn('SUPABASE_SCIM_ENABLED');
  const domainVerificationReady = envOn('SUPABASE_SSO_DOMAIN_VERIFICATION_ENABLED');
  const ssoReady = oidcReady || samlReady;

  const capabilities: IdentityCapability[] = [
    {
      key: 'magic-link',
      label: 'Email magic link',
      status: 'live',
      detail: 'Current hosted sign-in foundation through Supabase sessions.',
    },
    {
      key: 'oauth-social',
      label: 'OAuth social sign-in',
      status: 'planned',
      detail:
        'Self-serve Google/GitHub style identity can coexist with enterprise SSO, but is not the enterprise control path.',
    },
    {
      key: 'oidc-sso',
      label: 'OIDC SSO',
      status: oidcReady ? 'live' : 'missing',
      detail: oidcReady
        ? 'OIDC federation is flagged on for enterprise tenants.'
        : 'OIDC still needs provider configuration, domain policy, and tenant routing.',
    },
    {
      key: 'saml-sso',
      label: 'SAML 2.0 SSO',
      status: samlReady ? 'live' : 'missing',
      detail: samlReady
        ? 'SAML federation is flagged on for enterprise tenants.'
        : 'SAML still needs IdP metadata handling, org mapping, and tested sign-in recovery.',
    },
    {
      key: 'scim',
      label: 'SCIM provisioning',
      status: scimReady ? 'live' : 'planned',
      detail: scimReady
        ? 'Provisioning and deprovisioning are enabled at the contract level.'
        : 'SCIM should follow SSO so enterprise customers can automate lifecycle management.',
    },
    {
      key: 'domain-verification',
      label: 'Domain verification',
      status: domainVerificationReady ? 'live' : 'planned',
      detail: domainVerificationReady
        ? 'Domain ownership checks can gate enterprise login and invite policy.'
        : 'Domain verification is still needed for trustworthy org-managed SSO.',
    },
    {
      key: 'audit-logs',
      label: 'Audit logs',
      status: 'live',
      detail: 'Audit log storage exists and should continue expanding toward customer-facing export.',
    },
    {
      key: 'tenant-rbac',
      label: 'Tenant RBAC',
      status: 'live',
      detail: 'Supabase memberships plus RLS are the current enterprise access baseline.',
    },
  ];

  const nextActions = [
    ssoReady
      ? 'Finish tenant-specific SSO setup UX and IdP metadata storage.'
      : 'Choose the first enterprise SSO path and configure Supabase-compatible OIDC or SAML.',
    scimReady
      ? 'Add SCIM admin surfaces, sync logs, and deprovisioning tests.'
      : 'Define SCIM schema and token model after SSO routing is stable.',
    domainVerificationReady
      ? 'Enforce verified-domain policy for enterprise org login.'
      : 'Add verified-domain storage and invite restrictions.',
  ];

  return {
    authFoundation: 'supabase-session',
    role,
    modesOffered: ['email-magic-link', 'org-membership-rbac'],
    ssoReady,
    scimReady,
    domainVerificationReady,
    capabilities,
    nextActions,
  };
}
