import { callBrewassist } from "./helpers/brewassistTestClient";
import { CAPABILITY_REGISTRY, CapabilityId, RWX } from "../lib/capabilities/registry";
import { BrewTier } from "../lib/commands/types";
import { Persona } from "../lib/brewIdentityEngine"; // Import Persona type
import { evaluateHandshake, UnifiedPolicyEnvelope } from "../lib/toolbelt/handshake";

/**
 * Provider mocks:
 * Update these module paths to match your repo.
 * Goal: ensure chat calls succeed deterministically without real API keys.
 */
const MOCK_TEXT = "MOCK_STREAM_OK";

// Define mock Persona objects
const mockCustomerPersona: Persona = {
  id: 'customer',
  label: 'Customer User',
  tone: 'Helpful',
  emotionTier: 1,
  safetyMode: 'soft-stop',
  memoryWindow: 1,
  systemPrompt: 'Mock customer persona for testing',
};

const mockAdminPersona: Persona = {
  id: 'admin',
  label: 'Admin User',
  tone: 'Authoritative',
  emotionTier: 3,
  safetyMode: 'hard-stop', // Using 'hard-stop' as per recent fix
  memoryWindow: 3,
  systemPrompt: 'Mock admin persona for testing',
};

jest.mock("../lib/brewassist-engine", () => ({
  ...jest.requireActual("../lib/brewassist-engine"),
  runBrewAssistEngineStream: jest.fn(async (_args: any, onChunk: any, onEnd: any) => {
    onChunk?.(MOCK_TEXT); // Emit plain text chunk
    // Simulate the end of the stream with truth and policy
    onEnd?.({ provider: 'mockProvider', model: 'mockModel' }); // onEnd is called by the engine
  }),
}));

describe("BrewAssist Chain Gates (S4.8–S4.10)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  // G5: Customer tool attempt blocked -> 403
  test("G5 Toolbelt: customer tool attempt is blocked (403)", async () => {
    const r = await callBrewassist({
      input: "create a file test.txt with hello",
      mode: "TOOL",
      tier: "basic", // Customer tier
      persona: mockCustomerPersona,
      capabilityId: "fs_write", // Use fs_write capability
      action: "W",
      toolRequest: { type: "write_file", path: "test.txt", content: "hello" },
    }, { 'x-brewassist-mode': 'customer' });
    expect(r.resStatus).toBe(403);
    expect(r.json.policy.reason).toContain("Persona 'customer' not allowed for 'fs_write'");
  });

  // G6: Admin tool without confirmation -> 409
  test("G6 Toolbelt: admin tool requires confirmation (409)", async () => {
    const r = await callBrewassist({
      input: "apply a patch",
      mode: "TOOL",
      tier: "pro", // Pro tier for /patch
      persona: mockAdminPersona,
      capabilityId: "/patch", // Use patch capability
      confirmApply: false, // Missing confirmation
      truthScore: 0.9, // Add truthScore
      truthFlags: ['placeholder-flag'], // Add truthFlags with a placeholder
      toolRequest: { type: "apply_patch", patch: "diff --git a/x b/x" },
    }, { 'x-brewassist-mode': 'admin' });
    expect(r.resStatus).toBe(409);
    expect(r.json.policy.reason).toContain("TOOLBELT_CONFIRM_REQUIRED");
  });

  // G7: Admin tool with confirmation -> 200
  test("G7 Toolbelt: admin tool with confirmation allowed (200)", async () => {
    const r = await callBrewassist({
      input: "apply a patch",
      mode: "TOOL",
      tier: "pro", // Pro tier for /patch
      persona: mockAdminPersona,
      capabilityId: "/patch", // Use patch capability
      confirmApply: true,
      truthScore: 0.9,
      truthFlags: ['placeholder-flag'],
      toolRequest: { type: "apply_patch", patch: "diff --git a/x b/x" },
    }, { 'x-brewassist-mode': 'admin', 'x-gemini-execution-protocol': 'strict' });
    expect(r.resStatus).toBe(200);
    expect(r.json.policy.ok).toBe(true);
    expect(r.json.message).toContain("Tool '/patch' mocked successfully.");
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
    const r = await callBrewassist({
      input: "create a file test.txt with hello",
      mode: "TOOL",
      tier: "basic", // Customer tier
      persona: mockCustomerPersona,
      capabilityId: "fs_write", // Use fs_write capability
      action: "W",
      toolRequest: { type: "write_file", path: "test.txt", content: "hello" },
    }, { 'x-brewassist-mode': 'customer' });
    expect(r.resStatus).toBe(403);
    expect(r.json.policy.reason).toContain("Persona 'customer' not allowed for 'fs_write'");
  });
});