// pages/api/brewassist.ts
import type { NextApiRequest, NextApiResponse } from "next";

type BrewAssistRequestBody = {
  message: string;
  mode?: "hrm" | "llm" | "agent" | "loop";
};

type BrewAssistResponseBody = {
  reply: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BrewAssistResponseBody | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as BrewAssistRequestBody | undefined;

  // 🔒 Strict, but predictable: we know exactly when 400 happens.
  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return res.status(400).json({ error: "Missing `message` in request body" });
  }

  const mode = body.mode ?? "llm";

  // ⚠️ TEMP STUB — Phase 1
  // Later we replace this with the real chain again.
  const reply = `BrewAssist (stub, mode: ${mode}) heard: ${body.message}`;

  return res.status(200).json({ reply });
}