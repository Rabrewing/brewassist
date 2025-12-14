import { callBrewassist } from "./helpers/brewassistTestClient";
import * as toolbeltConfig from "../lib/toolbeltConfig";
import * as toolbeltGuard from "../lib/toolbeltGuard";

jest.mock("../lib/toolbeltConfig", () => ({
  ...jest.requireActual("../lib/toolbeltConfig"),
  computeToolbeltRules: jest.fn(),
}));

jest.mock("../lib/toolbeltGuard", () => ({
  ...jest.requireActual("../lib/toolbeltGuard"),
  getPermissionForRisk: jest.fn(),
}));

/**
 * Provider mocks:
 * Update these module paths to match your repo.
 * Goal: ensure chat calls succeed deterministically without real API keys.
 */
jest.mock("../lib/brewassist-engine", () => ({
  ...jest.requireActual("../lib/brewassist-engine"),
  runBrewAssistEngine: jest.fn(async (opts: any) => {
    // Default successful response for chat modes
    return {
      result: {
        role: "assistant",
        content: `Mocked response for mode: ${opts.mode}`,
      },
      provider: "mock-provider",
      model: "mock-model",
      routeType: "primary",
      latencyMs: 100,
      modelRoleUsed: opts.mode,
      truth: {
        version: "mock",
        truthScore: 0.9,
        riskLevel: "low",
        flags: [],
        notes: "Mocked truth report",
      },
      blockedByTruth: false,
    };
  }),
}));

jest.mock("../lib/toolbeltConfig", () => ({
  ...jest.requireActual("../lib/toolbeltConfig"),
  computeToolbeltRules: jest.fn(),
  getToolRule: jest.fn(), // Mock getToolRule
}));


describe("BrewAssist Chain Gates (S4.8–S4.10)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for computeToolbeltRules
    (toolbeltConfig.computeToolbeltRules as jest.Mock).mockReturnValue({
      // Simulate rules that generally allow actions unless explicitly blocked
      'write_single': 'allowed',
      'write_multi': 'allowed',
      'read': 'allowed',
    });
    // Default mock for getPermissionForRisk
    (toolbeltGuard.getPermissionForRisk as jest.Mock).mockReturnValue('allowed');
    // Default mock for getToolRule
    (toolbeltConfig.getToolRule as jest.Mock).mockReturnValue({
      enabled: true,
      safety: 'write_single', // Default to a write action
      requireGepHeader: false,
    });
  });
  // G1: Contract — valid payload -> 200
  test("G1 Contract: valid payload returns 200", async () => {
    const r = await callBrewassist({ input: "hello", mode: "LLM" });
    expect(r.status).toBe(200);
  });

  // G2: Contract — missing input -> 400
  test("G2 Contract: missing input returns 400", async () => {
    const r = await callBrewassist({ mode: "LLM" });
    expect(r.status).toBe(400);
  });

  // G3: Customer chat -> 200
  test("G3 Mode: customer chat returns 200", async () => {
    const r = await callBrewassist({
      input: "hello",
      mode: "LLM",
      cockpitMode: "customer",
      tier: "T1_SAFE",
    });
    expect(r.status).toBe(200);
  });

  // G4: Admin chat -> 200
  test("G4 Mode: admin chat returns 200", async () => {
    const r = await callBrewassist({
      input: "hello",
      mode: "LLM",
      cockpitMode: "admin",
      tier: "T2_GUIDED",
    });
    expect(r.status).toBe(200);
  });

  /**
   * Tool tests:
   * These rely on your API/toolbelt contract. If your handler uses different fields
   * than toolRequest/confirmApply, adjust payload accordingly but keep the gate intent.
   */

  // G5: Customer tool attempt blocked -> 403 or 412
  test("G5 Toolbelt: customer tool attempt is blocked (403/412)", async () => {
    (toolbeltGuard.getPermissionForRisk as jest.Mock).mockReturnValue('blocked');
    const r = await callBrewassist({
      input: "create a file test.txt with hello",
      mode: "TOOL",
      cockpitMode: "customer",
      tier: "T1_SAFE",
      mcpToolId: "write_file", // Add mcpToolId to trigger toolbelt logic in handler
      mcpAction: "write_single", // Add mcpAction
      toolRequest: { type: "write_file", path: "test.txt", content: "hello" },
    });
    expect([403, 412]).toContain(r.status);
  });

  // G6: Admin tool without confirmation -> 409
  test("G6 Toolbelt: admin tool requires confirmation (409)", async () => {
    (toolbeltGuard.getPermissionForRisk as jest.Mock).mockReturnValue('needs_confirm');
    const r = await callBrewassist({
      input: "apply a patch",
      mode: "TOOL",
      cockpitMode: "admin",
      tier: "T3_APPLY",
      confirmApply: false,
      mcpToolId: "apply_patch", // Add mcpToolId
      mcpAction: "write_single", // Assuming apply_patch is a write_single action
      toolRequest: { type: "apply_patch", patch: "diff --git a/x b/x" },
    });
    expect(r.status).toBe(409);
  });

  // G7: Admin tool with confirmation -> 200 or 202 (proposal/executed)
  test("G7 Toolbelt: admin tool with confirmation allowed (200/202)", async () => {
    (toolbeltGuard.getPermissionForRisk as jest.Mock).mockReturnValue('allowed');
    const r = await callBrewassist({
      input: "apply a patch",
      mode: "TOOL",
      cockpitMode: "admin",
      tier: "T3_APPLY",
      confirmApply: true,
      mcpToolId: "apply_patch", // Add mcpToolId
      mcpAction: "write_single", // Assuming apply_patch is a write_single action
      toolRequest: { type: "apply_patch", patch: "diff --git a/x b/x" },
    });
    expect([200, 202]).toContain(r.status);
  });

  // G8: Router integrity — enabled providers + chat lane must NOT yield zero routes
  test("G8 Router: chat lane never returns zero routes when providers enabled", async () => {
    process.env.USE_OPENAI = "true";
    process.env.USE_GEMINI = "true";
    process.env.USE_MISTRAL = "true";

    const r = await callBrewassist({
      input: "router integrity check",
      mode: "LLM",
      cockpitMode: "admin",
      tier: "T2_GUIDED",
    });

    expect(r.status).toBe(200);

    const blob = JSON.stringify(r.json ?? r.raw ?? "");
    expect(blob).not.toMatch(/zero routesToTry/i);
    expect(blob).not.toMatch(/No routesToTry/i);
  });
});
