import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBlankTranslationData,
  getBlankPoFilename,
  isValidLocale,
  isValidTextDomain,
} from "@/lib/i18n/create-blank-po";

describe("isValidTextDomain", () => {
  it("aceita domain válido", () => {
    expect(isValidTextDomain("my-plugin")).toBe(true);
    expect(isValidTextDomain("plugin123")).toBe(true);
  });

  it("rejeita maiúsculas", () => {
    expect(isValidTextDomain("My-Plugin")).toBe(false);
  });

  it("rejeita underscore e espaços", () => {
    expect(isValidTextDomain("my_plugin")).toBe(false);
    expect(isValidTextDomain("my plugin")).toBe(false);
  });

  it("rejeita string vazia", () => {
    expect(isValidTextDomain("")).toBe(false);
    expect(isValidTextDomain("   ")).toBe(false);
  });

  it("faz trim antes de validar", () => {
    expect(isValidTextDomain("  my-plugin  ")).toBe(true);
  });
});

describe("isValidLocale", () => {
  it("aceita locales válidos", () => {
    expect(isValidLocale("pt_BR")).toBe(true);
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("es_ES")).toBe(true);
  });

  it("rejeita formatos inválidos", () => {
    expect(isValidLocale("pt-br")).toBe(false);
    expect(isValidLocale("PT_BR")).toBe(false);
    expect(isValidLocale("portuguese")).toBe(false);
  });

  it("faz trim antes de validar", () => {
    expect(isValidLocale("  pt_BR  ")).toBe(true);
  });
});

describe("createBlankTranslationData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cria TranslationData vazio com headers corretos", () => {
    const data = createBlankTranslationData("my-plugin", "pt_BR");

    expect(data).toEqual({
      slug: "my-plugin",
      locale: "pt_BR",
      textDomain: "my-plugin",
      source: "blank",
      entries: [],
      headers: {
        Language: "pt_BR",
        "Content-Type": "text/plain; charset=UTF-8",
        "Project-Id-Version": "my-plugin",
        "PO-Revision-Date": "2026-01-15T12:00:00.000Z",
        "Plural-Forms": "nplurals=2; plural=(n != 1);",
      },
    });
  });

  it("usa projectName customizado quando fornecido", () => {
    const data = createBlankTranslationData("my-plugin", "pt_BR", "  My Plugin  ");
    expect(data.headers["Project-Id-Version"]).toBe("My Plugin");
  });

  it("normaliza text domain para lowercase", () => {
    const data = createBlankTranslationData("MY-PLUGIN", "pt_BR");
    expect(data.textDomain).toBe("my-plugin");
  });

  it("lança erro para text domain inválido", () => {
    expect(() => createBlankTranslationData("Invalid_Domain", "pt_BR")).toThrow(
      "Text domain inválido"
    );
  });

  it("lança erro para locale inválido", () => {
    expect(() => createBlankTranslationData("my-plugin", "invalid")).toThrow(
      "Locale inválido"
    );
  });
});

describe("getBlankPoFilename", () => {
  it("retorna formato domain-locale.po", () => {
    expect(getBlankPoFilename("my-plugin", "pt_BR")).toBe("my-plugin-pt_BR.po");
  });
});
