export type ManagedProviderProxyContract = {
  mode: 'brew-managed';
  rawProviderKeyExposed: false;
  browserGets: 'brew-session-only';
  localRuntimeGets: 'short-lived-runtime-token';
  providerCallPath: 'server-side-proxy';
  stripeRequiredBeforeProductionBilling: true;
};

export function getManagedProviderProxyContract(): ManagedProviderProxyContract {
  return {
    mode: 'brew-managed',
    rawProviderKeyExposed: false,
    browserGets: 'brew-session-only',
    localRuntimeGets: 'short-lived-runtime-token',
    providerCallPath: 'server-side-proxy',
    stripeRequiredBeforeProductionBilling: true,
  };
}
