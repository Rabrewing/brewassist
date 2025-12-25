/**
 * Safely extracts a displayable string from a message object.
 * This function is crucial for preventing UI bugs where `undefined` or `null`
 * might be rendered or concatenated into a message.
 *
 * @param msg The message object, which can have various shapes.
 * @returns A string to be displayed, or an empty string if no valid text is found.
 */
export function getMessageText(msg: any): string {
  if (!msg) {
    return "";
  }

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

  const first = candidates.find((v) => typeof v === "string" && v.length > 0);
  if (first) {
    return first;
  }

  if (Array.isArray(msg?.content)) {
    return msg.content
      .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
      .join("");
  }

  return "";
}
