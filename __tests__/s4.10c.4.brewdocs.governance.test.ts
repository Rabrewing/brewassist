import { jest } from '@jest/globals';
import { CAPABILITY_REGISTRY } from '../lib/capabilities/registry';
import { BrewTier } from '../../lib/commands/types';
import { Persona } from '../lib/brewIdentityEngine'; // Keep Persona for type

jest.doMock('../lib/brewIdentityEngine', () => ({
  ...jest.requireActual('../lib/brewIdentityEngine'),
  getActivePersona: jest.fn(() => {
    const persona = {
      id: 'customer',
      label: 'Mock Customer User',
      tone: 'Helpful',
      emotionTier: 1,
      safetyMode: 'soft-stop',
      memoryWindow: 1,
      systemPrompt: 'Mock customer persona',
    };
    return persona;
  }),
  setActivePersona: jest.fn(),
}));

describe('S4.10c.4 - BrewDocs Governance Capability (Tier-1)', () => {
  const { evaluateHandshake } = require('../lib/toolbelt/handshake');
  const { getActivePersona } = require('../lib/brewIdentityEngine');

  // Test Case 1: BrewDocs capabilities exist in the registry and are Tier 1, read-only.
  it('should have brewdocs.inspect, brewdocs.read, brewdocs.index capabilities defined as Tier 1, read-only', () => {
    const inspectCap = CAPABILITY_REGISTRY['brewdocs.inspect'];
    const readCap = CAPABILITY_REGISTRY['brewdocs.read'];
    const indexCap = CAPABILITY_REGISTRY['brewdocs.index'];

    expect(inspectCap).toBeDefined();
    expect(readCap).toBeDefined();
    expect(indexCap).toBeDefined();

    // Verify tierRequired
    expect(inspectCap.tierRequired).toBe(1);
    expect(readCap.tierRequired).toBe(1);
    expect(indexCap.tierRequired).toBe(1);

    // Verify rwx is "R"
    expect(inspectCap.rwx).toBe('R');
    expect(readCap.rwx).toBe('R');
    expect(indexCap.rwx).toBe('R');

    // Verify confirmApplyRequired and sandboxRequired are false
    expect(inspectCap.confirmApplyRequired).toBe(false);
    expect(inspectCap.sandboxRequired).toBe(false);
    expect(readCap.confirmApplyRequired).toBe(false);
    expect(readCap.sandboxRequired).toBe(false);
    expect(indexCap.confirmApplyRequired).toBe(false);
    expect(indexCap.sandboxRequired).toBe(false);

    // Verify personaAllowed includes customer
    expect(inspectCap.personaAllowed).toContain('customer');
    expect(readCap.personaAllowed).toContain('customer');
    expect(indexCap.personaAllowed).toContain('customer');

    // Verify category and intentCategory
    expect(inspectCap.category).toBe('docs');
    expect(inspectCap.intentCategory).toBe('DOCS_KB');
  });

  // Test Case 2: evaluateHandshake for brewdocs.read in customer mode.
  it('should allow brewdocs.read for a customer in Tier 1', () => {
    const argsForHandshake = {
      intent: CAPABILITY_REGISTRY['brewdocs.read'].intentCategory,
      tier: 1 as BrewTier,
      persona: getActivePersona(),
      cockpitMode: 'customer', // Assuming 'customer' mode for customer persona
      capabilityId: 'brewdocs.read' as string,
      action: 'R',
    };
    const policyEnvelope = evaluateHandshake(argsForHandshake);

    expect(policyEnvelope.ok).toBe(true);
    expect(policyEnvelope.reason).toBe('Capability check passed.');
  });

  // Test Case 3: evaluateHandshake for a hypothetical brewdocs.write (Tier 2) in customer mode.
  it('should block a hypothetical brewdocs.write for a customer in Tier 1', () => {
    // Temporarily add a mock brewdocs.write capability for testing purposes
    const mockWriteCapability = {
      capabilityId: 'brewdocs.write',
      category: 'docs',
      surfaces: ['command', 'assistant_auto'],
      tierRequired: 2, // Tier 2, so customer (Tier 1) should be blocked
      personaAllowed: ['admin', 'dev'], // Customer not allowed
      intentCategory: 'DOCS_KB',
      confirmApplyRequired: true,
      sandboxRequired: true,
      gepRequired: true,
      auditLevel: 'full',
      brewTruthExpectations: { policyType: 'Yes (strict)' },
      rwx: 'W',
    };
    CAPABILITY_REGISTRY['brewdocs.write'] = mockWriteCapability;

    const argsForHandshake = {
      intent: mockWriteCapability.intentCategory,
      tier: 1 as BrewTier,
      persona: getActivePersona(),
      cockpitMode: 'customer',
      capabilityId: 'brewdocs.write' as string,
      action: 'W',
    };
    const policyEnvelope = evaluateHandshake(argsForHandshake);

    expect(policyEnvelope.ok).toBe(false);
    expect(policyEnvelope.reason).toContain("Persona 'customer' not allowed");

    // Clean up: remove the mock capability
    delete CAPABILITY_REGISTRY['brewdocs.write'];
  });

  // Test Case 4: Verify brewTruthExpectations are 'No' for read-only BrewDocs capabilities.
  it('should have brewTruthExpectations set to "No" for read-only BrewDocs capabilities', () => {
    const inspectCap = CAPABILITY_REGISTRY['brewdocs.inspect'];
    const readCap = CAPABILITY_REGISTRY['brewdocs.read'];
    const indexCap = CAPABILITY_REGISTRY['brewdocs.index'];

    expect(inspectCap.brewTruthExpectations.policyType).toBe('No');
    expect(readCap.brewTruthExpectations.policyType).toBe('No');
    expect(indexCap.brewTruthExpectations.policyType).toBe('No');
  });
});