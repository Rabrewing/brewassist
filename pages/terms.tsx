import Head from 'next/head';

import { PublicLegalDocument } from '@/components/PublicLegalDocument';
import { PUBLIC_LEGAL_DOCUMENTS } from '@/lib/publicLegalContent';

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>BrewAssist Terms</title>
      </Head>
      <main>
        <PublicLegalDocument document={PUBLIC_LEGAL_DOCUMENTS.terms} />
      </main>
    </>
  );
}
