import Head from 'next/head';

import { PublicLegalDocument } from '@/components/PublicLegalDocument';
import { PUBLIC_LEGAL_DOCUMENTS } from '@/lib/publicLegalContent';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>BrewAssist Privacy</title>
      </Head>
      <main>
        <PublicLegalDocument document={PUBLIC_LEGAL_DOCUMENTS.privacy} />
      </main>
    </>
  );
}
