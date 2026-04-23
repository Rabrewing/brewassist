import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function AiTransparencyPage() {
  return (
    <>
      <Head>
        <title>AI Transparency | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath=""
        kicker="AI Transparency"
        title="Public disclosure for model usage, provider routing, and workflow control."
        lede="BrewAssist should describe what the product actually is: a governed control plane coordinating hosted and local AI-assisted work rather than a generic black-box chatbot."
        sections={[
          {
            title: 'Hosted vs Local',
            body: 'BrewAssist web is hosted. Brew Agentic is local. The product boundary should stay visible in all public and console surfaces.',
          },
          {
            title: 'Managed vs BYOK',
            body: 'BYOK changes who pays the provider bill. It does not eliminate platform fees or hosted account responsibilities.',
          },
          {
            title: 'Workflow Staging',
            body: 'Intent, planning, preview, confirm, execute, report, and replay remain the current control model.',
          },
          {
            title: 'Visibility',
            body: 'Usage, billing, provider access, and runtime registration belong in the hosted console so they can be reviewed centrally.',
          },
        ]}
      />
    </>
  );
}
