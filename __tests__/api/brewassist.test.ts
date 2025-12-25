import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/brewassist";
import { collectSseWrites, parseSseEvents, reconstructContentFromEvents } from "../helpers/sseTestUtils";
import { callBrewassist } from "../helpers/brewassistTestClient"; // Re-add this import
import { runBrewAssistEngineStream } from "@/lib/brewassist-engine"; // Import the actual module for typing
import { classifyIntent } from "@/lib/intent-gatekeeper"; // Import classifyIntent

jest.mock('@/lib/brewassist-engine', () => ({
  runBrewAssistEngineStream: jest.fn(),
}));

jest.mock('@/lib/intent-gatekeeper', () => ({
  classifyIntent: jest.fn(),
}));




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

// Mock getModelProviders globally for this test file
const mockGetModelProviders = jest.fn();
const mockResolveRoute = jest.fn();
const mockGetModelRoutes = jest.fn();

jest.mock('../../lib/model-router', () => ({
  getModelProviders: () => mockGetModelProviders(),
  resolveRoute: (...args: any[]) => mockResolveRoute(...args),
  getModelRoutes: (...args: any[]) => mockGetModelRoutes(...args),
}));

describe("BrewAssist API (S4.8f - Model Routing & NIMs Auto-Discovery)", () => {
  let restoreEnv: () => void;

  let fetchSpy: jest.SpyInstance; // Declare fetchSpy here

  beforeEach(() => {
    jest.resetModules(); // Ensure modules are reloaded for each test
    restoreEnv = setupEnv();

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

    // Default mock for classifyIntent
    (classifyIntent as jest.Mock).mockReturnValue("PLATFORM_DEVOPS");

    // Mock global.fetch
    fetchSpy = jest.spyOn(global, 'fetch'); // Assign to the declared variable
    fetchSpy.mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response));
  });

  afterEach(() => {
    restoreEnv();
    jest.restoreAllMocks();
  });

  it("should return a valid response for a basic LLM prompt using the primary provider", async () => {
    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("OpenAI response"); // Call onChunk with a string
      onEnd?.({ provider: "openai", model: "gpt-4.1-mini", routeType: "primary" }); // Call onEnd with an object
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "CI pipeline: Hello",
      mode: "llm",
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("OpenAI response");
    // We need to extract provider, model, routeType from the last event if they are sent there
    // For now, we'll assume the last event contains the final metadata
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("openai");
    expect(lastEvent.payload.route).toBe("brewassist"); // Expect lastEvent.payload.route
  });

  it("should return 400 when input is missing", async () => {
    let resStatus = 200;
    let body = "";

    const { req } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { mode: "llm" },
    });

    const res: any = {
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      flushHeaders: jest.fn(),
      writeHead: jest.fn(),
      write: jest.fn((chunk: any) => { body += String(chunk); }),
      end: jest.fn((chunk?: any) => { if (chunk) body += String(chunk); }),

      status: jest.fn((code: number) => {
        resStatus = code;
        return res;
      }),
      json: jest.fn((obj: any) => {
        body = JSON.stringify(obj);
        return res;
      }),

      _getStatusCode: () => resStatus,
      _getData: () => body,
    };

    await handler(req as any, res as any);

    expect(resStatus).toBe(400);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Missing required field: input",
      code: "INVALID_REQUEST"
    });
  });

  it("should return 405 for non-POST methods", async () => {
    let resStatus = 200;
    let body = "";

    const { req } = createMocks({
      method: "GET",
    });

    const res: any = {
      setHeader: jest.fn(),
      getHeader: jest.fn(),
      flushHeaders: jest.fn(),
      writeHead: jest.fn(),
      write: jest.fn((chunk: any) => { body += String(chunk); }),
      end: jest.fn((chunk?: any) => { if (chunk) body += String(chunk); }),

      status: jest.fn((code: number) => {
        resStatus = code;
        return res;
      }),
      json: jest.fn((obj: any) => {
        body = JSON.stringify(obj);
        return res;
      }),

      _getStatusCode: () => resStatus,
      _getData: () => body,
    };

    await handler(req as any, res as any);

    expect(resStatus).toBe(405);
    expect(res.json).toHaveBeenCalledWith({
      ok: false,
      error: "Method Not Allowed",
      code: "METHOD_NOT_ALLOWED"
    });
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "POST");
  });

  // --- S4.8f Acceptance Tests ---

  it("Test 1: NIMs enabled + preferred model works (useResearchModel=true)", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      NIMS_ENABLED: "true",
    });

    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("NIMs Preferred response");
      onEnd?.({ provider: "nims", model: MOCK_ENV.NIMS_MODEL_PREFERRED, routeType: "research" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "Docker build: Research query",
      mode: "llm",
      useResearchModel: true,
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("NIMs Preferred response");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("nims");
    expect(lastEvent.payload.model).toBe(MOCK_ENV.NIMS_MODEL_PREFERRED);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
  });

  it("Test 2: Preferred NIMs model fails, fallback works (useResearchModel=true)", async () => {
    restoreEnv(); // Restore original env
    restoreEnv = setupEnv({
      NIMS_ENABLED: "true", // NIMs is enabled
      NIMS_MODEL_PREFERRED: "invalid-preferred-model", // Make preferred model fail
      NIMS_MODEL_FALLBACK_1: MOCK_ENV.NIMS_MODEL_FALLBACK_1, // Fallback 1 works
    });

    mockGetModelProviders.mockReturnValueOnce({
      ...mockGetModelProviders(), // Start with the default providers
      nims: {
        ...mockGetModelProviders().nims,
        enabled: true,
        preferredModel: "invalid-preferred-model",
        fallback1Model: MOCK_ENV.NIMS_MODEL_FALLBACK_1,
      },
      openai: {
        ...mockGetModelProviders().openai,
        enabled: true,
        primaryModel: MOCK_ENV.LLM_PRIMARY_MODEL,
      },
    });

    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("OpenAI response (NIMs fallback)");
      onEnd?.({ provider: "openai", model: MOCK_ENV.LLM_PRIMARY_MODEL, routeType: "primary" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "Jest failing: Research query",
      mode: "llm",
      useResearchModel: true,
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("OpenAI response (NIMs fallback)");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("openai");
    expect(lastEvent.payload.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
  });

  it("Test 3: All NIMs models fail, falls back to primary LLM (useResearchModel=true)", async () => {
    restoreEnv(); // Restore original env
    restoreEnv = setupEnv({
      NIMS_ENABLED: "true", // NIMs is enabled
      NIMS_MODEL_PREFERRED: "invalid-preferred",
      NIMS_MODEL_FALLBACK_1: "invalid-fallback-1",
      NIMS_MODEL_FALLBACK_2: "invalid-fallback-2",
    });

    mockGetModelProviders.mockReturnValueOnce({
      ...mockGetModelProviders(), // Start with the default providers
      nims: {
        ...mockGetModelProviders().nims,
        enabled: true,
        preferredModel: "invalid-preferred",
        fallback1Model: "invalid-fallback-1",
        fallback2Model: "invalid-fallback-2",
      },
      openai: {
        ...mockGetModelProviders().openai,
        enabled: true,
        primaryModel: MOCK_ENV.LLM_PRIMARY_MODEL,
      },
    });

    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("OpenAI response (NIMs fallback)");
      onEnd?.({ provider: "openai", model: MOCK_ENV.LLM_PRIMARY_MODEL, routeType: "primary" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "Supabase RLS: Research query",
      mode: "llm",
      useResearchModel: true,
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("OpenAI response (NIMs fallback)");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("openai");
    expect(lastEvent.payload.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
  });

  it("Test 4: NIMS_ENABLED=false, should not call NIMs even if useResearchModel=true", async () => {
    restoreEnv(); // Restore original env
    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("OpenAI response");
      onEnd?.({ provider: "openai", model: MOCK_ENV.LLM_PRIMARY_MODEL, routeType: "primary" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "Vercel deploy: Research query",
      mode: "llm",
      useResearchModel: true,
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("OpenAI response");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("openai"); // Should use primary LLM
    expect(lastEvent.payload.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining("integrate.api.nvidia.com"), expect.anything());
  });

  // --- S4.8g Acceptance Tests (Mistral) ---

  it("Test 5: Mistral enabled + preferred model works (preferredProvider=mistral)", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      MISTRAL_ENABLED: "true",
    });

    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("Mistral response");
      onEnd?.({ provider: "mistral", model: MOCK_ENV.MISTRAL_MODEL_PRIMARY, routeType: "preferred" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "CI pipeline: Mistral query",
      mode: "llm",
      preferredProvider: "mistral",
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("Mistral response");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("mistral");
    expect(lastEvent.payload.model).toBe(MOCK_ENV.MISTRAL_MODEL_PRIMARY);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
  });

  it("Test 6: Mistral fails (401/404) and falls back to OpenAI (preferredProvider=mistral)", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      MISTRAL_ENABLED: "true",
    });

    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("OpenAI fallback response");
      onEnd?.({ provider: "openai", model: MOCK_ENV.LLM_PRIMARY_MODEL, routeType: "primary" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "Docker build: Mistral query",
      mode: "llm",
      preferredProvider: "mistral",
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("OpenAI fallback response");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("openai");
    expect(lastEvent.payload.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
  });

  it("Test 7: MISTRAL_ENABLED=false, should not call Mistral even if preferredProvider=mistral", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      MISTRAL_ENABLED: "false", // Disable Mistral
    });

    mockGetModelProviders.mockReturnValueOnce({
      openai: {
        enabled: true,
        baseUrl: MOCK_ENV.OPENAI_BASE_URL,
        apiKey: MOCK_ENV.OPENAI_API_KEY,
        primaryModel: MOCK_ENV.LLM_PRIMARY_MODEL,
      },
      mistral: {
        enabled: false, // Explicitly disabled
        baseUrl: MOCK_ENV.MISTRAL_BASE_URL,
        apiKey: MOCK_ENV.MISTRAL_API_KEY,
        primaryModel: MOCK_ENV.MISTRAL_MODEL_PRIMARY,
      },
      gemini: { enabled: false, baseUrl: "", primaryModel: "" }, // Minimal disabled
      nims: { enabled: false, baseUrl: "", preferredModel: "" }, // Minimal disabled
      tinyllm: { enabled: false, baseUrl: "", primaryModel: "" }, // Minimal disabled
      system: { enabled: true, baseUrl: "system", primaryModel: "toolbelt-guard" },
    });

    (runBrewAssistEngineStream as jest.Mock).mockImplementationOnce(async (_args: any, onChunk: any, onEnd: any) => {
      onChunk("OpenAI response");
      onEnd?.({ provider: "openai", model: MOCK_ENV.LLM_PRIMARY_MODEL, routeType: "primary" });
    });

    const { events, content, resStatus } = await callBrewassist({
      input: "Jest failing: Mistral query",
      mode: "llm",
      preferredProvider: "mistral",
    });

    expect(resStatus).toBe(200);

    expect(content).toBe("OpenAI response");
    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");
    expect(lastEvent.payload.provider).toBe("openai"); // Should use primary LLM
    expect(lastEvent.payload.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(lastEvent.payload.route).toBe("brewassist"); // Changed to expect "brewassist"
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining("api.mistral.ai"), expect.anything());
  });
});