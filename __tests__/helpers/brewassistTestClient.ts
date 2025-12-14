import { createMocks } from "node-mocks-http";
import handler from "../../pages/api/brewassist";

/**
 * Call /api/brewassist handler directly (no network).
 * Returns status + raw + parsed json (if possible).
 */
export async function callBrewassist(body: any) {
  const { req, res } = createMocks({
    method: "POST",
    url: "/api/brewassist",
    headers: { "Content-Type": "application/json" },
    body,
  });

  await handler(req as any, res as any);

  const raw = res._getData(); // Get raw data

  let json: any = undefined; // Declare and initialize json
  try {
    json = JSON.parse(raw); // Attempt to parse raw data
  } catch {
    json = raw; // If parsing fails, assign raw data
  }

  // Prioritize custom statusCode from json if available, otherwise use response status
  const status = json?.statusCode ?? res._getStatusCode();

  return { status, raw, json };
}
