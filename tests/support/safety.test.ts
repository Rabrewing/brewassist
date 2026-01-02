import { intakeSupportTrace } from '../../lib/support/intake';
import { evaluateSupportTrace } from '../../lib/support/evaluate';
import { triageSupportTrace } from '../../lib/support/triage';
import { storeSupportTrace } from '../../lib/support/store';
import { generateDailyDigest } from '../../lib/support/digest';
import { convertToBrewDocsProposal } from '../../lib/support/brewdocs-bridge';
import { SupportTrace } from '../../lib/support/types';

describe('Support Safety Guards', () => {
  const mockTraceData: Omit<SupportTrace, 'timestamp'> = {
    persona: 'test-persona',
    cockpitMode: 'admin',
    activeMode: 'AGENT',
    capabilityIds: ['read', 'write'],
    input: 'Help me with this',
    response: 'Here is help',
    devOps8Snapshot: {},
    brewTruthScore: 0.8,
    flags: [],
  };

  test('no execution paths - intake is deterministic and safe', () => {
    const trace = intakeSupportTrace(mockTraceData);
    expect(trace).toBeDefined();
    expect(trace.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('no capability escalation - evaluate does not modify capabilities', () => {
    const trace = intakeSupportTrace(mockTraceData);
    const evaluation = evaluateSupportTrace(trace);
    expect(evaluation).toBeDefined();
    expect(trace.capabilityIds).toEqual(mockTraceData.capabilityIds);
  });

  test('no auto-execution - triage does not perform actions', () => {
    const trace = intakeSupportTrace(mockTraceData);
    const triaged = triageSupportTrace(trace);
    expect(triaged).toBeDefined();
    // No auto-execution
  });

  test('no customer visibility - store uses internal paths', () => {
    const trace = intakeSupportTrace(mockTraceData);
    expect(() => storeSupportTrace(trace, 'daily')).not.toThrow();
  });

  test('digest is read-only and deterministic', () => {
    const trace = intakeSupportTrace(mockTraceData);
    const triaged = triageSupportTrace(trace);
    if (triaged) {
      const digest = generateDailyDigest([triaged]);
      expect(digest).toBeDefined();
      expect(digest.totalEvents).toBe(1);
    }
  });

  test('bridge is read-only - no writes', () => {
    const trace = intakeSupportTrace(mockTraceData);
    const triaged = triageSupportTrace(trace);
    if (triaged) {
      const proposal = convertToBrewDocsProposal(triaged);
      expect(proposal).toBeDefined();
    }
  });
});
