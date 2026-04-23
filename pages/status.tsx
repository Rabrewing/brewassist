import Head from 'next/head';

import { PublicRouteTemplate } from '@/components/PublicRouteTemplate';

export default function StatusPage() {
  return (
    <>
      <Head>
        <title>Status | BrewAssist</title>
      </Head>
      <PublicRouteTemplate
        activePath=""
        kicker="Status"
        title="Service status and operational visibility route placeholder."
        lede="A full hosted status surface is not implemented yet, but the route exists so the public IA matches the shared page registry and footer model."
        sections={[
          {
            title: 'Hosted Console',
            body: 'Future status should cover login, workspace, console, and runtime-link surfaces.',
          },
          {
            title: 'Provider Connectivity',
            body: 'Future status should distinguish platform status from third-party provider availability.',
          },
          {
            title: 'Billing + Trust',
            body: 'Billing and trust surfaces eventually need status-aware user messaging too.',
          },
          {
            title: 'Current Step',
            body: 'This scaffold is intentionally a route placeholder, not a fake live status dashboard.',
          },
        ]}
      />
    </>
  );
}
