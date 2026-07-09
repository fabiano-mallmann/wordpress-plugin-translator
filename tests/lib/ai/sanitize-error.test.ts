import { describe, expect, it } from "vitest";
import { sanitizeErrorMessage } from "@/lib/ai/sanitize-error";

describe("sanitizeErrorMessage", () => {
  it("redige chaves OpenAI em mensagens de erro", () => {
    const message = "Invalid API key: sk-proj-abc123xyz789secret";
    expect(sanitizeErrorMessage(message)).toBe(
      "Invalid API key: [chave redigida]"
    );
  });

  it("redige chaves Anthropic", () => {
    const message = "Auth failed for sk-ant-api03-abcdefghijklmnop";
    expect(sanitizeErrorMessage(message)).toContain("[chave redigida]");
    expect(sanitizeErrorMessage(message)).not.toContain("sk-ant");
  });

  it("preserva mensagens sem segredos", () => {
    expect(sanitizeErrorMessage("Quota exceeded")).toBe("Quota exceeded");
  });
});
