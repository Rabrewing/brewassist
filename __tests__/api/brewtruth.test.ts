// __tests__/api/brewtruth.test.ts

import { runBrewAssistEngine } from '../../lib/brewassist-engine';
import { BrewAssistMode } from '../../lib/brewassist-engine';

describe('BrewTruth Enabled/Disabled Logic', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - reset modules between tests
    process.env = { ...originalEnv }; // Make a copy of the original env
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env
  });

  it('should return a truth object when BREWTRUTH_ENABLED is "true"', async () => {
    process.env.BREWTRUTH_ENABLED = "true";
    // Mock the callProvider and callNimsProvider to avoid actual API calls
    jest.mock('../../lib/model-router', () => ({
      ...jest.requireActual('../../lib/model-router'),
      getModelProviders: () => ({
        openai: { enabled: true, apiKey: 'test-key', baseUrl: 'http://localhost' },
      }),
      resolveRoute: jest.fn(() => ({ provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' })),
      getModelRoutes: jest.fn(() => ([{ provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' }])),
    }));
    jest.mock('../../lib/brewtruth', () => ({
      ...jest.requireActual('../../lib/brewtruth'),
      runBrewTruth: jest.fn(() => ({
        tier: 'silver',
        overallScore: 0.8,
        scores: [],
        flags: [],
        summary: 'Mocked truth report',
        modelTrace: { provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' },
        evaluatedAt: new Date().toISOString(),
        version: '2',
      })),
    }));
    jest.mock('node-fetch', () => jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'Mocked response' } }] }),
    })));

    const result = await runBrewAssistEngine({
      input: 'Test input',
      mode: 'llm' as BrewAssistMode,
    });

    expect(result.truth).not.toBeNull();
    expect(result.truth?.version).toBe('2');
  }, 15000);

  it('should return truth as null when BREWTRUTH_ENABLED is "false"', async () => {
    process.env.BREWTRUTH_ENABLED = "false";
    // Mock the callProvider and callNimsProvider to avoid actual API calls
    jest.mock('../../lib/model-router', () => ({
      ...jest.requireActual('../../lib/model-router'),
      getModelProviders: () => ({
        openai: { enabled: true, apiKey: 'test-key', baseUrl: 'http://localhost' },
      }),
      resolveRoute: jest.fn(() => ({ provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' })),
      getModelRoutes: jest.fn(() => ([{ provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' }])),
    }));
    jest.mock('../../lib/brewtruth', () => ({
      ...jest.requireActual('../../lib/brewtruth'),
      runBrewTruth: jest.fn(() => ({
        tier: 'silver',
        overallScore: 0.8,
        scores: [],
        flags: [],
        summary: 'Mocked truth report',
        modelTrace: { provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' },
        evaluatedAt: new Date().toISOString(),
        version: '2',
      })),
    }));
    jest.mock('node-fetch', () => jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'Mocked response' } }] }),
    })));

    const result = await runBrewAssistEngine({
      input: 'Test input',
      mode: 'llm' as BrewAssistMode,
    });

    expect(result.truth).toBeNull();
  });

  it('should return truth as null when BREWTRUTH_ENABLED is undefined', async () => {
    delete process.env.BREWTRUTH_ENABLED;
    // Mock the callProvider and callNimsProvider to avoid actual API calls
    jest.mock('../../lib/model-router', () => ({
      ...jest.requireActual('../../lib/model-router'),
      getModelProviders: () => ({
        openai: { enabled: true, apiKey: 'test-key', baseUrl: 'http://localhost' },
      }),
      resolveRoute: jest.fn(() => ({ provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' })),
      getModelRoutes: jest.fn(() => ([{ provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' }])),
    }));
    jest.mock('../../lib/brewtruth', () => ({
      ...jest.requireActual('../../lib/brewtruth'),
      runBrewTruth: jest.fn(() => ({
        tier: 'silver',
        overallScore: 0.8,
        scores: [],
        flags: [],
        summary: 'Mocked truth report',
        modelTrace: { provider: 'openai', model: 'gpt-4.1-mini', routeType: 'primary' },
        evaluatedAt: new Date().toISOString(),
        version: '2',
      })),
    }));
    jest.mock('node-fetch', () => jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: 'Mocked response' } }] }),
    })));

    const result = await runBrewAssistEngine({
      input: 'Test input',
      mode: 'llm' as BrewAssistMode,
    });

    expect(result.truth).toBeNull();
  });
});
