import { afterEach, describe, expect, it, vi } from "vitest";
import { translateWithProvider } from "@/lib/ai/translate";

describe("translateWithProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("chama OpenAI e retorna traduções", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '{"translations":["Olá"]}' } }],
        }),
      })
    );

    const result = await translateWithProvider(
      "openai",
      "sk-test",
      "pt_BR",
      [{ msgid: "Hello" }]
    );

    expect(result).toEqual(["Olá"]);
    expect(fetch).toHaveBeenCalledWith(
      "https://api.openai.com/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test",
        }),
      })
    );
  });

  it("propaga erro do provedor", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: "Invalid API key" } }),
      })
    );

    await expect(
      translateWithProvider("openai", "bad-key", "pt_BR", [{ msgid: "Hi" }])
    ).rejects.toThrow("Invalid API key");
  });
});
