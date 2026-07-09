import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/export/route";

const validBody = {
  slug: "my-plugin",
  locale: "pt_BR",
  textDomain: "my-plugin",
  format: "po" as const,
  entries: [{ msgid: "Hello", msgstr: "Olá" }],
  headers: { "Content-Type": "text/plain; charset=UTF-8" },
};

describe("POST /api/export", () => {
  it("retorna 400 quando campos obrigatórios estão ausentes", async () => {
    const request = new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({ slug: "x" }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Dados de exportação incompletos.");
  });

  it("retorna 400 quando entries só têm msgid vazio", async () => {
    const request = new Request("http://localhost/api/export", {
      method: "POST",
      body: JSON.stringify({
        ...validBody,
        entries: [{ msgid: "", msgstr: "x" }, { msgid: "   ", msgstr: "y" }],
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("string com texto original");
  });

  it("exporta .po com headers corretos", async () => {
    const request = new Request("http://localhost/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="my-plugin-pt_BR.po"'
    );
    const content = await response.text();
    expect(content).toContain('msgid "Hello"');
    expect(content).toContain('msgstr "Olá"');
  });

  it("exporta .mo como application/octet-stream", async () => {
    const request = new Request("http://localhost/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, format: "mo" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="my-plugin-pt_BR.mo"'
    );
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("usa slug como Project-Id-Version quando header ausente", async () => {
    const request = new Request("http://localhost/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        headers: {},
      }),
    });
    const response = await POST(request);
    const content = await response.text();
    expect(content).toContain("Project-Id-Version: my-plugin");
  });

  it("retorna 500 para JSON inválido", async () => {
    const request = new Request("http://localhost/api/export", {
      method: "POST",
      body: "not-json",
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
