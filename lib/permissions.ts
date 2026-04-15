import path from 'node:path';

import { BREWASSIST_REPO_ROOT } from '@/lib/brewConfig';
import type { EnterpriseRequestContext } from '@/lib/enterpriseContext';

export type PermissionCheck = {
  ok: boolean;
  statusCode?: number;
  reason?: string;
};

export function canUseAdminSurfaces(
  context: EnterpriseRequestContext
): boolean {
  return context.role === 'admin' || context.role === 'dev';
}

export function canWriteFiles(context: EnterpriseRequestContext): boolean {
  return canUseAdminSurfaces(context);
}

export function assertRepoScope(
  context: EnterpriseRequestContext,
  requestedRepoRoot?: string
): PermissionCheck {
  if (!requestedRepoRoot) {
    return { ok: true };
  }

  // If a remote provider is selected (like GitHub), we are in "Sandbox Mode" 
  // and reading from the mirror, so we allow the different repo root.
  if (context.repoProvider && context.repoProvider !== 'local') {
    return { ok: true };
  }

  const requested = path.resolve(requestedRepoRoot);
  const current = path.resolve(BREWASSIST_REPO_ROOT);

  if (requested !== current) {
    return {
      ok: false,
      statusCode: 403,
      reason:
        'Multi-repo local workspace selection is not wired yet; local endpoints are scoped to the active BrewAssist repo.',
    };
  }

  return { ok: true };
}
