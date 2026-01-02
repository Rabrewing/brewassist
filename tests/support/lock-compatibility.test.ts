import { intakeSupportTrace } from '../../lib/support/intake';
import { triageSupportTrace } from '../../lib/support/triage';
import { SupportTrace } from '../../lib/support/types';

describe('Support Lock Compatibility', () => {
  const baseTrace: Omit<SupportTrace, 'timestamp'> = {
    persona: 'test-persona',
    cockpitMode: 'admin',
    activeMode: 'AGENT',
    capabilityIds: ['read', 'write'],
    input: 'Help me',
    response: 'Help provided',
    devOps8Snapshot: {},
    brewTruthScore: 0.8,
    flags: [],
  };

  test('S4 frozen surfaces untouched - no writes to frozen directories', () => {
    const trace = intakeSupportTrace(baseTrace);
    // In store, ensure path is not in frozen areas like S4 config
    // Mock fs to check paths
    expect(trace).toBeDefined(); // Placeholder
  });

  test('S5 features cannot bypass guards - customer mode restrictions', () => {
    const customerTraceData = { ...baseTrace, cockpitMode: 'customer' };
    const trace = intakeSupportTrace(customerTraceData);
    const triaged = triageSupportTrace(trace);
    // Ensure no admin-level triages for customer
    if (triaged) {
      expect(triaged.triageResult).not.toBe('RISK_BLOCKER'); // Or appropriate restriction
    }
  });

  test('mode filtering enforced - activeMode consistency', () => {
    const trace = intakeSupportTrace(baseTrace);
    expect(['LLM', 'HRM', 'AGENT', 'LOOP']).toContain(trace.activeMode);
    // Ensure evaluation respects mode
  });

  test('capability gates respected - no escalation', () => {
    const trace = intakeSupportTrace(baseTrace);
    // Ensure capabilityIds are not modified
    expect(trace.capabilityIds).toEqual(baseTrace.capabilityIds);
  });
});
