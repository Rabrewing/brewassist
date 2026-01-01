import { evaluateHandshake } from '../../lib/toolbelt/handshake';
import {
  CAPABILITIES,
  PERSONAS,
  TIERS,
  COCKPIT_MODES,
} from '../fixtures/policyMatrix';

describe('Handshake Policy Logic', () => {
  describe.each(CAPABILITIES)('Capability: $capabilityId', (cap) => {
    describe.each(PERSONAS)('Persona: $id ($side)', (persona) => {
      describe.each(TIERS)('Tier: %d', (tier: number) => {
        describe.each(COCKPIT_MODES)('Cockpit Mode: %s', (cockpitMode) => {
          it(`should evaluate policy for ${cap.capabilityId} at tier ${tier} as ${persona.id} in ${cockpitMode} mode`, () => {
            const policy = evaluateHandshake({
              intent: cap.intentCategory,
              tier,
              persona: { id: persona.id } as any,
              cockpitMode: cockpitMode as any,
              capabilityId: cap.capabilityId,
              action: cap.actions[0] as any,
              confirmApply: true, // Assume confirmation provided
              gepHeaderPresent: true, // Assume GEP header present
              truthScore: 0.9, // Assume high confidence
              truthFlags: [
                'safety_concern',
                'partial_answer',
                'speculative',
                'external_data',
              ], // Assume all flags present
            });

            // Basic assertions for valid policy envelope
            expect(typeof policy.ok).toBe('boolean');
            if (policy.requiresConfirm !== undefined) {
              expect(typeof policy.requiresConfirm).toBe('boolean');
            }
            if (policy.requiresSandbox !== undefined) {
              expect(typeof policy.requiresSandbox).toBe('boolean');
            }
            expect(policy.route).toMatch(/brewassist|blocked|wizard/);

            if (!policy.ok) {
              expect(policy.reason).toBeDefined();
              expect(typeof policy.reason).toBe('string');
              expect((policy.reason as string).length).toBeGreaterThan(0);
            }
          });
        });
      });
    });
  });
});
