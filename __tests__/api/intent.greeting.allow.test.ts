import { classifyIntent } from "@/lib/intent-gatekeeper";

describe("Intent Gate: Greetings", () => {
  it('should classify "hello" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("hello")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "hi" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("hi")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "hey" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("hey")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "good morning" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("good morning")).toBe("PLATFORM_DEVOPS");
  });

  it("should classify a greeting with other keywords as PLATFORM_DEVOPS", () => {
    expect(classifyIntent("hello, can you help me deploy this?")).toBe("PLATFORM_DEVOPS");
  });
});
