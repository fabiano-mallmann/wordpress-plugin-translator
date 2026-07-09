import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  countTranslated,
  extractFromPluginZip,
  extractFromTranslationZip,
} from "@/lib/zip/extract-po";
import {
  createEmptyZip,
  createPluginZipWithPo,
  createPluginZipWithPot,
  createPluginZipWithRootPo,
  createTranslationZip,
} from "../../fixtures/zip-helpers";

const FIXTURES = path.join(__dirname, "../../fixtures");

async function readFixture(name: string) {
  return readFile(path.join(FIXTURES, name), "utf-8");
}

describe("extractFromTranslationZip", () => {
  it("extrai PO do locale solicitado", async () => {
    const poContent = await readFixture("sample.po");
    const zip = await createTranslationZip("pt_BR", poContent);
    const result = await extractFromTranslationZip(zip, "my-plugin", "pt_BR");

    expect(result.source).toBe("wordpress-api");
    expect(result.locale).toBe("pt_BR");
    expect(result.entries).toHaveLength(2);
    expect(result.textDomain).toBe("my-plugin");
  });

  it("faz fallback para qualquer .po quando locale não é encontrado", async () => {
    const poContent = await readFixture("sample.po");
    const zip = await createTranslationZip("en_US", poContent, "my-plugin-en_US.po");
    const result = await extractFromTranslationZip(zip, "my-plugin", "pt_BR");

    expect(result.entries).toHaveLength(2);
    expect(result.source).toBe("wordpress-api");
  });

  it("lança erro quando ZIP não contém .po", async () => {
    const zip = await createEmptyZip();
    await expect(
      extractFromTranslationZip(zip, "my-plugin", "pt_BR")
    ).rejects.toThrow("Arquivo .po não encontrado no pacote de tradução.");
  });
});

describe("extractFromPluginZip", () => {
  it("extrai PO de /languages/ para o locale", async () => {
    const poContent = await readFixture("sample.po");
    const zip = await createPluginZipWithPo("pt_BR", poContent);
    const result = await extractFromPluginZip(zip, "my-plugin", "pt_BR", "My Plugin");

    expect(result.source).toBe("plugin-po");
    expect(result.entries).toHaveLength(2);
  });

  it("prioriza arquivos em /languages/ sobre raiz", async () => {
    const langPo = await readFixture("sample.po");
    const rootPo = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgid "Root"
msgstr "Raiz"
`;
    const { createZipWithFiles } = await import("../../fixtures/zip-helpers");
    const zip = await createZipWithFiles({
      "languages/my-plugin-pt_BR.po": langPo,
      "my-plugin-pt_BR.po": rootPo,
    });

    const result = await extractFromPluginZip(zip, "my-plugin", "pt_BR", "Plugin");
    expect(result.entries.some((e) => e.msgid === "Hello")).toBe(true);
    expect(result.entries.some((e) => e.msgid === "Root")).toBe(false);
  });

  it("faz fallback para .pot quando não há PO do locale", async () => {
    const potContent = await readFixture("sample.pot");
    const zip = await createPluginZipWithPot(potContent);
    const result = await extractFromPluginZip(zip, "my-plugin", "pt_BR", "My Plugin");

    expect(result.source).toBe("pot-template");
    expect(result.entries).toHaveLength(2);
    expect(result.entries.every((e) => e.msgstr === "")).toBe(true);
  });

  it("usa PO na raiz quando não há pasta languages", async () => {
    const poContent = await readFixture("sample.po");
    const zip = await createPluginZipWithRootPo("pt_BR", poContent);
    const result = await extractFromPluginZip(zip, "my-plugin", "pt_BR", "Plugin");

    expect(result.source).toBe("plugin-po");
    expect(result.entries).toHaveLength(2);
  });

  it("lança erro quando não há PO nem POT", async () => {
    const zip = await createEmptyZip();
    await expect(
      extractFromPluginZip(zip, "my-plugin", "pt_BR", "Plugin")
    ).rejects.toThrow("Este plugin não possui arquivos de tradução exportáveis.");
  });
});

describe("countTranslated", () => {
  it("calcula 3 de 5 como 60%", () => {
    const entries = [
      { msgstr: "a" },
      { msgstr: "b" },
      { msgstr: "c" },
      { msgstr: "" },
      { msgstr: "   " },
    ];
    expect(countTranslated(entries)).toEqual({
      total: 5,
      translated: 3,
      percentage: 60,
    });
  });

  it("não conta msgstr só com espaços", () => {
    const entries = [{ msgstr: "  " }, { msgstr: "ok" }];
    expect(countTranslated(entries).translated).toBe(1);
  });

  it("retorna 0% quando total é zero", () => {
    expect(countTranslated([])).toEqual({
      total: 0,
      translated: 0,
      percentage: 0,
    });
  });

  it("arredonda porcentagem corretamente", () => {
    const entries = [{ msgstr: "a" }, { msgstr: "" }, { msgstr: "" }];
    expect(countTranslated(entries).percentage).toBe(33);
  });
});
