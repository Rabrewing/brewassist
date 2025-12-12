// __tests__/api/brewassist.test.ts

import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/brewassist";

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

describe("BrewAssist API (S4.8f - Model Routing & NIMs Auto-Discovery)", () => {
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = setupEnv();
    // global.fetch mock will be set up per test or by a helper
  });

  afterEach(() => {
    restoreEnv();
    jest.restoreAllMocks();
  });

  it("should return a valid response for a basic LLM prompt using the primary provider", async () => {
    global.fetch = createMockFetch({
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI response" } }] }),
      } as Response),
    });

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Hello", mode: "llm" },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.message.content).toBe("OpenAI response");
    expect(data.provider).toBe("openai");
    expect(data.model).toBe("gpt-4.1-mini");
    expect(data.routeType).toBe("primary");
  });

  it("should return 400 when input is missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { mode: "llm" },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Missing input");
  });

  it("should return 405 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Method not allowed");
  });

  // --- S4.8f Acceptance Tests ---

  it("Test 1: NIMs enabled + preferred model works (useResearchModel=true)", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      NIMS_ENABLED: "true",
    });

    global.fetch = createMockFetch({
      "integrate.api.nvidia.com": (url, options) => {
        const body = JSON.parse(options?.body as string);
        if (body.messages?.[0]?.content === "ping") {
          return Promise.resolve({ ok: true } as Response); // Probe success
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: "NIMs Preferred response" } }] }),
        } as Response);
      },
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI fallback response" } }] }),
      } as Response),
    });

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Research query", mode: "llm", useResearchModel: true },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.message.content).toBe("NIMs Preferred response");
    expect(data.provider).toBe("nims");
    expect(data.model).toBe(MOCK_ENV.NIMS_MODEL_PREFERRED);
    expect(data.routeType).toBe("research");
  });

  it("Test 2: Preferred NIMs model fails, fallback works (useResearchModel=true)", async () => {
    restoreEnv(); // Restore original env
    restoreEnv = setupEnv({
      NIMS_MODEL_PREFERRED: "invalid-preferred-model", // Make preferred model fail
      NIMS_MODEL_FALLBACK_1: MOCK_ENV.NIMS_MODEL_FALLBACK_1, // Fallback 1 works
    });

    global.fetch = createMockFetch({
      "integrate.api.nvidia.com": (url, options) => {
        const body = JSON.parse(options?.body as string);
        // Mock probes for all NIMs models
        if (body.messages?.[0]?.content === "ping") {
          if (body.model === "invalid-preferred-model") return Promise.resolve({ ok: false } as Response);
          if (body.model === MOCK_ENV.NIMS_MODEL_FALLBACK_1) return Promise.resolve({ ok: true } as Response);
          if (body.model === MOCK_ENV.NIMS_MODEL_FALLBACK_2) return Promise.resolve({ ok: true } as Response);
        }
        // Mock actual calls
        if (body.model === "invalid-preferred-model") {
          return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve("404 page not found") } as Response);
        }
        if (body.model === MOCK_ENV.NIMS_MODEL_FALLBACK_1) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ choices: [{ message: { content: "NIMs Fallback 1 response" } }] }),
          } as Response);
        }
        return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve("Unhandled NIMs mock") } as Response);
      },
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI response (NIMs fallback)" } }] }),
      } as Response),
    });

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Research query", mode: "llm", useResearchModel: true },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.message.content).toBe("NIMs Fallback 1 response");
    expect(data.provider).toBe("nims");
    expect(data.model).toBe(MOCK_ENV.NIMS_MODEL_FALLBACK_1);
    expect(data.routeType).toBe("research");
  });

  it("Test 3: All NIMs models fail, falls back to primary LLM (useResearchModel=true)", async () => {
    restoreEnv(); // Restore original env
    restoreEnv = setupEnv({
      NIMS_MODEL_PREFERRED: "invalid-preferred",
      NIMS_MODEL_FALLBACK_1: "invalid-fallback-1",
      NIMS_MODEL_FALLBACK_2: "invalid-fallback-2",
    });

    global.fetch = createMockFetch({
      "integrate.api.nvidia.com": () => Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve("404 page not found") } as Response),
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI response (NIMs fallback)" } }] }),
      } as Response),
    });

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Research query", mode: "llm", useResearchModel: true },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.message.content).toBe("OpenAI response (NIMs fallback)");
    expect(data.provider).toBe("openai");
    expect(data.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(data.routeType).toBe("primary"); // Falls back to primary route
  });

  it("Test 4: NIMS_ENABLED=false, should not call NIMs even if useResearchModel=true", async () => {
    restoreEnv(); // Restore original env
    restoreEnv = setupEnv({
      NIMS_ENABLED: "false", // Disable NIMs
    });

    global.fetch = createMockFetch({
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI response" } }] }),
      } as Response),
    });

    const fetchSpy = jest.spyOn(global, 'fetch');

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Research query", mode: "llm", useResearchModel: true },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.provider).toBe("openai"); // Should use primary LLM
    expect(data.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(data.routeType).toBe("primary");
    // Assert that fetch was never called with a NIMs URL
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining("integrate.api.nvidia.com"), expect.anything());
  });

  // --- S4.8g Acceptance Tests (Mistral) ---

  it("Test 5: Mistral enabled + preferred model works (preferredProvider=mistral)", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      MISTRAL_ENABLED: "true",
    });

    global.fetch = createMockFetch({
      "api.mistral.ai": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "Mistral response" } }] }),
      } as Response),
    });

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Mistral query", mode: "llm", preferredProvider: "mistral" },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.message.content).toBe("Mistral response");
    expect(data.provider).toBe("mistral");
    expect(data.model).toBe(MOCK_ENV.MISTRAL_MODEL_PRIMARY);
    expect(data.routeType).toBe("preferred");
  });

  it("Test 6: Mistral fails (401/404) and falls back to OpenAI (preferredProvider=mistral)", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      MISTRAL_ENABLED: "true",
    });

    global.fetch = createMockFetch({
      "api.mistral.ai": () => Promise.resolve({ ok: false, status: 401, text: () => Promise.resolve("Unauthorized") } as Response),
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI fallback response" } }] }),
      } as Response),
    });

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Mistral query", mode: "llm", preferredProvider: "mistral" },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.message.content).toBe("OpenAI fallback response");
    expect(data.provider).toBe("openai");
    expect(data.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(data.routeType).toBe("fallback"); // Should be fallback
  });

  it("Test 7: MISTRAL_ENABLED=false, should not call Mistral even if preferredProvider=mistral", async () => {
    restoreEnv();
    restoreEnv = setupEnv({
      MISTRAL_ENABLED: "false",
    });

    global.fetch = createMockFetch({
      "openai.com": () => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: "OpenAI response" } }] }),
      } as Response),
    });

    const fetchSpy = jest.spyOn(global, 'fetch'); // Spy after setting the mock

    const { req, res } = createMocks({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { input: "Mistral query", mode: "llm", preferredProvider: "mistral" },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.ok).toBe(true);
    expect(data.provider).toBe("openai"); // Should use primary LLM
    expect(data.model).toBe(MOCK_ENV.LLM_PRIMARY_MODEL);
    expect(data.routeType).toBe("primary");
    expect(fetchSpy).not.toHaveBeenCalledWith(expect.stringContaining("api.mistral.ai"), expect.anything());
  });});
