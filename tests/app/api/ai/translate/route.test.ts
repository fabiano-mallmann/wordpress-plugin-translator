import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/ai/translate/route";

vi.mock("@/lib/ai/translate", () => ({
  MAX_BATCH_SIZE: 25,
  translateWithProvider: vi.fn(),
}));

import { translateWithProvider } from "@/lib/ai/translate";

describe("POST /api/ai/translate", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 400 para provedor inválido", async () => {
    const request = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      body: JSON.stringify({
        provider: "invalid",
        apiKey: "key",
        locale: "pt_BR",
        entries: [{ msgid: "Hello" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("retorna 400 sem chave de API", async () => {
    const request = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      body: JSON.stringify({
        provider: "openai",
        apiKey: "",
        locale: "pt_BR",
        entries: [{ msgid: "Hello" }],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("retorna traduções em caso de sucesso", async () => {
    vi.mocked(translateWithProvider).mockResolvedValue(["Olá"]);

    const request = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      body: JSON.stringify({
        provider: "openai",
        apiKey: "sk-test",
        locale: "pt_BR",
        entries: [{ msgid: "Hello" }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.translations).toEqual(["Olá"]);
    expect(translateWithProvider).toHaveBeenCalledWith(
      "openai",
      "sk-test",
      "pt_BR",
      [{ msgid: "Hello" }]
    );
  });

  it("retorna 502 quando provedor falha", async () => {
    vi.mocked(translateWithProvider).mockRejectedValue(
      new Error("Invalid key sk-proj-secret1234567890")
    );

    const request = new Request("http://localhost/api/ai/translate", {
      method: "POST",
      body: JSON.stringify({
        provider: "openai",
        apiKey: "sk-test",
        locale: "pt_BR",
        entries: [{ msgid: "Hello" }],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("Invalid key [chave redigida]");
    expect(data.error).not.toContain("sk-proj");
  });
});
