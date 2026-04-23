import { getManagedProviderProxyContract } from '../../lib/console/managedProviderProxy';

describe('managed provider proxy contract', () => {
  it('never exposes raw provider keys to clients', () => {
    const contract = getManagedProviderProxyContract();

    expect(contract).toMatchObject({
      mode: 'brew-managed',
      rawProviderKeyExposed: false,
      browserGets: 'brew-session-only',
      localRuntimeGets: 'short-lived-runtime-token',
      providerCallPath: 'server-side-proxy',
      stripeRequiredBeforeProductionBilling: true,
    });
  });
});
