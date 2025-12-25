// __tests__/helpers/sse.ts

export function collectSseWrites(writeMock: jest.Mock) {
  return writeMock.mock.calls.map(c => String(c[0])).join("");
}

export function parseSseEvents(raw: string) {
  const chunks = raw.split("\n\n").map(s => s.trim()).filter(Boolean);

  const events = [];
  for (const chunk of chunks) {
    const line = chunk.split("\n").find(l => l.startsWith("data: "));
    if (!line) continue;
    const json = line.replace(/^data:\s*/, "");
    try {
      events.push(JSON.parse(json));
    } catch (e) {
      console.error("Error parsing SSE event JSON:", e, "Raw JSON:", json);
    }
  }
  return events;
}

export function reconstructContentFromEvents(events: any[]) {
  return events
    .filter(e => e && (e.type === "chunk" || e.type === "delta" || e.text || e.delta || e.content))
    .map(e => e.text ?? e.delta ?? e.content ?? e.payload ?? "")
    .join("");
}

export function getLastEventPayload(events: any[]) {
  const lastEvent = events[events.length - 1];
  if (lastEvent && lastEvent.type === 'end') {
    return lastEvent.payload; // Assuming the 'end' event might carry a final payload
  }
  return null;
}

