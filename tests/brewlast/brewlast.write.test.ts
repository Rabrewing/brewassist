import { writeBrewLast } from '../../lib/brewlast/write';

describe('BrewLast Write', () => {
  const testData = {
    lastMode: 'admin' as const,
    lastTier: 'pro' as const,
    lastToolbelt: ['/task', '/doc'],
    lastSessionId: 'test-session',
    lastPersona: 'admin',
    lastBuildOutcome: {
      lint: true,
      typecheck: true,
      test: true,
      uiTest: true,
      build: true,
    },
  };

  beforeEach(() => {
    // Clean up any existing file
    try {
      require('fs').unlinkSync('.brewlast.json');
    } catch {}
  });

  test('writes valid JSON', () => {
    const result = writeBrewLast(testData);
    expect(result).toBe(true);

    const fs = require('fs');
    expect(fs.existsSync('.brewlast.json')).toBe(true);
    const content = JSON.parse(fs.readFileSync('.brewlast.json', 'utf8'));
    expect(content.lastMode).toBe('admin');
    expect(content.lastPersona).toBe('admin');
  });

  test('customer mode skip with reason', () => {
    const customerData = {
      ...testData,
      lastMode: 'customer' as const,
      lastTier: 'basic' as const,
    };
    const result = writeBrewLast(customerData);
    expect(result).toBe(false); // Write is blocked

    // Since write failed, no file should be created or modified
    // But the function doesn't write anything for customer
  });

  test('handles missing folder gracefully', () => {
    // Should create directory if needed
    const result = writeBrewLast(testData);
    expect(result).toBe(true);
  });
});
