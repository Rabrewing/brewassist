import Head from 'next/head';

import { PublicLegalDocument } from '@/components/PublicLegalDocument';
import { PUBLIC_LEGAL_DOCUMENTS } from '@/lib/publicLegalContent';

export default function CookiesPage() {
  return (
    <>
      <Head>
        <title>BrewAssist Cookies</title>
      </Head>
      <main>
        <PublicLegalDocument document={PUBLIC_LEGAL_DOCUMENTS.cookies} />
      </main>
    </>
  );
}
