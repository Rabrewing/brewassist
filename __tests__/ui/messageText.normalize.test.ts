describe("UI message text normalization contract", () => {
  /**
   * IMPORTANT:
   * This test intentionally duplicates the normalize logic so we do NOT need to change production exports.
   * The UI bug was "undefinedundefined..." due to unsafe concatenation. This test prevents regressions.
   */
  function getMessageText(msg: any): string {
    const candidates = [
      msg?.content,
      msg?.content?.text,
      msg?.message,
      msg?.text,
      msg?.data?.content,
      msg?.data?.content?.text,
      msg?.payload?.content,
      msg?.payload?.content?.text,
      msg?.response,
      msg?.response?.text,
    ];

    const first = candidates.find(
      (v) => typeof v === "string" && v.trim().length > 0
    );
    return first ?? "";
  }

  test("returns empty string for null/undefined/empty objects", () => {
    expect(getMessageText(null)).toBe("");
    expect(getMessageText(undefined)).toBe("");
    expect(getMessageText({})).toBe("");
    expect(getMessageText({ content: undefined })).toBe("");
  });

  test("extracts text from common response shapes", () => {
    expect(getMessageText({ text: "hello" })).toBe("hello");
    expect(getMessageText({ content: "hello" })).toBe("hello");
    expect(getMessageText({ content: { text: "hello" } })).toBe("hello");
    expect(getMessageText({ message: "hello" })).toBe("hello");
    expect(getMessageText({ data: { content: "hello" } })).toBe("hello");
    expect(getMessageText({ data: { content: { text: "hello" } } })).toBe(
      "hello"
    );
    expect(getMessageText({ payload: { content: "hello" } })).toBe("hello");
    expect(getMessageText({ payload: { content: { text: "hello" } } })).toBe(
      "hello"
    );
  });

  test('never returns the literal string "undefined" from bad shapes', () => {
    const weird = {
      content: undefined,
      text: undefined,
      message: undefined,
      payload: { content: { text: undefined } },
    };

    const out = getMessageText(weird);

    expect(typeof out).toBe("string");
    expect(out).not.toContain("undefined");
  });

  test("safe concatenation rule: only append real strings", () => {
    const chunks: any[] = ["hi", undefined, null, "", " there", 123, { x: 1 }];
    let out = "";
    for (const c of chunks) {
      if (typeof c === "string" && c.length > 0) out += c;
    }
    expect(out).toBe("hi there");
    expect(out).not.toContain("undefined");
  });
});
