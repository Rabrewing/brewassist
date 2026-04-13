'use client';

import React, { useState } from 'react';

import { PublicLegalModal } from './PublicLegalModal';
import type { PublicLegalDocumentId } from '@/lib/publicLegalContent';

const LEGAL_LINKS: Array<{ id: PublicLegalDocumentId; label: string }> = [
  { id: 'terms', label: 'Terms' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'accessibility', label: 'Accessibility' },
];

export function PublicLegalLinks() {
  const [activeDocumentId, setActiveDocumentId] =
    useState<PublicLegalDocumentId | null>(null);

  return (
    <>
      <div className="public-landing-meta">
        {LEGAL_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            className="public-legal-link"
            onClick={() => setActiveDocumentId(link.id)}
          >
            {link.label}
          </button>
        ))}
      </div>
      <PublicLegalModal
        documentId={activeDocumentId}
        onClose={() => setActiveDocumentId(null)}
      />
    </>
  );
}
