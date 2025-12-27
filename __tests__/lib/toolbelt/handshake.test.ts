
import { evaluateHandshake } from '@/lib/toolbelt/handshake';

describe('evaluateHandshake', () => {
  it('should deny customer access to /patch command', () => {
    const decision = evaluateHandshake({
      intent: 'PLATFORM_DEVOPS',
      tier: 'basic',
      persona: 'customer',
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
      persona: 'customer',
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
      persona: 'admin',
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
      persona: 'customer',
      cockpitMode: 'customer',
      capabilityId: 'fs_read',
    });
    expect(decision.ok).toBe(true);
  });
});
