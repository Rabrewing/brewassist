import Head from 'next/head';

import { PublicLegalDocument } from '@/components/PublicLegalDocument';
import { PUBLIC_LEGAL_DOCUMENTS } from '@/lib/publicLegalContent';

export default function AccessibilityPage() {
  return (
    <>
      <Head>
        <title>BrewAssist Accessibility</title>
      </Head>
      <main>
        <PublicLegalDocument document={PUBLIC_LEGAL_DOCUMENTS.accessibility} />
      </main>
    </>
  );
}
