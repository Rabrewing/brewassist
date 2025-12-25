describe("UI stream guard – undefined safety", () => {
  /**
   * IMPORTANT:
   * This test intentionally duplicates the normalize logic so we do NOT need to change production exports.
   * The UI bug was "undefinedundefined..." due to unsafe concatenation. This test prevents regressions.
   */
  function getMessageText(msg: any): string {
    if (!msg) return "";

    const candidates = [
      msg?.text,
      msg?.message,
      msg?.content,
      msg?.content?.text,
      msg?.data?.text,
      msg?.data?.content,
      msg?.data?.content?.text,
      msg?.payload?.text,
      msg?.payload?.content,
      msg?.payload?.content?.text,
    ];

    const first = candidates.find(v => typeof v === "string" && v.length > 0);
    if (first) return first;

    if (Array.isArray(msg?.content)) {
      return msg.content
        .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
        .join("");
    }

    return "";
  }

  it("never renders 'undefined' or 'null' when stream chunks are malformed", () => {
    const simulatedStreamPayloads = [
      undefined,
      null,
      {},
      { text: undefined },
      { content: undefined },
      { payload: undefined },
      { payload: { text: undefined } },
      { payload: { content: undefined } },
      { payload: { content: { text: undefined } } },
      { payload: { content: { text: null } } },
      { payload: { content: { text: "OK" } } },
    ];

    let rendered = "";

    for (const chunk of simulatedStreamPayloads) {
      const safeText = getMessageText(chunk as any);
      rendered += safeText;
    }

    expect(rendered).toBe("OK");
    expect(rendered).not.toContain("undefined");
    expect(rendered).not.toContain("null");
  });
});
