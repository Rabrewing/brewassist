import Head from 'next/head';

import { PublicBrewAgenticPage } from '@/components/PublicBrewAgenticPage';

export default function BrewAgenticPage() {
  return (
    <>
      <Head>
        <title>Brew Agentic | BrewAssist</title>
      </Head>
      <PublicBrewAgenticPage />
    </>
  );
}
