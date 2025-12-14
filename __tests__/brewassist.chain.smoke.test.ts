/**
 * Goal: prove BrewAssist chain is alive:
 * - handler executes
 * - provider #1 fails
 * - provider #2 succeeds
 * - toolbelt does NOT block normal chat
 *
 * This test mocks the global `fetch` function to simulate provider responses
 * because the current engine architecture centralizes API calls rather than
 * using separate, mockable provider modules.
 */

import handler from "@/pages/api/brewassist";
import { createMocks } from "node-mocks-http";

// Spy on the global fetch function
const fetchSpy = jest.spyOn(global, 'fetch');

describe("BrewAssist chain smoke", () => {
  beforeEach(() => {
    // Reset the mock before each test
    fetchSpy.mockClear();
  });

  it("falls back from OpenAI -> Gemini and returns 200", async () => {
    fetchSpy.mockImplementation(async (url, options) => {
      const urlString = url.toString();

      // Simulate OpenAI failure
      if (urlString.includes("api.openai.com")) {
        console.log("[TEST_MOCK] Simulating OpenAI failure");
        return Promise.reject(new Error("OPENAI_DOWN_FOR_TEST"));
      }

      // Simulate Gemini success
      if (urlString.includes("generativelanguage.googleapis.com")) {
        console.log("[TEST_MOCK] Simulating Gemini success");
        return Promise.resolve(new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: "OK_FROM_GEMINI" }],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ));
      }

      // Fallback for any other fetch calls
      return Promise.reject(new Error(`Unexpected fetch call to ${urlString}`));
    });

    const { req, res } = createMocks({
      method: "POST",
      url: "/api/brewassist",
      body: {
        input: "hello",
        mode: "llm",
        toolbeltTier: "T1_SAFE",
        confirmApply: false,
      },
    });

    await handler(req as any, res as any);

    expect(res._getStatusCode()).toBe(200);

    const json = JSON.parse(res._getData());
    expect(json).toBeTruthy();
    expect(json.message.content).toContain("OK_FROM_GEMINI"); // proves fallback succeeded
    expect(json.provider).toBe("gemini"); // Verify fallback occurred
  });

  it("does NOT block safe chat due to Toolbelt", async () => {
    // For this test, we only need a single successful provider call.
    fetchSpy.mockImplementation(async (url, options) => {
       const urlString = url.toString();
      if (urlString.includes("api.openai.com")) {
         console.log("[TEST_MOCK] Simulating OpenAI success for safe chat test");
         return Promise.resolve(new Response(
          JSON.stringify({
            choices: [{ message: { content: "SAFE_CHAT_OK" } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        ));
      }
       return Promise.reject(new Error(`Unexpected fetch call to ${urlString}`));
    });


    const { req, res } = createMocks({
      method: "POST",
      url: "/api/brewassist",
      body: {
        input: "Explain what a Next.js API route is",
        mode: "llm", // Using a simple mode
        toolbeltTier: "T1_SAFE",
      },
    });

    await handler(req as any, res as any);

    // If this returns 403/412/etc, your Toolbelt/Gatekeeper is likely over-blocking.
    expect(res._getStatusCode()).toBe(200);
    const json = JSON.parse(res._getData());
    expect(json.message.content).toContain("SAFE_CHAT_OK");
  });
});
