// lib/devops8/adapters/scope.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface ScopeContext {
  definedScopeItems?: number;
  executedItems?: number;
  scopeCreepIncidents?: number;
  boundaryViolations?: number;
}

export function computeScopeContainment(
  context: ScopeContext = {}
): DevOpsSignal {
  const {
    definedScopeItems = 1,
    executedItems = 0,
    scopeCreepIncidents = 0,
    boundaryViolations = 0,
  } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Work is staying within defined boundaries.';

  const scopeAdherence =
    definedScopeItems > 0 ? executedItems / definedScopeItems : 1;
  value = Math.round(scopeAdherence * 100);

  if (boundaryViolations > 0) {
    status = 'stalled';
    value = Math.max(0, value - 40);
    confidence = 0.8;
    notes = `${boundaryViolations} boundary violations detected.`;
  } else if (scopeCreepIncidents > 0) {
    status = 'degraded';
    value = Math.max(0, value - 20);
    confidence = 0.7;
    notes = `${scopeCreepIncidents} scope creep incidents.`;
  } else if (scopeAdherence < 0.8) {
    status = 'degraded';
    confidence = 0.6;
    notes = `Scope adherence at ${Math.round(scopeAdherence * 100)}%.`;
  }

  return createNormalizedSignal(
    'scope_containment',
    DEVOPS_SIGNAL_DEFINITIONS.scope_containment.label,
    status,
    value,
    'execution_planner',
    confidence,
    notes,
    {
      definedScopeItems,
      executedItems,
      scopeCreepIncidents,
      boundaryViolations,
    }
  );
}
