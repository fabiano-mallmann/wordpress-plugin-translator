import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPluginInfo, getPluginIcon } from "@/lib/wordpress/plugin-api";

describe("fetchPluginInfo", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna dados do plugin em resposta 200", async () => {
    const mockData = {
      name: "Contact Form 7",
      version: "5.8",
      slug: "contact-form-7",
      download_link: "https://example.com/plugin.zip",
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    const result = await fetchPluginInfo("contact-form-7");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("action=plugin_information"),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("slug=contact-form-7"),
      expect.any(Object)
    );
  });

  it("lança erro em resposta HTTP não-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(fetchPluginInfo("missing")).rejects.toThrow(
      "Erro ao conectar com WordPress.org"
    );
  });

  it("lança erro quando JSON contém error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: "plugin not found" }),
      })
    );

    await expect(fetchPluginInfo("missing")).rejects.toThrow(
      "Plugin não encontrado na loja oficial."
    );
  });
});

describe("getPluginIcon", () => {
  it("prioriza ícone 2x sobre 1x e svg", () => {
    expect(
      getPluginIcon({ "2x": "2x.png", "1x": "1x.png", svg: "icon.svg" })
    ).toBe("2x.png");
  });

  it("usa 1x quando 2x não existe", () => {
    expect(getPluginIcon({ "1x": "1x.png", svg: "icon.svg" })).toBe("1x.png");
  });

  it("usa svg como último fallback", () => {
    expect(getPluginIcon({ svg: "icon.svg" })).toBe("icon.svg");
  });

  it("retorna null para icons undefined ou vazio", () => {
    expect(getPluginIcon(undefined)).toBeNull();
    expect(getPluginIcon({})).toBeNull();
  });
});
