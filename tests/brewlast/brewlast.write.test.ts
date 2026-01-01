import { writeBrewLast } from '../../lib/brewlast/write';

describe('BrewLast Write', () => {
  const testData = {
    lastMode: 'admin' as const,
    lastPersona: 'admin',
    lastTier: 2,
    lastToolbelt: ['/task', '/doc'],
    lastSessionId: 'test-session',
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
    const customerData = { ...testData, lastMode: 'customer' as const };
    const result = writeBrewLast(customerData);
    expect(result).toBe(true);

    const fs = require('fs');
    const content = JSON.parse(fs.readFileSync('.brewlast.json', 'utf8'));
    expect(content.skippedReason).toBe('customer mode write blocked');
  });

  test('handles missing folder gracefully', () => {
    // Should create directory if needed
    const result = writeBrewLast(testData);
    expect(result).toBe(true);
  });
});
