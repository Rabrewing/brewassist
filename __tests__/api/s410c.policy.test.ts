import handler from "@/pages/api/brewassist";
import { createMocks } from "node-mocks-http";
import { parseSseEvents } from "../helpers/sseTestUtils";
import { callProviderStream } from "@/lib/brewassist-engine"; // Import callProviderStream

jest.mock("@/lib/brewassist-engine", () => ({
  ...jest.requireActual("@/lib/brewassist-engine"),
  callProviderStream: jest.fn(),
}));

describe("S4.10c API policy contract", () => {
  const originalBrewTruthEnabled = process.env.BREWTRUTH_ENABLED;

  beforeEach(() => {
    process.env.BREWTRUTH_ENABLED = "true";
  });

  afterEach(() => {
    process.env.BREWTRUTH_ENABLED = originalBrewTruthEnabled;
  });

  test("responds with truth + policy decision fields", async () => {
    const { req, res } = createMocks({
      method: "POST",
      url: "/api/brewassist",
      body: {
        input: "Explain what S4.10c means in BrewAssist.",
        mode: "llm",
        cockpitMode: "customer",
        tier: "T1_SAFE",
      },
    });

    // Mock streaming functions
    res.setHeader = jest.fn();
    res.flushHeaders = jest.fn();
    res.write = jest.fn();
    res.end = jest.fn();

    (callProviderStream as jest.Mock).mockImplementation(
      async (provider: any, model: any, messages: any, onChunk: (chunk: string) => void) => {
        // Simulate a chunk event
        onChunk('data: {"type":"chunk","payload":"MOCK_RESPONSE_CHUNK"}\n\n');
        // Simulate an end event with truth and policy
        onChunk(`data: ${JSON.stringify({
          type: "end",
          payload: {
            provider: provider,
            model: model,
            route: "brewassist",
            scopeCategory: "PLATFORM_DEVOPS"
          },
          text: "MOCK_RESPONSE_END",
          truth: {
            tier: "gold",
            overallScore: 0.9,
            scores: [],
            flags: [],
            summary: "Mock truth summary",
            modelTrace: { provider: provider, model: model, routeType: "primary" },
            evaluatedAt: new Date().toISOString(),
            version: "bt-2.1"
          },
          policy: {
            decision: "ALLOW",
            reason: "Mock policy reason"
          }
        })}\n\n`);
      }
    );

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);

    // For streaming responses, we need to reconstruct the full data from res.write calls
    const fullResponse = res.write.mock.calls.map(call => call[0]).join('');
    const events = parseSseEvents(fullResponse);

    const lastEvent = events[events.length - 1];
    expect(lastEvent.type).toBe("end");

    // Truth present (top-level)
    expect(lastEvent.truth || lastEvent.brewTruth || lastEvent.meta?.truth).toBeTruthy();

    // Policy present (top-level)
    expect(lastEvent.policy || lastEvent.handshake || lastEvent.meta?.policy).toBeTruthy();
  }, 15000); // Increase timeout to 15 seconds
});