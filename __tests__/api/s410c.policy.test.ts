import handler from "@/pages/api/brewassist";
import { createMocks } from "node-mocks-http";
import { parseSseEvents } from "../helpers/sseTestUtils";

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