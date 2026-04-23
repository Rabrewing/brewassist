import Head from 'next/head';

import { PublicSiteLayout } from '@/components/PublicSiteLayout';
import { PublicAuthPanel } from '@/components/PublicAuthPanel';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Login | BrewAssist</title>
      </Head>
      <PublicSiteLayout>
        <section className="public-site-panel public-site-panel--hero">
          <div className="public-site-hero-grid">
            <div className="public-site-copy">
              <div className="public-landing-kicker">Login</div>
              <h1 className="public-site-title">
                Sign into BrewAssist and continue into the console.
              </h1>
              <p className="public-site-lede">
                Hosted account identity, workspaces, billing, and runtime links
                belong to the BrewAssist control plane.
              </p>
            </div>
            <div className="public-site-hero-art">
              <PublicAuthPanel />
            </div>
          </div>
        </section>
      </PublicSiteLayout>
    </>
  );
}
