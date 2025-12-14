import { runBrewAssistChain } from "@/lib/brewassistChain";
import { BrewassistEngine } from "@/lib/brewassist-engine";
import { BrewTruth } from "@/lib/brewtruth";
import { Toolbelt } from "@/lib/openaiToolbelt";
import { Message } from "ai";

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

// Helper to create a flexible fetch mock
type MockFetchHandler = (url: RequestInfo, init?: RequestInit) => Promise<Response>;
type MockFetchConfig = {
  [urlSubstring: string]: MockFetchHandler;
};

const createMockFetch = (config: MockFetchConfig): MockFetchHandler => {
  return jest.fn((url, options) => {
    for (const urlSubstring in config) {
      if (url.toString().includes(urlSubstring)) {
        return config[urlSubstring](url, options);
      }
    }
    // Default unhandled fetch to a 404
    return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve(`Unhandled fetch to: ${url}`) } as Response);
  });
};

// Mock the external dependencies of runBrewAssistChain
jest.mock('@/lib/openaiToolbelt', () => ({
  runWithToolbelt: jest.fn(() => Promise.reject(new Error("Toolbelt failed for test"))),
}));
jest.mock('@/lib/openaiEngine', () => ({
  callOpenAI: jest.fn(() => Promise.reject(new Error("OpenAI failed for test"))),
}));
jest.mock('@/lib/geminiCli', () => ({
  runGeminiCli: jest.fn(() => Promise.reject(new Error("Gemini failed for test"))),
}));


describe("BrewAssistChain Integration Test", () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = setupEnv();
  });

  afterEach(() => {
    restoreEnv();
    jest.restoreAllMocks();
  });

  it('should return a "All engines failed" message when all providers fail', async () => {
    const result = await runBrewAssistChain("hello");

    expect(result).toBeDefined();
    expect(result.output).toContain('All engines failed (Toolbelt → OpenAI → Gemini). Please check server logs.');
    expect(result.engine).toBe('system');
  });
});
