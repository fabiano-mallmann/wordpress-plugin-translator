import { afterEach, describe, expect, it, vi } from "vitest";
import {
  downloadPluginZip,
  downloadTranslationZip,
  fetchAvailableTranslations,
  findTranslationPackage,
  mapLocales,
  sortLocales,
} from "@/lib/wordpress/translations-api";
import type { LocaleInfo } from "@/types/wordpress";

describe("fetchAvailableTranslations", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna traduções em resposta 200", async () => {
    const mockData = {
      translations: [
        {
          language: "pt_BR",
          english_name: "Portuguese (Brazil)",
          native_name: "Português do Brasil",
          package: "https://example.com/pt_BR.zip",
        },
      ],
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    );

    const result = await fetchAvailableTranslations("my-plugin", "1.0");
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("slug=my-plugin"),
      expect.any(Object)
    );
  });

  it("lança erro em resposta HTTP não-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );

    await expect(fetchAvailableTranslations("x", "1.0")).rejects.toThrow(
      "Erro ao buscar traduções disponíveis."
    );
  });
});

describe("mapLocales", () => {
  it("mapeia itens da API para LocaleInfo", () => {
    const result = mapLocales([
      {
        language: "pt_BR",
        english_name: "Portuguese (Brazil)",
        native_name: "Português do Brasil",
        package: "https://example.com/pt_BR.zip",
      },
    ]);

    expect(result).toEqual([
      {
        code: "pt_BR",
        englishName: "Portuguese (Brazil)",
        nativeName: "Português do Brasil",
        hasTranslation: true,
      },
    ]);
  });

  it("retorna array vazio para entrada vazia", () => {
    expect(mapLocales([])).toEqual([]);
  });
});

describe("sortLocales", () => {
  const locales: LocaleInfo[] = [
    { code: "de_DE", englishName: "German", nativeName: "Deutsch", hasTranslation: true },
    { code: "en_US", englishName: "English", nativeName: "English", hasTranslation: true },
    { code: "pt_BR", englishName: "Portuguese", nativeName: "Português", hasTranslation: true },
    { code: "fr_FR", englishName: "French", nativeName: "Français", hasTranslation: true },
  ];

  it("coloca pt_BR antes de en_US e outros", () => {
    const sorted = sortLocales(locales);
    expect(sorted[0].code).toBe("pt_BR");
    expect(sorted[1].code).toBe("en_US");
  });

  it("ordena ambos prioritários pela ordem da priority array", () => {
    const priorityOnly: LocaleInfo[] = [
      { code: "es_ES", englishName: "Spanish", nativeName: "Español", hasTranslation: true },
      { code: "pt_PT", englishName: "Portuguese", nativeName: "Português", hasTranslation: true },
      { code: "pt_BR", englishName: "Portuguese", nativeName: "Português BR", hasTranslation: true },
    ];
    const sorted = sortLocales(priorityOnly);
    expect(sorted.map((l) => l.code)).toEqual(["pt_BR", "pt_PT", "es_ES"]);
  });

  it("ordena alfabeticamente por nativeName quando nenhum é prioritário", () => {
    const nonPriority: LocaleInfo[] = [
      { code: "ja", englishName: "Japanese", nativeName: "日本語", hasTranslation: true },
      { code: "de_DE", englishName: "German", nativeName: "Deutsch", hasTranslation: true },
    ];
    const sorted = sortLocales(nonPriority);
    expect(sorted[0].code).toBe("de_DE");
  });

  it("não muta o array original", () => {
    const copy = [...locales];
    sortLocales(locales);
    expect(locales).toEqual(copy);
  });
});

describe("findTranslationPackage", () => {
  const translations = [
    {
      language: "pt_BR",
      english_name: "Portuguese",
      native_name: "Português",
      package: "https://example.com/pt_BR.zip",
    },
    {
      language: "en_US",
      english_name: "English",
      native_name: "English",
      package: "",
    },
  ];

  it("retorna URL do pacote para locale encontrado", () => {
    expect(findTranslationPackage(translations, "pt_BR")).toBe(
      "https://example.com/pt_BR.zip"
    );
  });

  it("retorna null para locale inexistente", () => {
    expect(findTranslationPackage(translations, "fr_FR")).toBeNull();
  });

  it("retorna string vazia quando package está vazio", () => {
    expect(findTranslationPackage(translations, "en_US")).toBe("");
  });
});

describe("downloadTranslationZip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna ArrayBuffer em resposta ok", async () => {
    const buffer = new ArrayBuffer(8);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => buffer,
      })
    );

    const result = await downloadTranslationZip("https://example.com/pkg.zip");
    expect(result).toBe(buffer);
  });

  it("lança erro em resposta não-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );

    await expect(downloadTranslationZip("https://example.com/x")).rejects.toThrow(
      "Erro ao baixar pacote de tradução."
    );
  });
});

describe("downloadPluginZip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retorna ArrayBuffer em resposta ok", async () => {
    const buffer = new ArrayBuffer(16);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => buffer,
      })
    );

    const result = await downloadPluginZip("https://example.com/plugin.zip");
    expect(result).toBe(buffer);
  });

  it("lança erro em resposta não-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    await expect(downloadPluginZip("https://example.com/x")).rejects.toThrow(
      "Erro ao baixar plugin."
    );
  });
});
