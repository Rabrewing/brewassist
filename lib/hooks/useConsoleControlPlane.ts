import { useEffect, useState } from 'react';

import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

type AccountSessionResponse = {
  account?: {
    accountId: string;
    email: string;
    displayName: string;
    plan: string;
    accountStanding: 'active' | 'inactive';
    ownerMode: boolean;
    orgId: string | null;
    workspaceId: string | null;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    plan?: string;
  } | null;
  workspace?: {
    id: string;
    name: string;
    org_id: string;
  } | null;
};

type WorkspacesResponse = {
  workspaces?: Array<{
    workspaceId: string;
    name: string;
    role: string;
    billingMode: 'byok' | 'brew-managed' | 'hybrid';
    active: boolean;
  }>;
};

type EntitlementsResponse = {
  entitlements?: {
    platformAccess: boolean;
    authSources: Array<'byok' | 'brew-managed'>;
    providers: string[];
    models: Record<string, string[]>;
    intelligenceMeters: {
      agentStep: boolean;
      executionChain: boolean;
      memoryRetention: boolean;
    };
  };
};

type BillingResponse = {
  billing?: {
    plan: string;
    platformFeeUsd: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    managedSpendUsd: number;
    intelligenceSpendUsd: number;
    creditsRemainingUsd: number;
    stripeReady: boolean;
  };
  stripeStatus?: {
    ready: boolean;
    reason: string;
  };
};

type CreditsResponse = {
  credits?: {
    creditsRemainingUsd: number;
    autoRechargeEnabled: boolean;
    billingRail: 'stripe-pending';
    stripeReady: boolean;
  };
};

type ProvidersResponse = {
  managed?: {
    providers: Array<{
      id: string;
      enabled: boolean;
      authModes: Array<'byok' | 'brew-managed'>;
      models: string[];
      source: 'workspace-keys' | 'plan-default';
    }>;
  };
  contract?: {
    rawProviderKeyExposed: false;
    browserGets: string;
    localRuntimeGets: string;
    providerCallPath: string;
    stripeRequiredBeforeProductionBilling: true;
  };
};

type ConsoleControlPlaneState = {
  account: AccountSessionResponse['account'] | null;
  organization: AccountSessionResponse['organization'] | null;
  workspace: AccountSessionResponse['workspace'] | null;
  workspaces: NonNullable<WorkspacesResponse['workspaces']>;
  entitlements: EntitlementsResponse['entitlements'] | null;
  billing: BillingResponse['billing'] | null;
  stripeStatus: BillingResponse['stripeStatus'] | null;
  credits: CreditsResponse['credits'] | null;
  managedProviders: NonNullable<ProvidersResponse['managed']>['providers'];
  providerContract: ProvidersResponse['contract'] | null;
  loading: boolean;
  error: string | null;
};

const DEFAULT_STATE: ConsoleControlPlaneState = {
  account: null,
  organization: null,
  workspace: null,
  workspaces: [],
  entitlements: null,
  billing: null,
  stripeStatus: null,
  credits: null,
  managedProviders: [],
  providerContract: null,
  loading: true,
  error: null,
};

export function useConsoleControlPlane() {
  const { orgId, workspaceId } = useEnterpriseSelection();
  const { session } = useSupabaseAuth();
  const [state, setState] = useState<ConsoleControlPlaneState>(DEFAULT_STATE);

  useEffect(() => {
    const accessToken = session?.access_token;

    if (!accessToken || !orgId) {
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
      return;
    }

    let active = true;

    async function load() {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'x-brewassist-org-id': orgId ?? '',
      };

      if (workspaceId) {
        headers['x-brewassist-workspace-id'] = workspaceId;
      }

      try {
        const responses = await Promise.all([
          fetch('/api/account/session', { headers }),
          fetch('/api/workspaces', { headers }),
          fetch('/api/entitlements/summary', { headers }),
          fetch('/api/billing/summary', { headers }),
          fetch('/api/credits/summary', { headers }),
          fetch('/api/providers/managed-summary', { headers }),
        ]);

        const failed = responses.find((response) => !response.ok);
        if (failed) {
          const body = await failed
            .json()
            .catch(() => ({ error: 'Failed to load control-plane data' }));
          throw new Error(body.error || 'Failed to load control-plane data');
        }

        const [
          accountData,
          workspaceData,
          entitlementsData,
          billingData,
          creditsData,
          providersData,
        ] = (await Promise.all(
          responses.map((response) => response.json())
        )) as [
          AccountSessionResponse,
          WorkspacesResponse,
          EntitlementsResponse,
          BillingResponse,
          CreditsResponse,
          ProvidersResponse,
        ];

        if (!active) return;

        setState({
          account: accountData.account ?? null,
          organization: accountData.organization ?? null,
          workspace: accountData.workspace ?? null,
          workspaces: workspaceData.workspaces ?? [],
          entitlements: entitlementsData.entitlements ?? null,
          billing: billingData.billing ?? null,
          stripeStatus: billingData.stripeStatus ?? null,
          credits: creditsData.credits ?? null,
          managedProviders: providersData.managed?.providers ?? [],
          providerContract: providersData.contract ?? null,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error?.message ?? 'Failed to load hosted control-plane summaries.',
        }));
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [orgId, session, workspaceId]);

  return state;
}
