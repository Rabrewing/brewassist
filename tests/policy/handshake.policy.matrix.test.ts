import { evaluateHandshake } from '../../lib/toolbelt/handshake';
import { CAPABILITY_REGISTRY } from '../../lib/capabilities/registry';
import { PERSONAS, TIERS, COCKPIT_MODES } from '../fixtures/policyMatrix';

describe('Persona Matrix Integrity', () => {
  const capabilities = Object.values(CAPABILITY_REGISTRY);

  describe.each(PERSONAS)('Persona: $id ($side)', (persona) => {
    describe.each(TIERS)('Tier: %d', (tier) => {
      describe.each(COCKPIT_MODES)('Mode: %s', (cockpitMode) => {
        describe.each(capabilities)('Capability: $capabilityId', (cap) => {
          test(`enforces policy correctly`, () => {
            const policy = evaluateHandshake({
              intent: cap.intentCategory,
              tier,
              persona: { id: persona.id } as any,
              cockpitMode: cockpitMode as any,
              capabilityId: cap.capabilityId,
              action: cap.rwx || 'R',
              confirmApply: true,
              gepHeaderPresent: true,
              truthScore: 0.9,
              truthFlags: [
                'safety_concern',
                'partial_answer',
                'speculative',
                'external_data',
              ],
            });

            // Assert policy structure
            expect(typeof policy.ok).toBe('boolean');
            expect(typeof policy.requiresConfirm).toBe('boolean');
            expect(typeof policy.requiresSandbox).toBe('boolean');
            expect(policy.route).toMatch(/brewassist|blocked|wizard/);
            expect(policy.tier).toBe(tier);

            if (!policy.ok) {
              expect(policy.reason).toBeDefined();
              expect(typeof policy.reason).toBe('string');
            }
          });
        });
      });
    });
  });
});
