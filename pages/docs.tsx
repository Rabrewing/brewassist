import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function DocsPage() {
  return (
    <>
      <Head>
        <title>Docs | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath="/docs"
        kicker="Docs"
        title="Product docs and implementation guidance for the BrewAssist control plane."
        lede="The current docs set covers hybrid workflow stages, console/domain IA, billing contracts, provider routing direction, and Brew Agentic connector contracts."
        primaryCta={{ href: '/support', label: 'Get Support' }}
        secondaryCta={{ href: '/console/overview', label: 'Open Console' }}
        sections={[
          {
            title: 'Workflow Specs',
            body: 'The hybrid control-plane workflow remains the canonical source for browser execution behavior.',
          },
          {
            title: 'Console Contracts',
            body: 'Mirrored console specs in `brewdocs/console/` now drive the first scaffold in this repo.',
          },
          {
            title: 'Billing + Providers',
            body: 'Pricing, metering, monetization, and managed-vs-BYOK boundaries are documented as platform contracts.',
          },
          {
            title: 'API',
            body: 'Public API documentation is not a separate routed app yet, so `/docs#api` is the temporary public entry point.',
          },
        ]}
      />
    </>
  );
}
