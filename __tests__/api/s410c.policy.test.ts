import handler from "@/pages/api/brewassist";
import { createMocks } from "node-mocks-http";

describe("S4.10c API policy contract", () => {
  test("responds with truth + policy decision fields", async () => {
    const { req, res } = createMocks({
      method: "POST",
      url: "/api/brewassist",
      body: {
        input: "Explain what S4.10c means in BrewAssist.",
        mode: "llm",
        cockpitMode: "customer",
        toolbeltTier: "T1_SAFE",
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);

    const json = JSON.parse(res._getData());

    // Truth present
    expect(json.truth || json.brewTruth || json.meta?.truth).toBeTruthy();

    // Policy decision present
    expect(json.policy || json.handshake || json.meta?.policy).toBeTruthy();
  }, 15000); // Increase timeout to 15 seconds
});