import { getEnterpriseIdentitySummary } from '../../lib/enterprise/identityReadiness';

const ORIGINAL_ENV = { ...process.env };

describe('enterprise identity readiness', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SUPABASE_SSO_OIDC_ENABLED;
    delete process.env.SUPABASE_SSO_SAML_ENABLED;
    delete process.env.SUPABASE_SCIM_ENABLED;
    delete process.env.SUPABASE_SSO_DOMAIN_VERIFICATION_ENABLED;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('reports missing SSO by default', () => {
    const result = getEnterpriseIdentitySummary('admin');

    expect(result.ssoReady).toBe(false);
    expect(result.scimReady).toBe(false);
    expect(result.capabilities.find((item) => item.key === 'oidc-sso')?.status).toBe(
      'missing'
    );
  });

  it('reports SSO and SCIM when env flags are enabled', () => {
    process.env.SUPABASE_SSO_OIDC_ENABLED = 'true';
    process.env.SUPABASE_SCIM_ENABLED = 'true';
    process.env.SUPABASE_SSO_DOMAIN_VERIFICATION_ENABLED = 'true';

    const result = getEnterpriseIdentitySummary('admin');

    expect(result.ssoReady).toBe(true);
    expect(result.scimReady).toBe(true);
    expect(result.domainVerificationReady).toBe(true);
  });
});
