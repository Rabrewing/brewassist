'use client';

import React from 'react';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';

export function BillingStatusBadge() {
  const { organizations, orgId } = useEnterpriseSelection();

  const currentOrg = organizations.find((org) => org.id === orgId);
  const plan = currentOrg?.plan ?? 'free';

  const planDisplay =
    plan === 'free'
      ? 'Free'
      : plan === 'pro'
        ? 'Pro'
        : plan === 'enterprise'
          ? 'Enterprise'
          : plan;

  return <span className="billing-status-badge">{planDisplay}</span>;
}
