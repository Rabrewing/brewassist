import type { EnterpriseRequestContext } from '@/lib/enterpriseContext';

export function shouldShowToolbelt(context: EnterpriseRequestContext): boolean {
  return (
    context.cockpitMode === 'admin' &&
    (context.role === 'admin' || context.role === 'dev')
  );
}

export function shouldShowSandbox(context: EnterpriseRequestContext): boolean {
  return context.cockpitMode === 'admin' && context.role === 'admin';
}

export function shouldShowRepoTree(context: EnterpriseRequestContext): boolean {
  return (
    context.cockpitMode === 'admin' &&
    (context.role === 'admin' || context.role === 'dev')
  );
}

export function shouldShowDiffSurface(
  context: EnterpriseRequestContext
): boolean {
  return context.cockpitMode === 'admin';
}
