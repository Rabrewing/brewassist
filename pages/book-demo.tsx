import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function BookDemoPage() {
  return (
    <>
      <Head>
        <title>Book Demo | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath=""
        kicker="Enterprise Demo"
        title="Book a BrewAssist walkthrough for hosted control-plane and local runtime alignment."
        lede="Demo requests should focus on repo/provider context, sandbox-first execution, replay, billing visibility, trust surfaces, and the Brew Agentic local companion."
        primaryCta={{ href: 'mailto:hello@brewassist.app', label: 'Email BrewAssist' }}
        secondaryCta={{ href: '/pricing', label: 'Review Pricing' }}
        sections={[
          {
            title: 'Hosted Console',
            body: 'Overview, command center, billing, providers, and trust center flow in one account surface.',
          },
          {
            title: 'Brew Agentic',
            body: 'Local runtime connection and console alignment are part of the demo path, not an afterthought.',
          },
          {
            title: 'Enterprise Concerns',
            body: 'Workspace scoping, governance, entitlements, and visibility stay central to the walkthrough.',
          },
          {
            title: 'Current State',
            body: 'The demo should normalize public copy to the real product state rather than overselling unfinished paths.',
          },
        ]}
      />
    </>
  );
}
