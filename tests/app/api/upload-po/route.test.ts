/**
 * @vitest-environment node
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/upload-po/route";

const FIXTURES = path.join(__dirname, "../../../fixtures");

async function createPoFile(name: string, content: string) {
  return new File([content], name, { type: "text/plain" });
}

describe("POST /api/upload-po", () => {
  it("retorna 400 quando file está ausente", async () => {
    const formData = new FormData();
    const request = new Request("http://localhost/api/upload-po", {
      method: "POST",
      body: formData,
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Selecione um arquivo .po para enviar.");
  });

  it("retorna 400 quando file não é instância de File", async () => {
    const formData = new FormData();
    formData.append("file", "not-a-file");
    const request = new Request("http://localhost/api/upload-po", {
      method: "POST",
      body: formData,
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("retorna 400 para extensão inválida", async () => {
    const file = await createPoFile("test.txt", "content");
    const formData = new FormData();
    formData.append("file", file);
    const request = new Request("http://localhost/api/upload-po", {
      method: "POST",
      body: formData,
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("Apenas arquivos .po são aceitos.");
  });

  it("retorna 400 para arquivo maior que 5 MB", async () => {
    const largeContent = "x".repeat(5 * 1024 * 1024 + 1);
    const file = await createPoFile("big.po", largeContent);
    const formData = new FormData();
    formData.append("file", file);
    const request = new Request("http://localhost/api/upload-po", {
      method: "POST",
      body: formData,
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("5 MB");
  });

  it("retorna 200 para PO válido", async () => {
    const content = await readFile(path.join(FIXTURES, "sample.po"), "utf-8");
    const file = await createPoFile("my-plugin-pt_BR.po", content);
    const formData = new FormData();
    formData.append("file", file);
    const request = new Request("http://localhost/api/upload-po", {
      method: "POST",
      body: formData,
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.source).toBe("upload");
    expect(data.filename).toBe("my-plugin-pt_BR.po");
    expect(data.entries).toHaveLength(2);
    expect(data.textDomain).toBe("my-plugin");
  });

  it("retorna 400 para PO sem strings traduzíveis", async () => {
    const content = await readFile(path.join(FIXTURES, "sample-empty.po"), "utf-8");
    const file = await createPoFile("empty.po", content);
    const formData = new FormData();
    formData.append("file", file);
    const request = new Request("http://localhost/api/upload-po", {
      method: "POST",
      body: formData,
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("não contém strings traduzíveis");
  });
});
