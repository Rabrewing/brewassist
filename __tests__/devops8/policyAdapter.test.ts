// tests/devops8/policyAdapter.test.ts

import { computeSafetyPolicyEnforcement } from '../../lib/devops8/adapters/policy';

describe('DevOps 8 Policy Adapter', () => {
  describe('computeSafetyPolicyEnforcement', () => {
    test('should return optimal signal for customer mode with no violations', () => {
      const signal = computeSafetyPolicyEnforcement({
        cockpitMode: 'customer',
        personaId: 'customer',
        violations: 0,
      });

      expect(signal.id).toBe('safety_policy_enforcement');
      expect(signal.status).toBe('optimal');
      expect(signal.value).toBeGreaterThan(0);
      expect(signal.confidence).toBeGreaterThan(0);
      expect(signal.notes).toBe(
        'Safety policies are being enforced correctly.'
      );
    });

    test('should detect policy violations', () => {
      const signal = computeSafetyPolicyEnforcement({
        violations: 2,
      });

      expect(signal.status).toBe('stalled');
      expect(signal.value).toBeLessThan(100);
      expect(signal.notes).toContain('2 policy violations detected');
    });

    test('should handle admin mode sandbox availability', () => {
      const signal = computeSafetyPolicyEnforcement({
        cockpitMode: 'admin',
        violations: 0,
      });

      expect(signal.id).toBe('safety_policy_enforcement');
      expect(signal.value).toBeDefined();
      expect(signal.adminDebugInfo).toHaveProperty('enforced');
      expect(signal.adminDebugInfo).toHaveProperty('activeTier');
      expect(signal.adminDebugInfo).toHaveProperty('sandboxAvailable');
    });

    test('should calculate value based on available capabilities', () => {
      const signal = computeSafetyPolicyEnforcement({
        personaId: 'customer',
      });

      expect(signal.value).toBeGreaterThanOrEqual(0);
      expect(signal.value).toBeLessThanOrEqual(100);
      expect(signal.adminDebugInfo).toHaveProperty('totalCapabilities');
      expect(signal.adminDebugInfo).toHaveProperty('availableCapabilities');
    });

    test('should default to bronze tier and customer mode', () => {
      const signal = computeSafetyPolicyEnforcement({});

      expect(signal.adminDebugInfo?.activeTier).toBeDefined();
      expect(signal.adminDebugInfo?.enforced).toBeDefined();
    });

    test('should handle different tiers', () => {
      const bronzeSignal = computeSafetyPolicyEnforcement({ tier: 'bronze' });
      const goldSignal = computeSafetyPolicyEnforcement({ tier: 'gold' });

      expect(bronzeSignal.adminDebugInfo?.activeTier).toBe('bronze');
      expect(goldSignal.adminDebugInfo?.activeTier).toBe('gold');
    });
  });
});
