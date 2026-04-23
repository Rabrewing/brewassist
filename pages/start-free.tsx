import Head from 'next/head';

import { PublicSiteLayout } from '@/components/PublicSiteLayout';
import { PublicAuthPanel } from '@/components/PublicAuthPanel';

export default function StartFreePage() {
  return (
    <>
      <Head>
        <title>Start Free | BrewAssist</title>
      </Head>
      <PublicSiteLayout>
        <section className="public-site-panel public-site-panel--hero">
          <div className="public-site-hero-grid">
            <div className="public-site-copy">
              <div className="public-landing-kicker">Start Free</div>
              <h1 className="public-site-title">
                Start with the shared BrewAssist account flow.
              </h1>
              <p className="public-site-lede">
                New users and returning users use the same email magic-link
                entry. From there, workspace bootstrap, provider connect, and
                console access stay in one flow.
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
