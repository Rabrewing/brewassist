// __tests__/api/brewassist.test.ts

import { createMocks } from "node-mocks-http";
// Adjust this import based on your jest/tsconfig setup.
// If you have `baseUrl: "src"` or `@` alias, you can use "@/pages/api/brewassist".
import handler from "../../pages/api/brewassist";

describe("12.10 BrewAssist API (Jest)", () => {
  it("returns structured BrewAssist JSON for a valid prompt", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        prompt: "Explain recursion",
        mode: "auto",
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);

    const data = JSON.parse(res._getData());

    // 12.10 core contract
    const hasCoreOutput =
      typeof data.output === "string" ||
      typeof data.narrative === "string" ||
      typeof data?.plan?.llm === "string";

    expect(hasCoreOutput).toBe(true);
    expect(typeof data.tone).toBe("string");
    expect(typeof data.emoji).toBe("string");
    expect(typeof data.persona).toBe("string");
    expect(Array.isArray(data.chain)).toBe(true);

    // Optional: sanity-check stubbed persona/chain
    expect(data.persona).toBe("contributor");
    expect(data.chain).toEqual(["gemini", "hrm", "grok", "mistral"]);
  });

  it("returns 400 when prompt is missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        mode: "auto",
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(400);
    const data = JSON.parse(res._getData());
    expect(data.error).toBeDefined();
  });

  it("returns 405 for non-POST methods", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(405);
    const data = JSON.parse(res._getData());
    expect(data.error).toBe("Method not allowed");
  });
});
