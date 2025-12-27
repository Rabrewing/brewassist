// __tests__/policy.test.ts
import { evaluateHandshake } from '../lib/toolbelt/handshake';
import { CAPABILITY_REGISTRY } from '../lib/capabilities/registry';
import { BrewTier } from '../lib/commands/types';
import { Persona } from '../lib/brewIdentityEngine'; // Import Persona type

describe('Unified Policy Enforcement (S4.10c.4)', () => {
  const adminPersona: Persona = {
    id: 'admin',
    label: 'Admin User',
    tone: 'Authoritative',
    emotionTier: 3,
    safetyMode: 'full-override',
    memoryWindow: 3,
    systemPrompt: 'Admin persona for testing',
  };
  const customerPersona: Persona = {
    id: 'customer',
    label: 'Customer User',
    tone: 'Helpful',
    emotionTier: 1,
    safetyMode: 'soft-stop',
    memoryWindow: 1,
    systemPrompt: 'Customer persona for testing',
  };
  const devPersona: Persona = {
    id: 'dev',
    label: 'Developer User',
    tone: 'Technical',
    emotionTier: 2,
    safetyMode: 'strict',
    memoryWindow: 2,
    systemPrompt: 'Developer persona for testing',
  };

  const basicTier: BrewTier = 'basic';
  const proTier: BrewTier = 'pro';
  const rbTier: BrewTier = 'rb';

  // Test 1: Command policy denies customer /patch
  test('Customer should be blocked from using /patch command', () => {
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
  test('Customer should be allowed to use /doc command', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/doc'].intentCategory,
      tier: basicTier,
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: '/doc',
      truthScore: 0.5, // Added to meet BrewTruth expectations
    });

    expect(policy.ok).toBe(true);
    expect(policy.route).toBe('brewassist');
    expect(policy.reason).toContain('Capability check passed.');
  });

  // Test 3: MCP policy blocks fs_write without confirmation
  test('fs_write should require confirmation', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['fs_write'].intentCategory,
      tier: proTier,
      persona: adminPersona,
      cockpitMode: 'admin',
      capabilityId: 'fs_write',
      action: 'W',
      confirmApply: false, // Missing confirmation
      truthScore: 0.9, // Added to meet BrewTruth expectations
      truthFlags: ['safety_concern'], // Added to meet BrewTruth expectations
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('TOOLBELT_CONFIRM_REQUIRED');
    expect(policy.requiresConfirm).toBe(true);
  });

  // Test 4: MCP policy blocks fs_write without GEP header
  test('fs_write should require GEP header', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['fs_write'].intentCategory,
      tier: proTier,
      persona: adminPersona,
      cockpitMode: 'admin',
      capabilityId: 'fs_write',
      action: 'W',
      confirmApply: true,
      gepHeaderPresent: false, // Missing GEP header
      truthScore: 0.9, // Added to meet BrewTruth expectations
      truthFlags: ['safety_concern'], // Added to meet BrewTruth expectations
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('TOOLBELT_GEP_REQUIRED');
  });

  // Test 5: MCP policy allows fs_read on tier 1
  test('fs_read should be allowed for customer with basic tier', () => {
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

  // Test 6: Tier 2 capability blocked for basic tier
  test('Pro tier capability should be blocked for basic tier', () => {
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

  // Test 7: Sandbox required capability blocked outside admin mode
  test('Sandbox required capability should be blocked outside admin mode', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/patch'].intentCategory,
      tier: proTier,
      persona: adminPersona,
      cockpitMode: 'customer', // Customer mode
      capabilityId: '/patch',
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('TOOLBELT_SANDBOX_ONLY');
  });

  // Test 8: BrewTruth low confidence should require confirmation
  test('Low BrewTruth score should require confirmation', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/patch'].intentCategory,
      tier: proTier,
      persona: adminPersona,
      cockpitMode: 'admin',
      capabilityId: '/patch',
      truthScore: 0.5, // Low score
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('BREWTRUTH_LOW_CONFIDENCE');
    expect(policy.requiresConfirm).toBe(true);
  });

  // Test 9: BrewTruth missing flags should require confirmation
  test('Missing BrewTruth flags should require confirmation', () => {
    const policy = evaluateHandshake({
      intent: CAPABILITY_REGISTRY['/patch'].intentCategory,
      tier: proTier,
      persona: adminPersona,
      cockpitMode: 'admin',
      capabilityId: '/patch',
      truthScore: 0.9, // High score
      truthFlags: [], // Missing required flags
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe('blocked');
    expect(policy.reason).toContain('TOOLBELT_CONFIRM_REQUIRED'); // Updated expectation
    expect(policy.requiresConfirm).toBe(true);
  });
});