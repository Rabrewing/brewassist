import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>Support | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath=""
        kicker="Support"
        title="Support entry for product, billing, runtime-link, and onboarding questions."
        lede="The first console scaffold includes support as an IA destination, but public support still starts with docs, email, and guided onboarding help."
        primaryCta={{ href: 'mailto:hello@brewassist.app', label: 'Contact Support' }}
        secondaryCta={{ href: '/docs', label: 'Open Docs' }}
        sections={[
          {
            title: 'Account + Console',
            body: 'Help with login, workspaces, billing, providers, and trust surfaces.',
          },
          {
            title: 'Brew Agentic',
            body: 'Help with runtime linking, workspace alignment, and local-versus-hosted product boundaries.',
          },
          {
            title: 'Onboarding',
            body: 'Help with repo provider authorization and first-run setup.',
          },
          {
            title: 'Current Scope',
            body: 'Support surfaces are scaffolded now and can deepen alongside the console pages.',
          },
        ]}
      />
    </>
  );
}
