import { NextApiRequest, NextApiResponse } from 'next';
import handler, { BrewAssistApiResponse } from '@/pages/api/brewassist';
import { getToolRule, BrewModeId, ToolbeltTierId, McpToolId, ToolRule } from '@/lib/toolbeltConfig';

// Mock the runBrewAssistEngine as it's not relevant for toolbelt enforcement tests
jest.mock('@/lib/brewassist-engine', () => ({
  runBrewAssistEngine: jest.fn(() => Promise.resolve({
    result: { role: 'assistant', content: 'Mocked engine response' },
    provider: 'mockProvider',
    model: 'mockModel',
    routeType: 'mockRoute',
    modelRoleUsed: 'mockRole',
    truth: null,
  })),
  shouldBlockActionFromTruth: jest.fn(() => false),
}));

// Mock getToolRule to control test scenarios
jest.mock('@/lib/toolbeltConfig', () => ({
  ...jest.requireActual('@/lib/toolbeltConfig'), // Import and retain default behavior
  getToolRule: jest.fn(),
}));

const mockGetToolRule = getToolRule as jest.MockedFunction<typeof getToolRule>;

describe('Toolbelt API Enforcement (S4.9d.3)', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse<BrewAssistApiResponse>>;
  let resStatus: number;
  let resJson: BrewAssistApiResponse;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((json) => {
        resJson = json;
        return mockRes;
      }),
    };
    resStatus = 200; // Default to success
    resJson = {} as BrewAssistApiResponse;

    // Reset mock for each test
    mockGetToolRule.mockReset();
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
    toolbeltTier: ToolbeltTierId,
    mcpToolId: McpToolId,
    mcpAction?: string,
    confirmApply?: boolean,
    gepHeaderPresent?: boolean,
    input: string = 'test input'
  ) => {
    mockReq.body = {
      input,
      mode,
      toolbeltTier,
      mcpToolId,
      mcpAction,
      confirmApply,
      gepHeaderPresent,
    };
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse<BrewAssistApiResponse>);
  };

  // 1. HRM + T1_SAFE + file-assistant read → allowed
  test('1. HRM + T1_SAFE + file-assistant read → allowed', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'read-only', false, false));
    await simulateRequest('HRM', 1, 'file-assistant', 'readFile');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(resJson.ok).toBe(true);
  });

  // 2. HRM + T2_GUIDED + file-assistant write → blocked
  test('2. HRM + T2_GUIDED + file-assistant write → blocked (TOOLBELT_FORBIDDEN)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(false, 'single-file-write', true, false)); // Rule says not enabled for this mode/tier
    await simulateRequest('HRM', 2, 'file-assistant', 'writeFile');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_FORBIDDEN');
  });

  // 3. LLM + T1_SAFE + git-command-center commit → blocked (TOOLBELT_READ_ONLY)
  test('3. LLM + T1_SAFE + git-command-center commit → blocked (TOOLBELT_READ_ONLY)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'read-only', false, false)); // Enabled, but read-only
    await simulateRequest('LLM', 1, 'git-command-center', 'commit');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_READ_ONLY');
  });

  // 4. LLM + T2_GUIDED + file-assistant write, confirmApply=false → blocked (TOOLBELT_CONFIRM_REQUIRED)
  test('4. LLM + T2_GUIDED + file-assistant write, confirmApply=false → blocked (TOOLBELT_CONFIRM_REQUIRED)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'single-file-write', true, false)); // Enabled, requires confirmation
    await simulateRequest('LLM', 2, 'file-assistant', 'writeFile', false); // confirmApply is false
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_CONFIRM_REQUIRED');
  });

  // 5. LLM + T2_GUIDED + file-assistant write, confirmApply=true → allowed
  test('5. LLM + T2_GUIDED + file-assistant write, confirmApply=true → allowed', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'single-file-write', true, false)); // Enabled, requires confirmation
    await simulateRequest('LLM', 2, 'file-assistant', 'writeFile', true); // confirmApply is true
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(resJson.ok).toBe(true);
  });

  // 6. AGENT + T3_POWER + file-assistant multi-file refactor, no G.E.P. header → blocked (TOOLBELT_GEP_REQUIRED)
  test('6. AGENT + T3_POWER + file-assistant multi-file refactor, no G.E.P. header → blocked (TOOLBELT_GEP_REQUIRED)', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'multi-file-write', true, true)); // Enabled, requires GEP
    await simulateRequest('AGENT', 3, 'file-assistant', 'multiFileRefactor', true, false); // gepHeaderPresent is false
    expect(mockRes.status).toHaveBeenCalledWith(412);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_GEP_REQUIRED');
  });

  // 7. AGENT + T3_POWER + file-assistant multi-file refactor, gepHeaderPresent=true & confirmApply=true → allowed
  test('7. AGENT + T3_POWER + file-assistant multi-file refactor, gepHeaderPresent=true & confirmApply=true → allowed', async () => {
    mockGetToolRule.mockReturnValue(createMockRule(true, 'multi-file-write', true, true)); // Enabled, requires GEP
    await simulateRequest('AGENT', 3, 'file-assistant', 'multiFileRefactor', true, true); // Both flags are true
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(resJson.ok).toBe(true);
  });

  // 8. Loop + any Tier + any write action → blocked (TOOLBELT_FORBIDDEN or TOOLBELT_READ_ONLY)
  test('8. Loop + any Tier + any write action → blocked (TOOLBELT_FORBIDDEN or TOOLBELT_READ_ONLY)', async () => {
    // Simulate a rule that is not enabled for LOOP mode at any tier for write actions
    mockGetToolRule.mockReturnValue(createMockRule(false, 'single-file-write', false, false)); // Not enabled
    await simulateRequest('LOOP', 1, 'file-assistant', 'writeFile');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_FORBIDDEN');

    // Test another case where it's enabled but read-only
    mockGetToolRule.mockReturnValue(createMockRule(true, 'read-only', false, false)); // Enabled but read-only
    await simulateRequest('LOOP', 1, 'file-assistant', 'writeFile');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('TOOLBELT_READ_ONLY');
  });

  // Test case for when mcpToolId is not provided (should bypass enforcement)
  test('Should bypass enforcement if mcpToolId is not provided', async () => {
    mockReq.body = {
      input: 'just a chat message',
      mode: 'llm',
      toolbeltTier: 1,
    };
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse<BrewAssistApiResponse>);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(resJson.ok).toBe(true);
    expect(mockGetToolRule).not.toHaveBeenCalled(); // Ensure getToolRule was not called
  });

  // Test case for missing input
  test('Should return 400 if input is missing', async () => {
    mockReq.body = {}; // No input
    await handler(mockReq as NextApiRequest, mockRes as NextApiResponse<BrewAssistApiResponse>);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(resJson.ok).toBe(false);
    expect(resJson.error).toBe('Missing input');
  });
});
