import { NextApiRequest, NextApiResponse } from 'next';
import handler, { BrewAssistApiResponse } from '@/pages/api/brewassist';
import { BrewModeId, ToolbeltTierId, McpToolId, ToolRule, ToolbeltTier, ToolSafetyLevel } from '@/lib/toolbeltConfig';
import { parseSseEvents, reconstructContentFromEvents } from "../helpers/sseTestUtils";

// Import the actual getToolRule type for correct typing of the mock
import type { getToolRule as getToolRuleActual } from '@/lib/toolbeltConfig';

// Mock the runBrewAssistEngineStream as it's not relevant for toolbelt enforcement tests
const mockRunBrewAssistEngineStream = jest.fn();
jest.mock('@/lib/brewassist-engine', () => ({
  runBrewAssistEngineStream: (...args: any[]) => mockRunBrewAssistEngineStream(...args),
  shouldBlockActionFromTruth: jest.fn(() => false),
}));

// Mock getToolRule to control test scenarios
jest.mock('@/lib/toolbeltConfig', () => ({
  ...jest.requireActual('@/lib/toolbeltConfig'), // Import and retain default behavior
  getToolRule: jest.fn((toolId, action) => {
    console.log(`[MOCK] getToolRule called with: toolId=${toolId}, action=${action}`);
    // This will be overridden by mockReturnValue in tests, but will log if not.
    return { enabled: false, safety: 'read-only', requireConfirmation: false, requireGepHeader: false }; // Default to blocked for safety
  }),
}));

// Mock getModelProviders globally for this test file
const mockGetModelProviders = jest.fn();
const mockResolveRoute = jest.fn();
const mockGetModelRoutes = jest.fn();

jest.mock('../../lib/model-router', () => ({
  getModelProviders: () => mockGetModelProviders(),
  resolveRoute: (...args: any[]) => mockResolveRoute(...args),
  getModelRoutes: (...args: any[]) => mockGetModelRoutes(...args),
}));

// This must be defined AFTER jest.mock for toolbeltConfig
const mockGetToolRule = require('@/lib/toolbeltConfig').getToolRule as jest.MockedFunction<typeof getToolRuleActual>;

// Mock process.env for testing environment variables
const MOCK_ENV = {
  OPENAI_API_KEY: "test-openai-key",
  LLM_PRIMARY_MODEL: "gpt-4.1-mini",
  HRM_PRIMARY_MODEL: "gemini-2.0-flash",
  GEMINI_MODEL: "gemini-2.0-flash",
  NIMS_API_KEY: "test-nims-key",
  NIMS_BASE_URL: "https://integrate.api.nvidia.com/v1",
  NIMS_MODEL_PREFERRED: "nemotron-3-8b-instruct",
  NIMS_MODEL_FALLBACK_1: "llama-3.1-8b-instruct",
  NIMS_MODEL_FALLBACK_2: "mistral-7b-instruct",
  NIMS_ENABLED: "true",
  NIMS_TIMEOUT_MS: "500", // Short timeout for probes in tests
  ENABLE_BREWTRUTH: "false", // Disable BrewTruth for simpler testing

  // Mistral specific env vars
  MISTRAL_ENABLED: "true",
  MISTRAL_API_KEY: "test-mistral-key",
  MISTRAL_BASE_URL: "https://api.mistral.ai/v1",
  MISTRAL_MODEL_PRIMARY: "mistral-small-latest",
  MISTRAL_MODEL_SECONDARY: "mistral-large-latest",
};

// Helper to set up mocks for process.env
const setupEnv = (envOverrides: Record<string, string> = {}) => {
  const originalEnv = process.env;
  process.env = { ...originalEnv, ...MOCK_ENV, ...envOverrides };
  return () => {
    process.env = originalEnv; // Restore original env after test
  };
};

