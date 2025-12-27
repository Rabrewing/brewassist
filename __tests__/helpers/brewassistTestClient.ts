import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/brewassist";
import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/brewassist";
import { collectSseWrites, parseSseEvents, reconstructContentFromEvents } from "./sseTestUtils";

/**
 * Call /api/brewassist handler directly (no network).
 * Returns status + raw + parsed json (if possible).
 */
export async function callBrewassist(body: any, headers: Record<string, string> = {}) {
  let _statusCode: number | undefined;
  let _jsonBody: any | undefined;

  const { req } = createMocks({
    method: "POST",
    url: "/api/brewassist",
    headers: { "Content-Type": "application/json", ...headers },
    body: {
      ...body,
      truthScore: body.truthScore,
      truthFlags: body.truthFlags,
    },
  });

  const res: any = {
    setHeader: jest.fn(),
    flushHeaders: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    status: jest.fn((code: number) => {
      _statusCode = code;
      return res;
    }),
    json: jest.fn((obj: any) => {
      _jsonBody = obj;
      return res;
    }),
    // Mock _getStatusCode to return the captured status code
    _getStatusCode: () => _statusCode,
  };

  await handler(req as any, res as any);

  // Determine resStatus
  const resStatus =
    (res as any).statusCode ??
    (res as any)._getStatusCode?.() ??
    (res as any)._getStatus?.() ??
    200;

  let content = "";
  let events: any[] = [];
  let raw = "";

  if (_jsonBody) {
    // If _jsonBody exists (blocked / error JSON)
    raw = JSON.stringify(_jsonBody);
    content = _jsonBody.text ?? "";
    events = [];
  } else if (res.write.mock.calls.length > 0) {
    // If SSE writes exist
    raw = res.write.mock.calls.map(c => String(c[0] ?? "")).join("");
    
    // Parse SSE events
    const blocks = raw.split("\n\n").map((s) => s.trim()).filter(Boolean);
    for (const b of blocks) {
      const line = b.split("\n").find((l) => l.startsWith("data: "));
      if (!line) continue;
      const json = line.replace(/^data:\s*/, "");
      try {
        events.push(JSON.parse(json));
      } catch (e) {
        console.error("Error parsing JSON from SSE chunk in callBrewassist:", e, json);
      }
    }

    // Reconstruct content from events
    const chunkText = events
      .filter(e => e?.type === "chunk" && typeof e.text === "string")
      .map(e => e.text)
      .join("");

    if (chunkText) {
      content = chunkText;
    } else {
      const endEvent = [...events].reverse().find(e => e?.type === "end");
      content = typeof endEvent?.payload?.text === "string" ? endEvent.payload.text : "";
    }
  }

  return { resStatus, content, events, raw, json: _jsonBody };
}
