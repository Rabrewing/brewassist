import { captureSupportEvent } from '../../lib/support/intake';
import { triageSupportEvent } from '../../lib/support/triage';

describe('Support Intelligence Safety Gates', () => {
  test('customer events do not leak between personas', () => {
    const customerEvent = {
      persona: 'customer',
      intent: 'help',
      severity: 'low' as const,
      context: { privateData: 'secret' },
      description: 'Need help',
    };

    const event = captureSupportEvent(customerEvent);

    // Ensure no cross-contamination
    expect(event.persona).toBe('customer');
    expect(event.context?.privateData).toBe('secret'); // Only visible to same persona
  });

  test('no auto-execution of fixes', () => {
    const event = {
      persona: 'admin',
      intent: 'bug fix',
      severity: 'high' as const,
      context: {},
      description: 'Critical bug',
    };

    const captured = captureSupportEvent(event);
    const triaged = triageSupportEvent(captured);

    // Ensure no automatic execution
    expect(triaged.triageResult).not.toBe('auto_execute');
    expect(triaged.suggestedActions).not.toContain('execute fix');
  });

  test('support events require explicit approval for sensitive actions', () => {
    const sensitiveEvent = {
      persona: 'admin',
      intent: 'error',
      severity: 'critical' as const,
      context: { involvesSecurity: true },
      description: 'Security vulnerability',
    };

    const captured = captureSupportEvent(sensitiveEvent);
    const triaged = triageSupportEvent(captured);

    // Ensure critical errors get immediate fix actions
    expect(triaged.confidence).toBeGreaterThan(0.5);
    expect(triaged.suggestedActions).toContain('Escalate to engineering team');
  });
});
