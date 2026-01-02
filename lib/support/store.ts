import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SupportTrace } from './types';
import { TriagedSupportTrace, TriageResult } from './triage';

const SUPPORT_DIR = 'support-intel';

export function storeSupportTrace(
  trace: SupportTrace,
  category: 'daily' | 'unresolved' | 'candidates' | 'deferred'
): void {
  mkdirSync(SUPPORT_DIR, { recursive: true });
  const filePath = join(SUPPORT_DIR, `${category}.log`);
  const entry = JSON.stringify(trace) + '\n';
  appendFileSync(filePath, entry);
}

export function storeTriagedSupportTrace(
  triagedTrace: TriagedSupportTrace
): void {
  const category = mapTriageToCategory(triagedTrace.triageResult);
  storeSupportTrace(triagedTrace, category);
}

function mapTriageToCategory(
  result: TriageResult
): 'daily' | 'unresolved' | 'candidates' | 'deferred' {
  switch (result) {
    case 'DAILY_RESOLVABLE':
      return 'daily';
    case 'SANDBOX_MAINTENANCE_CANDIDATE':
      return 'candidates';
    case 'PHASE_RELEASE_CANDIDATE':
      return 'deferred';
    case 'RISK_BLOCKER':
      return 'unresolved';
  }
}
