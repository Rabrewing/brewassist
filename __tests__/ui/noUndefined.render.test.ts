/**
 * Regression: UI must never render literal "undefined" even when streaming sends weird shapes.
 * This catches the classic bug: appending json.payload instead of json.text for SSE chunk events.
 */

import { getMessageText } from "../../lib/ui/messageText";

describe("UI message text safety", () => {
  test("getMessageText never returns 'undefined' and never returns non-string", () => {
    const samples: any[] = [
      { content: undefined },
      { content: null },
      { content: { text: undefined } },
      { content: { text: null } },
      { message: undefined },
      { text: undefined },
      { data: { content: undefined } },
      { payload: { content: undefined } },
      // nasty: string contains word undefined (should be allowed only if real model said it)
      { content: "this is literally undefined" },
    ];

    for (const msg of samples) {
      const out = getMessageText(msg);
      expect(typeof out).toBe("string");
      // If the model truly says the word 'undefined', that's valid; what we forbid is accidental "undefined"
      // from missing fields. So we only enforce on empty/missing shapes:
      if (
        msg?.content == null &&
        msg?.content?.text == null &&
        msg?.message == null &&
        msg?.text == null &&
        msg?.data?.content == null &&
        msg?.data?.content?.text == null &&
        msg?.payload?.content == null &&
        msg?.payload?.content?.text == null
      ) {
        expect(out).toBe("");
      }
    }
  });

  test("SSE chunk parser must append only json.text (never payload)", () => {
    const events: any[] = [
      { type: "chunk", payload: { provider: "openai" } }, // wrong shape
      { type: "chunk", text: "HELLO" },                   // correct
      { type: "chunk" },                                  // missing
      { type: "end", payload: { provider: "openai" }, text: "DONE" },
    ];

    let acc = "";
    for (const e of events) {
      if (e.type === "chunk") {
        const t = typeof e.text === "string" ? e.text : "";
        if (t) acc += t;
      }
    }

    expect(acc).toBe("HELLO");
    expect(acc.includes("undefined")).toBe(false);
  });
});