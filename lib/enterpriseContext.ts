import type { NextApiRequest } from 'next';
import type { CockpitMode } from '@/lib/brewTypes';

export type EnterpriseRole = 'admin' | 'dev' | 'support' | 'customer';
export type RepoProvider = 'github' | 'gitlab' | 'bitbucket' | 'local';

export interface EnterpriseRequestContext {
  tenantId?: string;
  orgId?: string;
  workspaceId?: string;
  userId?: string;
  projectId?: string;
  repoId?: string;
  repoRoot?: string;
  repoProvider?: RepoProvider;
  role: EnterpriseRole;
  cockpitMode: CockpitMode;
}

function firstHeaderValue(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeRepoProvider(
  value: string | undefined
): RepoProvider | undefined {
  switch (value?.toLowerCase()) {
    case 'github':
    case 'gitlab':
    case 'bitbucket':
    case 'local':
      return value.toLowerCase() as RepoProvider;
    default:
      return undefined;
  }
}

function normalizeCockpitMode(value: string | undefined): CockpitMode {
  return value?.toLowerCase() === 'admin' ? 'admin' : 'customer';
}

export function parseEnterpriseContext(
  req: Pick<NextApiRequest, 'headers' | 'body' | 'query'>
): EnterpriseRequestContext {
  const body = (req.body ?? {}) as Record<string, unknown>;

  const cockpitMode = normalizeCockpitMode(
    firstHeaderValue(req.headers['x-brewassist-mode'])
  );

  const repoRoot =
    firstHeaderValue(req.headers['x-brewassist-repo-root']) ??
    (typeof body.repoRoot === 'string' ? body.repoRoot : undefined) ??
    (typeof req.query.repoRoot === 'string' ? req.query.repoRoot : undefined);

  const repoProvider = normalizeRepoProvider(
    firstHeaderValue(req.headers['x-brewassist-repo-provider']) ??
      (typeof body.repoProvider === 'string' ? body.repoProvider : undefined)
  );

  return {
    tenantId:
      firstHeaderValue(req.headers['x-brewassist-tenant-id']) ??
      (typeof body.tenantId === 'string' ? body.tenantId : undefined),
    orgId:
      firstHeaderValue(req.headers['x-brewassist-org-id']) ??
      (typeof body.orgId === 'string' ? body.orgId : undefined),
    workspaceId:
      firstHeaderValue(req.headers['x-brewassist-workspace-id']) ??
      (typeof body.workspaceId === 'string' ? body.workspaceId : undefined),
    projectId:
      firstHeaderValue(req.headers['x-brewassist-project-id']) ??
      (typeof body.projectId === 'string' ? body.projectId : undefined),
    repoId:
      firstHeaderValue(req.headers['x-brewassist-repo-id']) ??
      (typeof body.repoId === 'string' ? body.repoId : undefined),
    repoRoot,
    repoProvider,
    role: 'customer',
    cockpitMode,
  };
}
