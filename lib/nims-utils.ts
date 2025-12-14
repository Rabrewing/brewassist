// lib/nims-utils.ts

// 1-token health check for NIMs models
export async function probeNimsModel(model: string): Promise<boolean> {
  const NIMS_API_KEY = process.env.NIMS_API_KEY;
  const NIMS_BASE_URL = process.env.NIMS_BASE_URL?.replace(/\/+$/, "") || "https://integrate.api.nvidia.com/v1";

  if (!NIMS_API_KEY) {
    console.warn("NIMs API key not set for probe.");
    return false;
  }

  try {
    const res = await fetch(`${NIMS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NIMS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1
      }),
      signal: AbortSignal.timeout(Number(process.env.NIMS_TIMEOUT_MS ?? 5000)) // 5 second timeout for probe
    });

    // We only care if it's OK (200-299). 400s, 401s, 404s all mean it's not working for us.
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`NIMs probe failed for model ${model}: ${res.status} ${text.substring(0, 100)}...`);
    }
    return res.ok;
  } catch (error) {
    console.warn(`NIMs probe network error for model ${model}:`, (error as Error).message);
    return false;
  }
}

// Finds the first working NIMs model from a list of env keys
export async function pickNimsModel(modelEnvKeys: string[]): Promise<string | null> {
  if (process.env.NIMS_ENABLED !== "true") {
    console.log("NIMs is disabled via NIMS_ENABLED env var.");
    return null;
  }

  const modelsToProbe = modelEnvKeys
    .map(key => process.env[key])
    .filter(Boolean) as string[];

  for (const model of modelsToProbe) {
    console.log(`Probing NIMs model: ${model}`);
    const ok = await probeNimsModel(model);
    if (ok) {
      console.log(`NIMs model ${model} is active.`);
      return model;
    }
  }

  console.warn("No active NIMs model found from configured list.");
  return null; // No working NIMs model found
}
