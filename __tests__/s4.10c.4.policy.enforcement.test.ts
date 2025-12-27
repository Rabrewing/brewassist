import { evaluateHandshake } from '../lib/toolbelt/handshake';
import { CAPABILITY_REGISTRY } from '../lib/capabilities/registry';
import { BrewTier } from '../lib/commands/types';
import { Persona } from '../lib/brewIdentityEngine';

describe('S4.10c.4 Policy Enforcement Tests', () => {
  const adminPersona: Persona = 'admin';
  const customerPersona: Persona = 'customer';
  const basicTier: BrewTier = 'basic';
  const proTier: BrewTier = 'pro';

  // Test 1: Command policy denies customer /patch
  test('Customer should be blocked from using /patch command (new test)', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/patch'].intentCategory,
      tier: basicTier,
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: '/patch',
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain("Persona 'customer' not allowed for '/patch'");
  });

  // Test 2: Command policy allows customer /doc
  test('Customer should be allowed to use /doc command (new test)', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/doc'].intentCategory,
      tier: basicTier,
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: '/doc',
      truthScore: 0.5, // Required for BrewTruth (light)
    });

    expect(policy.ok).toBe(true);
    expect(policy.route).toBe('brewassist');
    expect(policy.reason).toContain('Capability check passed.');
  });

  // Test 3: MCP policy blocks fs_write without confirmation + GEP
  test('fs_write should be blocked without confirmation and GEP header', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['fs_write'].intentCategory,
      tier: proTier,
      persona: adminPersona,
      cockpitMode: 'admin',
      capabilityId: 'fs_write',
      action: 'W',
      confirmApply: false, // Missing confirmation
      gepHeaderPresent: false, // Missing GEP header
      truthScore: 0.9, // Satisfy BrewTruth
      truthFlags: ['safety_concern'], // Satisfy BrewTruth
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('TOOLBELT_CONFIRM_REQUIRED'); // Should fail on confirmation first
    expect(policy.requiresConfirm).toBe(true);
  });

  // Test 4: MCP policy allows fs_read tier 1
  test('fs_read should be allowed for customer with basic tier (new test)', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['fs_read'].intentCategory,
      tier: basicTier,
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: 'fs_read',
      action: 'R',
    });

    expect(policy.ok).toBe(true);
    expect(policy.route).toBe('brewassist');
    expect(policy.reason).toContain('Capability check passed.');
  });

  // Test 5: Customer mode blocks Tier2/3 by default unless explicitly allowed (fs_write is Tier 2, not allowed for customer)
  test('Customer should be blocked from fs_write due to persona and tier', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['fs_write'].intentCategory,
      tier: basicTier, // Customer tier
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: 'fs_write',
      action: 'W',
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain("Persona 'customer' not allowed for 'fs_write'");
  });

  // Test 6: Tier 2 capability blocked for basic tier (patch is Tier 2)
  test('Basic tier user should be blocked from /patch command due to tier', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/patch'].intentCategory,
      tier: basicTier,
      persona: adminPersona, // Admin persona
      cockpitMode: 'admin',
      capabilityId: '/patch',
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('TOOLBELT_TIER_TOO_LOW');
  });
});
