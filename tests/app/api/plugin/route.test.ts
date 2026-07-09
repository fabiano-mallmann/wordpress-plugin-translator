import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/plugin/route";

vi.mock("@/lib/wordpress/parse-slug", () => ({
  parsePluginSlug: vi.fn(),
}));

vi.mock("@/lib/wordpress/plugin-api", () => ({
  fetchPluginInfo: vi.fn(),
  getPluginIcon: vi.fn(),
}));

vi.mock("@/lib/wordpress/translations-api", () => ({
  fetchAvailableTranslations: vi.fn(),
  mapLocales: vi.fn(),
  sortLocales: vi.fn(),
}));

import { parsePluginSlug } from "@/lib/wordpress/parse-slug";
import { fetchPluginInfo, getPluginIcon } from "@/lib/wordpress/plugin-api";
import {
  fetchAvailableTranslations,
  mapLocales,
  sortLocales,
} from "@/lib/wordpress/translations-api";

describe("GET /api/plugin", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 400 para slug inválido", async () => {
    vi.mocked(parsePluginSlug).mockReturnValue(null);
    const request = new Request("http://localhost/api/plugin?slug=invalid_slug");
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("URL válida");
  });

  it("aceita query param url", async () => {
    vi.mocked(parsePluginSlug).mockReturnValue("my-plugin");
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "My Plugin",
      version: "1.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
      author: "<a href='#'>Author</a>",
      icons: { "2x": "icon.png" },
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({ translations: [] });
    vi.mocked(mapLocales).mockReturnValue([]);
    vi.mocked(sortLocales).mockReturnValue([]);
    vi.mocked(getPluginIcon).mockReturnValue("icon.png");

    const request = new Request(
      "http://localhost/api/plugin?url=https://wordpress.org/plugins/my-plugin/"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(parsePluginSlug).toHaveBeenCalled();
  });

  it("retorna metadados do plugin com locales ordenados", async () => {
    vi.mocked(parsePluginSlug).mockReturnValue("my-plugin");
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "My Plugin",
      version: "2.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
      author: "<strong>John</strong> Doe",
      icons: { "1x": "icon.png" },
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({
      translations: [
        {
          language: "pt_BR",
          english_name: "Portuguese",
          native_name: "Português",
          package: "https://example.com/pt.zip",
        },
      ],
    });
    vi.mocked(mapLocales).mockReturnValue([
      {
        code: "pt_BR",
        englishName: "Portuguese",
        nativeName: "Português",
        hasTranslation: true,
      },
    ]);
    vi.mocked(sortLocales).mockImplementation((locales) => locales);
    vi.mocked(getPluginIcon).mockReturnValue("icon.png");

    const request = new Request("http://localhost/api/plugin?slug=my-plugin");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      slug: "my-plugin",
      name: "My Plugin",
      version: "2.0",
      author: "John Doe",
      icon: "icon.png",
      textDomain: "my-plugin",
    });
    expect(data.availableLocales).toHaveLength(1);
  });

  it("retorna 404 quando plugin não é encontrado", async () => {
    vi.mocked(parsePluginSlug).mockReturnValue("missing");
    vi.mocked(fetchPluginInfo).mockRejectedValue(
      new Error("Plugin não encontrado na loja oficial.")
    );

    const request = new Request("http://localhost/api/plugin?slug=missing");
    const response = await GET(request);

    expect(response.status).toBe(404);
    expect((await response.json()).error).toContain("não encontrado");
  });

  it("lida com translations null/undefined", async () => {
    vi.mocked(parsePluginSlug).mockReturnValue("my-plugin");
    vi.mocked(fetchPluginInfo).mockResolvedValue({
      name: "Plugin",
      version: "1.0",
      slug: "my-plugin",
      download_link: "https://example.com/plugin.zip",
    });
    vi.mocked(fetchAvailableTranslations).mockResolvedValue({
      translations: undefined as unknown as [],
    });
    vi.mocked(mapLocales).mockReturnValue([]);
    vi.mocked(sortLocales).mockReturnValue([]);
    vi.mocked(getPluginIcon).mockReturnValue(null);

    const request = new Request("http://localhost/api/plugin?slug=my-plugin");
    const response = await GET(request);
    const data = await response.json();

    expect(data.availableLocales).toEqual([]);
    expect(data.icon).toBeNull();
  });
});
