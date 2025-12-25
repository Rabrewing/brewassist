import handler from "../../pages/api/brewassist";
import { runBrewAssistEngineStream } from "@/lib/brewassist-engine";

jest.mock("@/lib/brewassist-engine", () => ({
  runBrewAssistEngineStream: jest.fn(),
}));

const mockRunBrewAssistEngineStream = runBrewAssistEngineStream as jest.MockedFunction<typeof runBrewAssistEngineStream>;

function makeRes() {
  const headers: Record<string, string> = {};
  const writes: string[] = [];
  let _jsonBody: any = undefined;

  const res: any = {
    statusCode: 200,
    _jsonBody: undefined,

    setHeader: (k: string, v: any) => {
      headers[k.toLowerCase()] = String(v);
    },
    getHeader: (k: string) => headers[String(k).toLowerCase()],

    writeHead: (code: number, h?: Record<string, any>) => {
      res.statusCode = code;
      if (h) for (const [k, v] of Object.entries(h)) res.setHeader(k, v);
      return res;
    },

    flushHeaders: () => true,

    write: (chunk: any) => {
      writes.push(String(chunk ?? ""));
      return true;
    },
    end: jest.fn(() => true), // Mock res.end to track calls

    status: (code: number) => {
      res.statusCode = code;
      return res;
    },
    json: (body: any) => {
      _jsonBody = body;
      res.setHeader("Content-Type", "application/json");
      return res;
    },
    _getJSON: () => _jsonBody,
  };

  return { res, headers, writes };
}

function extractSseEvents(raw: string): any[] {
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
    events.push(JSON.parse(json));
  }

  return events;
}

describe("BrewAssist Agent/Loop Liveness Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers(); // Use fake timers for controlling setTimeout
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Clear any pending timers
    jest.useRealTimers(); // Restore real timers
  });

  it('should return a valid, terminating SSE stream for mode="agent" when engine completes', async () => {
    mockRunBrewAssistEngineStream.mockImplementation((config, onChunk, onEnd) => {
      onChunk("some text from agent");
      onEnd({ provider: "mockAgentProvider", model: "mockAgentModel" });
      return Promise.resolve(); // Resolve immediately
    });

    const req: any = {
      method: "POST",
      headers: { "x-brewassist-mode": "admin" },
      body: {
        input: "hello",
        mode: "AGENT",
      },
    };

    const { res, writes, headers } = makeRes();
    const handlerPromise = handler(req, res);
    await handlerPromise; // Wait for the handler to complete its execution
    await jest.runAllTimers(); // Then run all timers

    expect(headers["content-type"]).toContain("text/event-stream");

    const raw = writes.join("");
    const events = extractSseEvents(raw);

    const chunks = events.filter((e) => e.type === "chunk");
    const endEvents = events.filter((e) => e.type === "end");

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].text).toContain("some text from agent");

    expect(endEvents.length).toBe(1);
    expect(endEvents[0].payload.provider).toBe("mockAgentProvider");
    expect(endEvents[0].payload.model).toBe("mockAgentModel");
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('should return a valid, terminating SSE stream for mode="LOOP" when engine completes', async () => {
    mockRunBrewAssistEngineStream.mockImplementation((config, onChunk, onEnd) => {
      onChunk("some text from loop");
      onEnd({ provider: "mockLoopProvider", model: "mockLoopModel" });
      return Promise.resolve(); // Resolve immediately
    });

    const req: any = {
      method: "POST",
      headers: { "x-brewassist-mode": "admin" },
      body: {
        input: "hello",
        mode: "LOOP",
      },
    };

    const { res, writes, headers } = makeRes();
    const handlerPromise = handler(req, res);
    await handlerPromise; // Wait for the handler to complete its execution
    await jest.runAllTimers(); // Then run all timers

    expect(headers["content-type"]).toContain("text/event-stream");

    const raw = writes.join("");
    const events = extractSseEvents(raw);

    const chunks = events.filter((e) => e.type === "chunk");
    const endEvents = events.filter((e) => e.type === "end");

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].text).toContain("some text from loop");

    expect(endEvents.length).toBe(1);
    expect(endEvents[0].payload.provider).toBe("mockLoopProvider");
    expect(endEvents[0].payload.model).toBe("mockLoopModel");
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('should return a "not wired yet" message and end event if AGENT engine hangs', async () => {
    mockRunBrewAssistEngineStream.mockImplementation(async (config, onChunk, onEnd) => {
      // Simulate hanging by not calling onChunk or onEnd
      await new Promise(() => {}); // Never resolves
    });

    const req: any = {
      method: "POST",
      headers: { "x-brewassist-mode": "admin" },
      body: {
        input: "hello",
        mode: "AGENT",
      },
    };

    const { res, writes, headers } = makeRes();
    const handlerPromise = handler(req, res);

    jest.advanceTimersByTime(10000); // Advance timers by the timeout duration

    await handlerPromise;

    expect(headers["content-type"]).toContain("text/event-stream");

    const raw = writes.join("");
    const events = extractSseEvents(raw);

    const chunks = events.filter((e) => e.type === "chunk");
    const endEvents = events.filter((e) => e.type === "end");

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].text).toContain("Agent/Loop mode is not fully wired yet.");

    expect(endEvents.length).toBe(1);
    expect(endEvents[0].payload.provider).toBe("BrewAssist");
    expect(endEvents[0].payload.model).toBe("Fallback");
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('should return a "not wired yet" message and end event if LOOP engine hangs', async () => {
    mockRunBrewAssistEngineStream.mockImplementation(async (config, onChunk, onEnd) => {
      // Simulate hanging by not calling onChunk or onEnd
      await new Promise(() => {}); // Never resolves
    });

    const req: any = {
      method: "POST",
      headers: { "x-brewassist-mode": "admin" },
      body: {
        input: "hello",
        mode: "LOOP",
      },
    };

    const { res, writes, headers } = makeRes();
    const handlerPromise = handler(req, res);

    jest.advanceTimersByTime(10000); // Advance timers by the timeout duration

    await handlerPromise;

    expect(headers["content-type"]).toContain("text/event-stream");

    const raw = writes.join("");
    const events = extractSseEvents(raw);

    const chunks = events.filter((e) => e.type === "chunk");
    const endEvents = events.filter((e) => e.type === "end");

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].text).toContain("Agent/Loop mode is not fully wired yet.");

    expect(endEvents.length).toBe(1);
    expect(endEvents[0].payload.provider).toBe("BrewAssist");
    expect(endEvents[0].payload.model).toBe("Fallback");
    expect(res.end).toHaveBeenCalledTimes(1);
  });
});
