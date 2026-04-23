import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function SecurityPage() {
  return (
    <>
      <Head>
        <title>Security | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath="/security"
        kicker="Security + Trust"
        title="Trust center direction for hosted account, workspace, and execution visibility."
        lede="Security messaging should stay close to the current implementation reality: Supabase auth, org and workspace scoping, RLS and RBAC direction, policy gates, replay trails, and conservative sandbox defaults."
        imageSrc="/mockups/brewassist-landing.png"
        primaryCta={{ href: '/console/trust-center', label: 'Open Trust Center' }}
        secondaryCta={{ href: '/privacy', label: 'Review Privacy' }}
        sections={[
          {
            title: 'Identity + Access',
            body: 'Supabase session identity and org membership lookup power the current hosted auth path.',
          },
          {
            title: 'Scoped Access',
            body: 'Repo provider and repo root are forwarded through app routes so access stays contextual and fail-closed.',
          },
          {
            title: 'Auditability',
            body: 'Replay, event trails, collab notes, and reporting remain core to review and trust.',
          },
          {
            title: 'Execution Guardrails',
            body: 'Sandbox-first execution and preview/confirm stages remain the intended safe path.',
          },
        ]}
      />
    </>
  );
}
