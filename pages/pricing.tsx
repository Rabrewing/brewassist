import Head from 'next/head';

import { PublicPricingPage } from '@/components/PublicPricingPage';

export default function PricingPage() {
  return (
    <>
      <Head>
        <title>BrewAssist Pricing</title>
      </Head>
      <PublicPricingPage />
    </>
  );
}
