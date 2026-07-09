import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/translations/route";

vi.mock("@/lib/wordpress/plugin-api", () => ({
  fetchPluginInfo: vi.fn(),
}));

vi.mock("@/lib/wordpress/translations-api", () => ({
  fetchAvailableTranslations: vi.fn(),
  findTranslationPackage: vi.fn(),
  downloadTranslationZip: vi.fn(),
  downloadPluginZip: vi.fn(),
}));

vi.mock("@/lib/zip/extract-po", () => ({
  extractFromTranslationZip: vi.fn(),
  extractFromPluginZip: vi.fn(),
}));

import { fetchPluginInfo } from "@/lib/wordpress/plugin-api";
import {
  downloadPluginZip,
  downloadTranslationZip,
  fetchAvailableTranslations,
  findTranslationPackage,
} from "@/lib/wordpress/translations-api";
import {
  extractFromPluginZip,
  extractFromTranslationZip,
} from "@/lib/zip/extract-po";

const translationData = {
  slug: "my-plugin",
  locale: "pt_BR",
  textDomain: "my-plugin",
  source: "wordpress-api" as const,
  entries: [{ msgid: "Hello", msgstr: "Olá" }],
  headers: { Language: "pt_BR" },
};

describe("GET /api/translations", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 400 quando slug está ausente", async () => {
    const request = new Request("http://localhost/api/translations");
    const response = await GET(request);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("obrigatório");
  });

  it("usa tradução oficial quando packageUrl existe", async () => {
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "My Plugin",
      version: "1.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({ translations: [] });
    vi.mocked(findTranslationPackage).mockReturnValue("https://example.com/pt.zip");
    vi.mocked(downloadTranslationZip).mockResolvedValue(new ArrayBuffer(8));
    vi.mocked(extractFromTranslationZip).mockResolvedValue(translationData);

    const request = new Request(
      "http://localhost/api/translations?slug=my-plugin&locale=pt_BR"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe("wordpress-api");
    expect(extractFromTranslationZip).toHaveBeenCalled();
    expect(extractFromPluginZip).not.toHaveBeenCalled();
  });

  it("faz fallback para ZIP do plugin quando não há tradução oficial", async () => {
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "My Plugin",
      version: "1.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({ translations: [] });
    vi.mocked(findTranslationPackage).mockReturnValue(null);
    vi.mocked(downloadPluginZip).mockResolvedValue(new ArrayBuffer(8));
    vi.mocked(extractFromPluginZip).mockResolvedValue({
      ...translationData,
      source: "plugin-po",
    });

    const request = new Request("http://localhost/api/translations?slug=my-plugin");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.source).toBe("plugin-po");
    expect(extractFromPluginZip).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      "my-plugin",
      "pt_BR",
      "My Plugin"
    );
  });

  it("usa pt_BR como locale padrão", async () => {
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "Plugin",
      version: "1.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({ translations: [] });
    vi.mocked(findTranslationPackage).mockReturnValue(null);
    vi.mocked(downloadPluginZip).mockResolvedValue(new ArrayBuffer(8));
    vi.mocked(extractFromPluginZip).mockResolvedValue(translationData);

    const request = new Request("http://localhost/api/translations?slug=my-plugin");
    await GET(request);

    expect(extractFromPluginZip).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      "my-plugin",
      "pt_BR",
      expect.any(String)
    );
  });

  it("retorna 404 em erro de download ou extração", async () => {
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "Plugin",
      version: "1.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({ translations: [] });
    vi.mocked(findTranslationPackage).mockReturnValue("https://example.com/pt.zip");
    vi.mocked(downloadTranslationZip).mockRejectedValue(
      new Error("Erro ao baixar pacote de tradução.")
    );

    const request = new Request(
      "http://localhost/api/translations?slug=my-plugin&locale=pt_BR"
    );
    const response = await GET(request);

    expect(response.status).toBe(404);
    expect((await response.json()).error).toContain("baixar");
  });
});
