import {
  buildBillingSummary,
  buildEntitlementSummary,
  buildManagedProviderSummary,
  buildSessionRestoreSummary,
} from '../../lib/console/controlPlane';

function createClientStub(overrides?: {
  memberships?: any[];
  workspaces?: any[];
  providerKeys?: any[];
  usage?: any[];
  sessions?: any[];
  runs?: any[];
}) {
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
    {
      metric_name: 'provider_call_openai_hosted_managed',
      metric_value: 1,
      created_at: '2026-04-29T00:00:00.000Z',
      usage_lane: 'reviewer',
    },
    {
      metric_name: 'provider_chars_openai_hosted_managed',
      metric_value: 128,
      created_at: '2026-04-29T00:00:00.000Z',
      usage_lane: 'reviewer',
    },
  ];
  const sessions = overrides?.sessions ?? [
    {
      id: 'session-1',
      workspace_id: 'ws-1',
      current_stage: 'report',
      last_seen_at: '2026-04-30T12:00:00.000Z',
    },
  ];
  const runs = overrides?.runs ?? [
    {
      id: 'run-1',
      session_id: 'session-1',
      status: 'complete',
      closeout_status: 'approved',
      created_at: '2026-04-30T12:05:00.000Z',
    },
  ];

  const buildResponse = (table: string) => {
    let data: any[] = [];
    if (table === 'memberships') data = memberships;
    if (table === 'provider_keys') data = providerKeys;
    if (table === 'usage_meter_records') data = usage;
    if (table === 'workspaces') data = workspaces;
    if (table === 'billing_event_ledger') data = [];
    if (table === 'sessions') data = sessions;
    if (table === 'runs') data = runs;
    if (table === 'billing_subscriptions') data = [];
    if (table === 'billing_customers') data = [];
    return { data, error: null };
  };

  return {
    from(table: string) {
      const chain: any = {
        select() {
          return chain;
        },
        eq() {
          return chain;
        },
        in() {
          return chain;
        },
        order() {
          return chain;
        },
        limit() {
          return chain;
        },
        maybeSingle() {
          const response = buildResponse(table);
          const row = Array.isArray(response.data) ? response.data[0] ?? null : response.data;
          return Promise.resolve({ data: row, error: null });
        },
        then(resolve: any) {
          return Promise.resolve(resolve(buildResponse(table)));
        },
      };
      return chain;
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
      expect.arrayContaining(['openai', 'gemini', 'mistral'])
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
    expect(result.providerUsage.byLane).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lane: 'reviewer',
          callCount: 1,
          charCount: 128,
        }),
      ])
    );
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

  it('builds a session restore summary with the latest run', async () => {
    const client = createClientStub();

    const result = await buildSessionRestoreSummary(
      client,
      mockUser,
      'org-1',
      'session-1'
    );

    expect(result).toMatchObject({
      sessionId: 'session-1',
      workspaceId: 'ws-1',
      currentStage: 'report',
      latestRunId: 'run-1',
      latestRunStatus: 'complete',
      latestCloseoutStatus: 'approved',
      context: {
        latestEventType: null,
        stage: 'report',
      },
    });
  });
});
