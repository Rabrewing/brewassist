import React from 'react';

import type { PublicLegalDocument as PublicLegalDocumentType } from '@/lib/publicLegalContent';

export function PublicLegalDocument({
  document,
}: {
  document: PublicLegalDocumentType;
}) {
  return (
    <div className="legal-page public-legal-document">
      <h1>{document.title}</h1>
      {document.sections.map((section, index) => (
        <section
          key={`${document.id}-${index}`}
          className="public-legal-section"
        >
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={`${document.id}-${index}-${paragraphIndex}`}>{paragraph}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
