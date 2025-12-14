import type { NextApiRequest, NextApiResponse } from "next";
import { spawn } from "node:child_process";
 
type Data =
  | { ok: true; engine: string; output: string }
  | { ok: false; error: string; code?: string };
 
function runOverlay(engine: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // NOTE: Update this path if your overlays moved with BrewAssist
    const script = "/home/brewexec/brewexec/overlays/brewsandbox.sh";
    // If overlays are now under brewassist, it might be:
    // const script = "/home/brewexec/brewassist/overlays/brewsandbox.sh";
 
    const args = [engine, prompt];
 
    const child = spawn("bash", [script, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
 
    let out = "";
    let err = "";
 
    child.stdout.on("data", (d) => (out += String(d)));
    child.stderr.on("data", (d) => (err += String(d)));
 
    child.on("error", (e) => reject(e));
    child.on("close", (code) => {
      if (code === 0) return resolve(out.trim());
      reject(new Error(err.trim() || `Sandbox overlay exited with code ${code}`));
    });
  });
}
 
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const { prompt, engine } = (req.body ?? {}) as { prompt?: string; engine?: string };

  // --- Sandbox Protection Logic ---
  const mode = req.headers['x-brewassist-mode'] as string | undefined;
  if (mode !== 'admin') {
    // Ensure brewLast is imported if not already
    const { logSandboxBlocked } = await import('@/lib/brewLast');
    logSandboxBlocked({
      mode: mode || 'undefined',
      path: req.url || '/api/sandbox',
      reason: 'non-admin attempted sandbox',
    });
    res.status(403).json({
      ok: false,
      error: 'Sandbox is available only in Admin mode.',
      code: 'SANDBOX_FORBIDDEN', // Add a code for easier testing
    });
    return;
  }
  // --- End Sandbox Protection Logic ---

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ ok: false, error: "Missing prompt" });
    return;
  }

  const chosen = String(engine || "tiny").toLowerCase();

  return await new Promise<void>((resolve) => {
    runOverlay(chosen, prompt)
      .then((output) => {
        res.status(200).json({ ok: true, engine: chosen, output });
        resolve();
      })
      .catch((e: any) => {
        res.status(500).json({ ok: false, error: e?.message || "Sandbox error" });
        resolve();
      });
  });
}