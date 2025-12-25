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
const MOCK_TEXT = "MOCK_STREAM_OK";

jest.mock("../lib/brewassist-engine", () => ({
  ...jest.requireActual("../lib/brewassist-engine"),
  runBrewAssistEngineStream: jest.fn(async (_args: any, onChunk: any, onEnd: any) => {
    onChunk?.(MOCK_TEXT); // Emit plain text chunk
    // Simulate the end of the stream with truth and policy
    onEnd?.({ provider: 'mockProvider', model: 'mockModel' }); // onEnd is called by the engine
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
    const r = await callBrewassist({ input: "hello", mode: "LLM" }, { 'x-brewassist-mode': 'admin' });
    expect(r.resStatus).toBe(200);
  });

  // G2: Contract — missing input -> 400
  test("G2 Contract: missing input returns 400", async () => {
    const r = await callBrewassist({ mode: "LLM" }, { 'x-brewassist-mode': 'admin' });
    expect(r.resStatus).toBe(400);
  });

  // G3: Customer chat -> 200
  test("G3 Mode: customer chat returns 200", async () => {
    const r = await callBrewassist({ input: "hello", mode: "LLM", tier: "T1_SAFE", }, { 'x-brewassist-mode': 'customer' });
    expect(r.resStatus).toBe(200);
  });

  // G4: Admin chat -> 200
  test("G4 Mode: admin chat returns 200", async () => {
    const r = await callBrewassist({ input: "hello", mode: "LLM", tier: "T2_GUIDED", }, { 'x-brewassist-mode': 'admin' });
    expect(r.resStatus).toBe(200);
  });

  /**
   * Tool tests:
   * These rely on your API/toolbelt contract. If your handler uses different fields
   * than toolRequest/confirmApply, adjust payload accordingly but keep the gate intent.
   */

  // G5: Customer tool attempt blocked -> 403 or 412
  test("G5 Toolbelt: customer tool attempt is blocked (403/412)", async () => {
    (toolbeltConfig.getToolRule as jest.Mock).mockReturnValue({
      enabled: false,
      safety: 'write_single',
      requireGepHeader: false,
    });
    const r = await callBrewassist({
      input: "create a file test.txt with hello",
      mode: "TOOL",
      tier: "T1_SAFE",
      mcpToolId: "write_file", // Add mcpToolId to trigger toolbelt logic in handler
      mcpAction: "write_single", // Add mcpAction
      toolRequest: { type: "write_file", path: "test.txt", content: "hello" },
    }, { 'x-brewassist-mode': 'customer' });
    expect([403, 412]).toContain(r.resStatus);
  });

  // G6: Admin tool without confirmation -> 409
  test("G6 Toolbelt: admin tool requires confirmation (409)", async () => {
    (toolbeltConfig.getToolRule as jest.Mock).mockReturnValue({
      enabled: true,
      safety: 'write_single',
      requireConfirmation: true,
      requireGepHeader: false,
    });
    const r = await callBrewassist({
      input: "apply a patch",
      mode: "TOOL",
      tier: "T3_APPLY",
      confirmApply: false,
      mcpToolId: "apply_patch", // Add mcpToolId
      mcpAction: "write_single", // Assuming apply_patch is a write_single action
      toolRequest: { type: "apply_patch", patch: "diff --git a/x b/x" },
    }, { 'x-brewassist-mode': 'admin' });
    expect(r.resStatus).toBe(409);
  });

  // G7: Admin tool with confirmation -> 200 or 202 (proposal/executed)
  test("G7 Toolbelt: admin tool with confirmation allowed (200/202)", async () => {
    (toolbeltGuard.getPermissionForRisk as jest.Mock).mockReturnValue('allowed');
    const r = await callBrewassist({
      input: "apply a patch",
      mode: "TOOL",
      tier: "T3_APPLY",
      confirmApply: true,
      mcpToolId: "apply_patch", // Add mcpToolId
      mcpAction: "write_single", // Assuming apply_patch is a write_single action
      toolRequest: { type: "apply_patch", patch: "diff --git a/x b/x" },
    }, { 'x-brewassist-mode': 'admin' });
    expect([200, 202]).toContain(r.resStatus);
  });

  // G8: Router integrity — enabled providers + chat lane must NOT yield zero routes
  test("G8 Router: chat lane never returns zero routes when providers enabled", async () => {
    process.env.USE_OPENAI = "true";
    process.env.USE_GEMINI = "true";
    process.env.USE_MISTRAL = "true";

    const r = await callBrewassist({
      input: "router integrity check",
      mode: "LLM",
      tier: "T2_GUIDED",
    }, { 'x-brewassist-mode': 'admin' });

    expect(r.resStatus).toBe(200);

    const blob = JSON.stringify(r.json ?? r.raw ?? "");
    expect(blob).not.toMatch(/zero routesToTry/i);
    expect(blob).not.toMatch(/No routesToTry/i);
  });

  // G9: Customer MCP execution attempt is blocked (403)
  test("G9 Toolbelt: customer MCP execution attempt is blocked (403)", async () => {
    (toolbeltConfig.getToolRule as jest.Mock).mockReturnValue({
      enabled: false,
      safety: 'single-file-write', // This is a write action
      requireGepHeader: false,
    });

    const r = await callBrewassist({
      input: "create a file test.txt with hello",
      mode: "TOOL",
      tier: "T1_SAFE", // Tier doesn't matter for customer execution block
      mcpToolId: "file-assistant",
      mcpAction: "write_single",
      toolRequest: { type: "write_file", path: "test.txt", content: "hello" },
    }, { 'x-brewassist-mode': 'customer' });
    expect(r.resStatus).toBe(403);
  });
});
