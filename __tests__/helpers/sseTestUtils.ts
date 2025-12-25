export function collectSseWrites(writeMock: jest.Mock) {
  return writeMock.mock.calls.map((c) => String(c[0])).join("");
}

export function parseSseEvents(raw: string) {
  const blocks = raw.split("\n\n").map((s) => s.trim()).filter(Boolean);
  const events: any[] = [];

  for (const b of blocks) {
    const line = b.split("\n").find((l) => l.startsWith("data: "));
    if (!line) continue;
    const json = line.replace(/^data:\s*/, "");
    events.push(JSON.parse(json));
  }

  return events;
}

export function reconstructContentFromEvents(events: any[]) {
  return events
    .filter((e) => e && (e.type === "chunk" || e.type === "delta" || e.text || e.delta || e.content))
    .map((e) => e.text ?? e.delta ?? e.content ?? "")
    .join("");
}

export function buildSseStream(data: unknown) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export function buildReadableStreamFromString(s: string) {
  const { ReadableStream } = require("node:stream/web");
  const encoder = new TextEncoder();
  const bytes = encoder.encode(String(s || ""));

  return new ReadableStream({
    start(controller: any) {
      controller.enqueue(bytes);     // ✅ Uint8Array
      controller.close();
    },
  });
}