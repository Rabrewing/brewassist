import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function FeaturesPage() {
  return (
    <>
      <Head>
        <title>Features | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath="/features"
        kicker="Capabilities"
        title="Feature sets that map to real workflow and console surfaces."
        lede="Public messaging should line up with the shipped control-plane direction: command center workflows, provider context, sandbox-first review, replay, telemetry, collaboration, and trust."
        imageSrc="/mockups/console.png"
        primaryCta={{ href: '/console/command-center', label: 'View Command Center' }}
        secondaryCta={{ href: '/brew-agentic', label: 'See Brew Agentic' }}
        sections={[
          {
            title: 'Command Center',
            body: 'The hosted interaction surface for planning, execution visibility, and staged workflow control.',
          },
          {
            title: 'Providers',
            body: 'Provider and model visibility, managed access, and BYOK policy remain first-class concerns.',
          },
          {
            title: 'Replay + Reporting',
            body: 'Runs, events, notes, and final reports stay reviewable rather than disappearing into transient chat.',
          },
          {
            title: 'Trust + Governance',
            body: 'Billing visibility, security posture, and hosted audit-friendly surfaces remain part of the product story.',
          },
        ]}
      />
    </>
  );
}
