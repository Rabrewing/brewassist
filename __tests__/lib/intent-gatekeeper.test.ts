import { classifyIntent } from "@/lib/intent-gatekeeper";

describe("classifyIntent", () => {
  it('should classify "hello" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("hello")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "hi" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("hi")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "good morning" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("good morning")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "deploy my app" as PLATFORM_DEVOPS', () => {
    expect(classifyIntent("deploy my app")).toBe("PLATFORM_DEVOPS");
  });

  it('should classify "what is the meaning of life" as GENERAL_KNOWLEDGE', () => {
    expect(classifyIntent("what is the meaning of life")).toBe("GENERAL_KNOWLEDGE");
  });

  it('should classify "how do I use the toolbelt" as DOCS_KB', () => {
    expect(classifyIntent("how do I use the toolbelt")).toBe("DOCS_KB");
  });

  it("should return GENERAL_KNOWLEDGE for unclassified prompts", () => {
    expect(classifyIntent("tell me a story")).toBe("GENERAL_KNOWLEDGE");
  });
});
