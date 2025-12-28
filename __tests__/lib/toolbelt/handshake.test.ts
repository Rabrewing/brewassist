import { evaluateHandshake } from '@/lib/toolbelt/handshake';
import { Persona } from '@/lib/brewIdentityEngine'; // Import Persona type

describe('evaluateHandshake', () => {
  const adminPersona: Persona = {
    id: 'admin',
    label: 'Admin User',
    tone: 'Authoritative',
    emotionTier: 3,
    safetyMode: 'hard-stop', // Consistent with lib/toolbelt/handshake.ts
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

  it('should deny customer access to /patch command', () => {
    const decision = evaluateHandshake({
      intent: 'PLATFORM_DEVOPS',
      tier: 'basic',
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: '/patch', // Updated
    });
    expect(decision.ok).toBe(false);
    expect(decision.reason).toContain('not allowed');
  });
  it('should allow customer access to /doc command', () => {
    const decision = evaluateHandshake({
      intent: 'DOCS_KB',
      tier: 'basic',
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: '/doc', // Updated
      truthScore: 0.5, // Added to meet BrewTruth expectations
    });
    expect(decision.ok).toBe(true);
  });

  it('should block fs_write without confirmation', () => {
    const decision = evaluateHandshake({
      intent: 'PLATFORM_DEVOPS',
      tier: 'pro',
      persona: adminPersona,
      cockpitMode: 'admin',
      capabilityId: 'fs_write',
      confirmApply: false, // No confirmation
      truthScore: 0.9, // Added to meet BrewTruth expectations
      truthFlags: ['safety_concern'], // Added to meet BrewTruth expectations
    });
    expect(decision.ok).toBe(false);
    expect(decision.reason).toContain('TOOLBELT_CONFIRM_REQUIRED');
  });

  it('should allow fs_read on tier 1', () => {
    const decision = evaluateHandshake({
      intent: 'PLATFORM_DEVOPS', // Updated from SUPPORT to PLATFORM_DEVOPS
      tier: 'basic',
      persona: customerPersona,
      cockpitMode: 'customer',
      capabilityId: 'fs_read',
    });
    expect(decision.ok).toBe(true);
  });
});
