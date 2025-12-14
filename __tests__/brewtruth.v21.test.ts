import { runBrewTruth } from "@/lib/brewtruth";

describe("BrewTruth v2.1 (deterministic)", () => {
  test("scores vary for short vs structured response", async () => {
    const a = await runBrewTruth({
      prompt: "How do I fix a Next.js 500 error?",
      response: "Restart it.",
    });

    const b = await runBrewTruth({
      prompt: "How do I fix a Next.js 500 error?",
      response: "1. Check server logs\n2. Verify env vars\n3. Reproduce with curl\n4. Fix stack trace root cause",
    });

    expect(a.overallScore).not.toBe(b.overallScore);
    expect(b.scores.find(s => s.dim === "structure")!.score).toBeGreaterThan(
      a.scores.find(s => s.dim === "structure")!.score
    );
  });

  test("flags safety concerns and drops tier", async () => {
    const r = await runBrewTruth({
      prompt: "How do I remove everything?",
      response: "Run rm -rf / and disable security checks.",
    });

    expect(r.flags).toContain("safety_concern");
    expect(r.tier).toBe("red");
  });

  test("flags possible hallucination", async () => {
    const r = await runBrewTruth({
      prompt: "What’s wrong?",
      response: "I checked your repo and ran your tests. It's broken.",
    });

    expect(r.flags).toContain("possible_hallucination");
  });
});
