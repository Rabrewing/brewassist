import {
  buildBillingSummary,
  buildEntitlementSummary,
  buildManagedProviderSummary,
} from '../../lib/console/controlPlane';

function createClientStub(overrides?: {
  memberships?: any[];
  workspaces?: any[];
  providerKeys?: any[];
  usage?: any[];
}) {
  const state = {
    table: '',
    filters: [] as Array<{ key: string; value: string }>,
  };

  const memberships = overrides?.memberships ?? [
    {
      org_id: 'org-1',
      role_name: 'owner',
      status: 'active',
      organizations: {
        id: 'org-1',
        name: 'Acme',
        slug: 'acme',
        plan: 'pro',
      },
    },
  ];
  const workspaces = overrides?.workspaces ?? [
    { id: 'ws-1', org_id: 'org-1', name: 'Default Workspace' },
  ];
  const providerKeys = overrides?.providerKeys ?? [
    { provider: 'openai', status: 'active' },
  ];
  const usage = overrides?.usage ?? [
    { metric_name: 'managed_spend_usd', metric_value: 18.42 },
    { metric_name: 'intelligence_spend_usd', metric_value: 7.15 },
    { metric_name: 'credit_balance_usd', metric_value: 46.18 },
  ];

  return {
    from(table: string) {
      state.table = table;
      state.filters = [];
      return this;
    },
    select() {
      return this;
    },
    eq(key: string, value: string) {
      state.filters.push({ key, value });
      return this;
    },
    order() {
      if (state.table === 'workspaces') {
        return Promise.resolve({ data: workspaces, error: null });
      }
      return Promise.resolve({ data: [], error: null });
    },
    then(resolve: any) {
      let data: any[] = [];
      if (state.table === 'memberships') data = memberships;
      if (state.table === 'provider_keys') data = providerKeys;
      if (state.table === 'usage_meter_records') data = usage;

      return Promise.resolve(resolve({ data, error: null }));
    },
  } as any;
}

const mockUser = {
  id: 'user-1',
  email: 'owner@brewassist.app',
  user_metadata: { full_name: 'Brew Owner' },
} as any;

describe('console control-plane builders', () => {
  it('builds entitlement summary from plan defaults and workspace keys', async () => {
    const client = createClientStub();

    const result = await buildEntitlementSummary(client, mockUser, 'org-1');

    expect(result.platformAccess).toBe(true);
    expect(result.authSources).toEqual(['byok', 'brew-managed']);
    expect(result.providers).toEqual(
      expect.arrayContaining(['openai', 'anthropic', 'gemini'])
    );
  });

  it('builds billing summary from usage meter records', async () => {
    const client = createClientStub();

    const result = await buildBillingSummary(client, mockUser, 'org-1');

    expect(result.plan).toBe('pro');
    expect(result.managedSpendUsd).toBe(18.42);
    expect(result.intelligenceSpendUsd).toBe(7.15);
    expect(result.creditsRemainingUsd).toBe(46.18);
    expect(result.stripeReady).toBe(false);
  });

  it('builds managed provider summary with mixed auth modes', async () => {
    const client = createClientStub();

    const result = await buildManagedProviderSummary(client, mockUser, 'org-1');
    const openai = result.providers.find((item) => item.id === 'openai');

    expect(openai).toMatchObject({
      enabled: true,
      authModes: ['byok', 'brew-managed'],
      source: 'workspace-keys',
    });
  });
});
