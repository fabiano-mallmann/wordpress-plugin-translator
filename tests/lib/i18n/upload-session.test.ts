import { describe, expect, it } from "vitest";
import {
  BLANK_SESSION_KEY,
  UPLOAD_SESSION_KEY,
  clearBlankSession,
  clearUploadSession,
  loadBlankSession,
  loadUploadSession,
  saveBlankSession,
  saveUploadSession,
} from "@/lib/i18n/upload-session";
import type { TranslationData } from "@/types/wordpress";

const sampleData: TranslationData = {
  slug: "my-plugin",
  locale: "pt_BR",
  textDomain: "my-plugin",
  source: "upload",
  entries: [{ msgid: "Hello", msgstr: "Olá" }],
  headers: { Language: "pt_BR" },
};

describe("upload session", () => {
  it("faz round-trip de upload session", () => {
    saveUploadSession({ data: sampleData, filename: "my-plugin-pt_BR.po" });
    const loaded = loadUploadSession();

    expect(loaded).toEqual({
      data: sampleData,
      filename: "my-plugin-pt_BR.po",
    });
  });

  it("faz round-trip de blank session", () => {
    const blankData = { ...sampleData, source: "blank" as const, entries: [] };
    saveBlankSession({ data: blankData });
    expect(loadBlankSession()).toEqual({ data: blankData });
  });

  it("retorna null quando chave está ausente", () => {
    expect(loadUploadSession()).toBeNull();
    expect(loadBlankSession()).toBeNull();
  });

  it("retorna null para JSON corrompido", () => {
    sessionStorage.setItem(UPLOAD_SESSION_KEY, "{invalid");
    sessionStorage.setItem(BLANK_SESSION_KEY, "not-json");

    expect(loadUploadSession()).toBeNull();
    expect(loadBlankSession()).toBeNull();
  });

  it("clearUploadSession remove a chave correta", () => {
    saveUploadSession({ data: sampleData, filename: "test.po" });
    clearUploadSession();
    expect(sessionStorage.getItem(UPLOAD_SESSION_KEY)).toBeNull();
  });

  it("clearBlankSession remove a chave correta", () => {
    saveBlankSession({ data: sampleData });
    clearBlankSession();
    expect(sessionStorage.getItem(BLANK_SESSION_KEY)).toBeNull();
  });
});

describe("SSR guard", () => {
  it("loadUploadSession retorna null sem window", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR
    delete globalThis.window;

    expect(loadUploadSession()).toBeNull();

    globalThis.window = originalWindow;
  });

  it("loadBlankSession retorna null sem window", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error simulating SSR
    delete globalThis.window;

    expect(loadBlankSession()).toBeNull();

    globalThis.window = originalWindow;
  });
});

describe("save functions", () => {
  it("saveUploadSession persiste dados recuperáveis", () => {
    saveUploadSession({ data: sampleData, filename: "test.po" });
    const loaded = loadUploadSession();

    expect(loaded?.filename).toBe("test.po");
    expect(loaded?.data.slug).toBe("my-plugin");
  });
});
