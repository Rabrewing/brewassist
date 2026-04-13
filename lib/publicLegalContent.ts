export type PublicLegalDocumentId =
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'accessibility';

export type PublicLegalDocument = {
  id: PublicLegalDocumentId;
  title: string;
  sections: Array<{
    heading?: string;
    paragraphs: string[];
  }>;
};

export const PUBLIC_LEGAL_DOCUMENTS: Record<
  PublicLegalDocumentId,
  PublicLegalDocument
> = {
  terms: {
    id: 'terms',
    title: 'Terms',
    sections: [
      {
        paragraphs: [
          'BrewAssist is a paid control plane with team and enterprise features.',
          'Use of the app is subject to access control, audit logging, and sandboxed workflows.',
        ],
      },
      {
        heading: 'AI Usage',
        paragraphs: [
          'AI-generated output may be incomplete or incorrect and must be reviewed by a human before execution or release. BrewAssist may record prompts, generated outputs, and workflow metadata to support safety, replay, and audit.',
          'Customers are responsible for the inputs they submit, the actions they approve, and compliance with their own policies and laws.',
        ],
      },
      {
        heading: 'Data Collection',
        paragraphs: [
          'BrewAssist may collect account identifiers, org/workspace membership, prompt and response metadata, run events, audit events, and preference settings to provide the service, support replay, and maintain safety.',
          'Contact: info@brewassist.app',
        ],
      },
    ],
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy',
    sections: [
      {
        paragraphs: [
          'BrewAssist uses essential cookies for auth, preferences, and session continuity.',
          'Enterprise deployments are expected to use Supabase-backed auth, org membership, and RLS-protected data flows.',
        ],
      },
      {
        heading: 'Data We Collect',
        paragraphs: [
          'We collect essential authentication data, preferences, org/workspace membership, prompt and response metadata, and operational audit events.',
          'We do not intend to use your private workspace data for advertising. Retention and export controls will be documented for enterprise tenants.',
          'Contact: info@brewassist.app',
        ],
      },
    ],
  },
  cookies: {
    id: 'cookies',
    title: 'Cookies',
    sections: [
      {
        paragraphs: [
          'BrewAssist uses essential cookies for login, session continuity, preferences, and consent storage.',
          'We currently keep consent state locally and will extend this policy as enterprise analytics or tracking features are introduced.',
        ],
      },
    ],
  },
  accessibility: {
    id: 'accessibility',
    title: 'Accessibility',
    sections: [
      {
        paragraphs: [
          'BrewAssist aims for keyboard-first operation, visible focus states, semantic structure, and screen-reader friendly controls.',
          'We will prioritize WCAG 2.1 AA-friendly patterns for the public landing page, auth flow, and cockpit surfaces.',
        ],
      },
    ],
  },
};
