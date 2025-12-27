import { evaluateHandshake } from "@/lib/toolbelt/handshake";
import { BrewTier } from "@/lib/commands/types";
import { Persona } from "@/lib/brewIdentityEngine";

describe("S4.10c handshake", () => {
  const adminPersona: Persona = 'admin';
  const customerPersona: Persona = 'customer';
  const basicTier: BrewTier = 'basic';
  const proTier: BrewTier = 'pro';
  const rbTier: BrewTier = 'rb';

  test("blocks safety concern unless RB Tier", () => {
    const policy = evaluateHandshake({
      intent: "TOOL_RUN",
      tier: basicTier,
      persona: adminPersona,
      truthFlags: ["safety_concern"],
      cockpitMode: "admin",
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe("blocked");
    expect(policy.reason).toContain("Safety concern detected. Requires RB Tier to proceed.");
  });

  test("requires confirmation for low truth score", () => {
    const policy = evaluateHandshake({
      intent: "RISK",
      tier: proTier,
      persona: adminPersona,
      truthScore: 0.55,
      cockpitMode: "admin",
    });

    expect(policy.ok).toBe(false);
    expect(policy.route).toBe("blocked");
    expect(policy.reason).toContain("Low BrewTruth score. Confirmation required before proceeding.");
    expect(policy.requiresConfirm).toBe(true);
  });

  test("allows normal knowledge request", () => {
    const policy = evaluateHandshake({
      intent: "KNOWLEDGE",
      tier: basicTier,
      persona: customerPersona,
      truthScore: 0.85,
      cockpitMode: "customer",
    });

    expect(policy.ok).toBe(true);
    expect(policy.route).toBe("brewassist");
    expect(policy.reason).toContain("Intent and tier are compatible.");
  });
});
