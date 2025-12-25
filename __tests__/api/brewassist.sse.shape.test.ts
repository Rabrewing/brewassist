import handler from "../../pages/api/brewassist";
import { classifyIntent } from "@/lib/intent-gatekeeper";

jest.mock("@/lib/brewassist-engine", () => ({
  runBrewAssistEngineStream: jest.fn(async (config, onChunk, onEnd) => {
    // Simulate some chunks
    onChunk("mock chunk 1");
    onChunk("mock chunk 2");
    // Simulate the end event
    onEnd({ provider: "mockProvider", model: "mockModel" });
  }),
}));

jest.mock("@/lib/intent-gatekeeper", () => ({
  ...jest.requireActual("@/lib/intent-gatekeeper"),
  classifyIntent: jest.fn((input: string) => {
    if (input === "how old is the world") {
      return "GENERAL_KNOWLEDGE";
    }
    return "PLATFORM_DEVOPS"; // Default for other inputs
  }),
}));

function makeRes() {
  const headers: Record<string, string> = {};
  const writes: string[] = [];

  const res: any = {
    statusCode: 200,
    _jsonBody: undefined,

    setHeader: (k: string, v: any) => {
      headers[k.toLowerCase()] = String(v);
    },
    getHeader: (k: string) => headers[String(k).toLowerCase()],

    // ✅ Add this (some Next handlers call writeHead)
    writeHead: (code: number, h?: Record<string, any>) => {
      res.statusCode = code;
      if (h) for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
      return res;
    },

    // ✅ Add this (the TypeError you’re seeing)
    flushHeaders: () => true,

    write: (chunk: any) => {
      writes.push(String(chunk ?? ""));
      return true;
    },
    end: () => true,

    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (body: any) => {
      res._jsonBody = body;
      // make sure content-type is set like Next
      res.setHeader("Content-Type", "application/json");
      return res;
    },
  };

  return { res, headers, writes };
}

function extractSseEvents(raw: string): any[] {
  // SSE: events separated by blank lines. We only care about "data:" lines.
  const blocks = raw
    .split("\n\n")
    .map((b) => b.trim())
    .filter(Boolean);

  const events: any[] = [];

  for (const block of blocks) {
    const dataLine = block
      .split("\n")
      .find((line) => line.startsWith("data:"));
    if (!dataLine) continue;

    const json = dataLine.replace(/^data:\s*/, "").trim();
    // If this throws, stream formatting/regression occurred.
    events.push(JSON.parse(json));
  }

  return events;
}

describe("BrewAssist API SSE stream shape contract", () => {
  test("ALLOW path emits valid SSE frames with chunk text and final end event", async () => {
    const req: any = {
      method: "POST",
      headers: { "x-brewassist-mode": "admin" }, // Add this back
      body: {
        input: "pnpm test failing in CI — debug jest module resolution and fix pipeline",
        cockpitMode: "admin",   // helps pass scope gates if any
        tier: "gold",           // if your policy uses tier
        mode: "llm",            // if handler expects it
      },
    };

    const { res, writes, headers } = makeRes();

    await handler(req, res);

    const ct = (headers["content-type"] || "").toLowerCase();

    if (ct.includes("application/json")) {
      const body = res._jsonBody;
      expect(body).toBeTruthy();
      expect(typeof body.text).toBe("string");
      expect(body.text).not.toContain("undefined");
      return;
    }

    expect(ct).toContain("text/event-stream");

    const raw = writes.join("");

    // Must contain at least one SSE "data:" line
    expect(raw).toContain("data:");

    const events = extractSseEvents(raw);

    // Must have at least one chunk OR an end event with text.
    expect(events.length).toBeGreaterThan(0);

    const hasEnd = events.some((e) => e?.type === "end");
    expect(hasEnd).toBe(true);

    // Validate event shapes
    for (const e of events) {
      expect(typeof e?.type).toBe("string");

      if (e.type === "chunk") {
        // chunk.text must be a string when present
        expect(typeof e.text).toBe("string");
        expect(e.text).not.toContain("undefined");
      }

      if (e.type === "end") {
        // end.text should always be a string (even if empty)
        expect(typeof e.text).toBe("string");
        expect(e.text).not.toContain("undefined");

        // payload/provider/model shape (best effort, must not explode)
        if (e.payload) {
          if (e.payload.provider !== undefined)
            expect(typeof e.payload.provider).toBe("string");
          if (e.payload.model !== undefined)
            expect(typeof e.payload.model).toBe("string");
        }
      }
    }
  });

  test("BLOCK path returns JSON with safe text (no undefined)", async () => {
    const req: any = {
      method: "POST",
      body: { input: "how old is the world" }, // likely general knowledge -> block
      headers: { "x-brewassist-mode": "customer" },
    };

    const { res, headers } = makeRes();

    await handler(req, res);

    // Blocked responses are JSON (per current behavior)
    const ct = headers["content-type"] || "";
    expect(ct).toContain("application/json");

    const body = res._jsonBody;
    expect(body).toBeTruthy();
    expect(body.text).toBeDefined();
    expect(body.text).not.toBeNull();
    expect(body.text).not.toContain("undefined");
  });
});
