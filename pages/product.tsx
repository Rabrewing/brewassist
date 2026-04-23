import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function ProductPage() {
  return (
    <>
      <Head>
        <title>Product | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath="/product"
        kicker="Hosted Control Plane"
        title="BrewAssist is the browser control plane for governed DevOps work."
        lede="The hosted surface keeps workflow stages, workspace context, replay, policy gates, reporting, and team visibility in one place. It is not a detached chatbot and it is not a second product beside Brew Agentic."
        imageSrc="/mockups/console.png"
        imageAlt="BrewAssist console mockup"
        primaryCta={{ href: '/console/command-center', label: 'Open Command Center' }}
        secondaryCta={{ href: '/pricing', label: 'View Pricing' }}
        sections={[
          {
            title: 'Workflow Control',
            body: 'The canonical path remains Intent -> Plan -> Preview -> Confirm -> Execute -> Report -> Replay.',
            points: [
              'Shared stage model across browser and local alignment docs',
              'Preview and confirm stay explicit before sensitive changes',
              'Replay history remains part of the product truth',
            ],
          },
          {
            title: 'Workspace Context',
            body: 'The browser product stays grounded in org, workspace, provider, and repo context rather than generic chat threads.',
            points: [
              'Workspace selection stays visible in the hosted header',
              'Provider and repo context flow through the app and API routes',
              'Cross-repo access remains fail-closed until multi-repo support lands',
            ],
          },
          {
            title: 'Governed Execution',
            body: 'Sandbox-first execution, policy checks, and hosted reporting are the product direction for enterprise work.',
            points: [
              'Mirror-first editing path',
              'Policy and truth gates before execution-sensitive actions',
              'Hosted visibility for audits, reporting, and collaboration',
            ],
          },
          {
            title: 'Local Companion',
            body: 'Brew Agentic is the local runtime companion and maps cleanly into the hosted console instead of being buried as a minor feature.',
            points: [
              'Runtime link and connection status belong in the console',
              'Shared account and workspace truth stay hosted',
              'Local execution remains local while console administration remains hosted',
            ],
          },
        ]}
      />
    </>
  );
}
