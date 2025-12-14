import { evaluateHandshake } from "@/lib/toolbelt/handshake";

describe("S4.10c handshake", () => {
  test("blocks safety concern unless Tier 3", () => {
    const d = evaluateHandshake({
      intent: "TOOL_RUN",
      tier: "T1_SAFE",
      truthFlags: ["safety_concern"],
      cockpitMode: "admin",
    });

    expect(d.decision).toBe("BLOCK");
    expect(d.suggestedTier).toBe("T3_DANGEROUS");
  });

  test("requires confirmation for low truth score", () => {
    const d = evaluateHandshake({
      intent: "RISK",
      tier: "T2_PATCH",
      truthScore: 0.55,
      cockpitMode: "admin",
    });

    expect(d.decision).toBe("REQUIRE_CONFIRMATION");
    expect(d.requiredConfirmation).toBe(true);
  });

  test("allows normal knowledge request", () => {
    const d = evaluateHandshake({
      intent: "KNOWLEDGE",
      tier: "T1_SAFE",
      truthScore: 0.85,
      cockpitMode: "customer",
    });

    expect(d.decision).toBe("ALLOW");
  });
});
