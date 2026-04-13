'use client';

import React from 'react';

import { PublicLegalDocument } from './PublicLegalDocument';
import {
  PUBLIC_LEGAL_DOCUMENTS,
  type PublicLegalDocumentId,
} from '@/lib/publicLegalContent';

export function PublicLegalModal({
  documentId,
  onClose,
}: {
  documentId: PublicLegalDocumentId | null;
  onClose: () => void;
}) {
  if (!documentId) return null;

  const document = PUBLIC_LEGAL_DOCUMENTS[documentId];

  return (
    <div
      className="public-legal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="public-legal-modal-title"
      onClick={onClose}
    >
      <div
        className="public-legal-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="public-legal-modal-header">
          <h2 id="public-legal-modal-title">{document.title}</h2>
          <button
            type="button"
            className="public-legal-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="public-legal-modal-body">
          <PublicLegalDocument document={document} />
        </div>
      </div>
    </div>
  );
}