describe('Toolbelt API Enforcement (S4.9d.3)', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse<BrewAssistApiResponse>>;
  let resStatus: number;
  let resJson: BrewAssistApiResponse;
  let restoreEnv: () => void;

    beforeEach(() => {

      jest.resetModules(); // Ensure modules are reloaded for each test

      restoreEnv = setupEnv();

  

      mockReq = {

        method: 'POST',

        headers: {

          'x-brewassist-mode': 'admin',

        },

        body: {},

      };

      resStatus = 200; // Default to success

  

      // Reset mock for each test

      mockGetToolRule.mockReset();

      mockRunBrewAssistEngineStream.mockReset(); // Reset the engine mock as well

  

      // Set a default mock for getModelProviders that reflects the expected initial state

      mockGetModelProviders.mockReturnValue({

        openai: {

          enabled: true,

          baseUrl: "https://api.openai.com/v1",

          apiKey: MOCK_ENV.OPENAI_API_KEY,

          primaryModel: MOCK_ENV.LLM_PRIMARY_MODEL,

        },

        gemini: {

          enabled: true,

          baseUrl: "https://generativelanguage.googleapis.com/v1beta",

          apiKey: MOCK_ENV.GEMINI_API_KEY,

          primaryModel: MOCK_ENV.GEMINI_MODEL,

        },

        mistral: {

          enabled: true,

          baseUrl: MOCK_ENV.MISTRAL_BASE_URL,

          apiKey: MOCK_ENV.MISTRAL_API_KEY,

          primaryModel: MOCK_ENV.MISTRAL_MODEL_PRIMARY,

        },

        nims: {

          enabled: true,

          baseUrl: MOCK_ENV.NIMS_BASE_URL,

          apiKey: MOCK_ENV.NIMS_API_KEY,

          preferredModel: MOCK_ENV.NIMS_MODEL_PREFERRED,

          fallback1Model: MOCK_ENV.NIMS_MODEL_FALLBACK_1,

          fallback2Model: MOCK_ENV.NIMS_MODEL_FALLBACK_2,

        },

        tinyllm: {

          enabled: false, // Assuming tinyllm is disabled by default

          baseUrl: "",

          apiKey: "",

          primaryModel: "",

        },

        system: {

          enabled: true,

          baseUrl: "system",

          primaryModel: "toolbelt-guard",

        },

      });

  

      // Mock resolveRoute and getModelRoutes to return sensible defaults or actual behavior

      mockResolveRoute.mockImplementation(jest.requireActual('../../lib/model-router').resolveRoute);

      mockGetModelRoutes.mockImplementation(jest.requireActual('../../lib/model-router').getModelRoutes);

  

      // Set default successful mock for runBrewAssistEngineStream

            mockRunBrewAssistEngineStream.mockImplementation(async (_args: any, onChunk: any, onEnd: any) => {

              onChunk('Mocked engine response');

              onEnd?.({ provider: 'mockProvider', model: 'mockModel' });

            });  });

  afterEach(() => {
    restoreEnv();
    jest.restoreAllMocks();
  });

  // Helper to create a mock rule
  const createMockRule = (
    enabled: boolean,
    safety: ToolSafetyLevel = 'read-only',
    requireConfirmation: boolean = false,
    requireGepHeader: boolean = false
  ): ToolRule => ({
    enabled,
    safety,
    requireConfirmation,
    requireGepHeader,
  });

  // Helper to simulate a request
  const simulateRequest = async (
    mode: BrewModeId,
    toolbeltTierId: ToolbeltTierId, // Renamed parameter for clarity
    mcpToolId: McpToolId,
    mcpAction?: string,
    confirmApply?: boolean,
    gepHeaderPresent?: boolean,
    input: string = 'test input'
  ) => {
    let tier: ToolbeltTier;
    switch (toolbeltTierId) {
      case 1: tier = "T1_SAFE"; break;
      case 2: tier = "T2_GUIDED"; break;
      case 3: tier = "T3_POWER"; break;
      default: tier = "T1_SAFE"; // Default or throw error
    }

    mockReq.headers = {
      ...mockReq.headers, // Keep existing headers
      'x-brewassist-mode': 'admin', // Ensure admin mode is set
    };
    if (gepHeaderPresent) {
      mockReq.headers['x-gemini-execution-protocol'] = 'strict';
    }

    mockReq.body = {
      input,
      mode,
      tier, // Pass the converted string tier
      mcpToolId,
      mcpAction,
      confirmApply,
      gepHeaderPresent,
    };

    mockReq.headers = {
      'x-brewassist-mode': 'admin', // Keep existing header
    };
    if (gepHeaderPresent) {
      mockReq.headers['x-gemini-execution-protocol'] = 'strict';
    }
    if (gepHeaderPresent) {
      mockReq.headers['x-gemini-execution-protocol'] = 'strict';
    }
    if (gepHeaderPresent) {
      mockReq.headers['x-gemini-execution-protocol'] = 'strict';
    }
    
    let capturedResult: any = null;
    const res: Partial<NextApiResponse> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((payload) => {
            console.log('DEBUG: capturedResult:', payload);
            capturedResult = payload;
            return res;
        }),
        setHeader: jest.fn(),
        flushHeaders: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
    };

    await handler(mockReq as NextApiRequest, res as NextApiResponse<BrewAssistApiResponse>);
    
      if ((res.status as jest.Mock).mock.calls.length > 0) {
        resStatus = (res.status as jest.Mock).mock.calls[0][0];
      }
      resJson = capturedResult;
      if (resJson === null) {
        resJson = { ok: resStatus === 200 } as any;
      }  };

  // 1. HRM + T1_SAFE + file-assistant read → allowed
  test('1. HRM + T1_SAFE + file-assistant read → allowed', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'read-only', false, false));
    await simulateRequest('TOOL', 1, 'file-assistant', 'readFile');
    expect(resStatus).toBe(200);
    expect(resJson.ok).toBe(true);
  });

  // 2. HRM + T2_GUIDED + file-assistant write → blocked
  test('2. HRM + T2_GUIDED + file-assistant write → blocked (TOOLBELT_FORBIDDEN)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(false, 'single-file-write', true, false)); // Rule says not enabled for this mode/tier
    await simulateRequest('TOOL', 2, 'file-assistant', 'writeFile');
    expect(resStatus).toBe(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_FORBIDDEN');
  });

  // 3. LLM + T1_SAFE + git-command-center commit → blocked (TOOLBELT_READ_ONLY)
  test('3. LLM + T1_SAFE + git-command-center commit → blocked (TOOLBELT_READ_ONLY)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'read-only', false, false)); // Enabled, but read-only
    await simulateRequest('TOOL', 1, 'git-command-center', 'commit');
    expect(resStatus).toBe(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_READ_ONLY');
  });

  // 4. LLM + T2_GUIDED + file-assistant write, confirmApply=false → blocked (TOOLBELT_CONFIRM_REQUIRED)
  test('4. LLM + T2_GUIDED + file-assistant write, confirmApply=false → blocked (TOOLBELT_CONFIRM_REQUIRED)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'single-file-write', true, false)); // Enabled, requires confirmation
    await simulateRequest('TOOL', 2, 'file-assistant', 'writeFile', false); // confirmApply is false
    expect(resStatus).toBe(409);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_CONFIRM_REQUIRED');
  });

  // 5. LLM + T2_GUIDED + file-assistant write, confirmApply=true → allowed
  test('5. LLM + T2_GUIDED + file-assistant write, confirmApply=true → allowed', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'single-file-write', true, false)); // Enabled, requires confirmation
    await simulateRequest('TOOL', 2, 'file-assistant', 'writeFile', true); // confirmApply is true
    expect(resStatus).toBe(200);
    expect(resJson.ok).toBe(true);
  });

  // 6. AGENT + T3_POWER + file-assistant multi-file refactor, no G.E.P. header → blocked (TOOLBELT_GEP_REQUIRED)
  test('6. AGENT + T3_POWER + file-assistant multi-file refactor, no G.E.P. header → blocked (TOOLBELT_GEP_REQUIRED)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'multi-file-write', true, true)); // Enabled, requires GEP
    await simulateRequest('TOOL', 3, 'file-assistant', 'multiFileRefactor', true, false); // gepHeaderPresent is false
    expect(resStatus).toBe(412);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_GEP_REQUIRED');
  });

  // 7. AGENT + T3_POWER + file-assistant multi-file refactor, gepHeaderPresent=true & confirmApply=true → allowed
  test('7. AGENT + T3_POWER + file-assistant multi-file refactor, gepHeaderPresent=true & confirmApply=true → allowed', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'multi-file-write', true, true)); // Enabled, requires GEP
    await simulateRequest('TOOL', 3, 'file-assistant', 'multiFileRefactor', true, true); // Both flags are true
    expect(resStatus).toBe(200);
    expect(resJson.ok).toBe(true);
  });

  // 8. Loop + any Tier + any write action → blocked (TOOLBELT_FORBIDDEN or TOOLBELT_READ_ONLY)
  test('8. Loop + any Tier + any write action → blocked (TOOLBELT_FORBIDDEN or TOOLBELT_READ_ONLY)', async () => {
    // Simulate a rule that is not enabled for LOOP mode at any tier for write actions
    mockGetToolRule.mockReturnValue(createMockRule(false, 'single-file-write', false, false)); // Not enabled
    await simulateRequest('TOOL', 1, 'file-assistant', 'writeFile');
    expect(resStatus).toBe(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_FORBIDDEN');

    // Test another case where it's enabled but read-only
    mockGetToolRule.mockReturnValue(createMockRule(true, 'read-only', false, false)); // Enabled but read-only
    await simulateRequest('TOOL', 1, 'file-assistant', 'writeFile');
    expect(resStatus).toBe(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_READ_ONLY');
  });

  // Test case for when mcpToolId is not provided (should bypass enforcement)
  test('Should bypass enforcement if mcpToolId is not provided and return SSE stream', async () => {
    mockReq.body = {
      input: 'just a chat message',
      mode: 'llm',
      toolbeltTier: 1,
    };

    // Mock runBrewAssistEngineStream to simulate a successful stream
    mockRunBrewAssistEngineStream.mockImplementation(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk('Mocked chat response');
      onEnd?.({ provider: 'mockProvider', model: 'mockModel' });
    });

    // Reset mockRes for this test to capture SSE
    mockRes = {
      status: jest.fn((code: number) => {
        resStatus = code;
        return mockRes;
      }),
      json: jest.fn((payload: any) => {
        resJson = payload;
        return mockRes;
      }),
      setHeader: jest.fn(),
      flushHeaders: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };
    resStatus = 200; // Default to success
    resJson = {} as BrewAssistApiResponse;

    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse<BrewAssistApiResponse>);

    expect(resStatus).toBe(200);
    expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
    expect(mockRes.write).toHaveBeenCalled();
    const raw = (mockRes.write as jest.Mock).mock.calls.map(call => call[0]).join('');
    const events = parseSseEvents(raw);
    const content = reconstructContentFromEvents(events);
    expect(content).toContain('Mocked chat response');
    expect(mockGetToolRule).not.toHaveBeenCalled(); // Ensure getToolRule was not called
  });

  // Test case for missing input
  test('Should return 400 if input is missing', async () => {
    mockReq.body = {}; // No input
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse<BrewAssistApiResponse>);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('Missing required field: input');
  });
});
