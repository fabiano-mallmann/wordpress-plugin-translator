import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createPoFromPot,
  filterExportableEntries,
  generateMoBuffer,
  generatePoContent,
  inferLocaleFromFilename,
  inferTextDomain,
  parsePoContent,
  parseUploadedPoFile,
} from "@/lib/i18n/po-parser";

const FIXTURES = path.join(__dirname, "../../fixtures");

async function readFixture(name: string) {
  return readFile(path.join(FIXTURES, name), "utf-8");
}

describe("filterExportableEntries", () => {
  it("mantém entradas com msgid válido", () => {
    const entries = [
      { msgid: "Hello", msgstr: "Olá" },
      { msgid: "World", msgstr: "" },
    ];
    expect(filterExportableEntries(entries)).toHaveLength(2);
  });

  it("filtra msgid vazio ou só com espaços", () => {
    const entries = [
      { msgid: "", msgstr: "x" },
      { msgid: "   ", msgstr: "y" },
      { msgid: "Valid", msgstr: "z" },
    ];
    expect(filterExportableEntries(entries)).toEqual([
      { msgid: "Valid", msgstr: "z" },
    ]);
  });

  it("retorna array vazio para entrada vazia", () => {
    expect(filterExportableEntries([])).toEqual([]);
  });
});

describe("parsePoContent", () => {
  it("faz parse de PO simples com 2 strings", async () => {
    const content = await readFixture("sample.po");
    const { entries, headers } = parsePoContent(content);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ msgid: "Hello", msgstr: "Olá" });
    expect(entries[1]).toMatchObject({ msgid: "Goodbye", msgstr: "Adeus" });
    expect(headers.Language).toBe("pt_BR");
  });

  it("faz parse de entradas plurais", async () => {
    const content = await readFixture("sample-plural.po");
    const { entries } = parsePoContent(content);

    expect(entries).toHaveLength(1);
    expect(entries[0].msgid).toBe("%d item");
    expect(entries[0].msgidPlural).toBe("%d items");
    expect(entries[0].msgstr).toBe("%d item");
    expect(entries[0].msgstrPlural).toEqual(["%d itens"]);
  });

  it("faz parse de entradas com contexto", async () => {
    const content = await readFixture("sample-context.po");
    const { entries } = parsePoContent(content);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      msgctxt: "button",
      msgid: "Submit",
      msgstr: "Enviar",
    });
    expect(entries[1]).toMatchObject({
      msgctxt: "label",
      msgid: "Name",
      msgstr: "Nome",
    });
  });

  it("retorna entries vazio quando só há header block", async () => {
    const content = await readFixture("sample-empty.po");
    const { entries } = parsePoContent(content);
    expect(entries).toEqual([]);
  });

  it("ignora linhas de header malformadas", () => {
    const content = `msgid ""
msgstr ""
"malformed-line-without-colon\\n"
"Language: pt_BR\\n"

msgid "Test"
msgstr "Teste"
`;
    const { headers, entries } = parsePoContent(content);
    expect(headers.Language).toBe("pt_BR");
    expect(entries).toHaveLength(1);
  });

  it("usa string vazia quando msgstr está ausente", () => {
    const content = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgid "Untranslated"
msgstr ""
`;
    const { entries } = parsePoContent(content);
    expect(entries[0].msgstr).toBe("");
  });
});

describe("inferTextDomain", () => {
  it("extrai domain de plugin-pt_BR.po", () => {
    expect(inferTextDomain("my-plugin-pt_BR.po", "fallback")).toBe("my-plugin");
  });

  it("extrai domain de arquivo .pot", () => {
    expect(inferTextDomain("my-plugin.pot", "fallback")).toBe("my-plugin");
  });

  it("extrai domain de path com diretório", () => {
    expect(inferTextDomain("languages/my-plugin-pt_BR.po", "fallback")).toBe(
      "my-plugin"
    );
  });

  it("usa fallback quando nome não é reconhecido", () => {
    expect(inferTextDomain("invalidname", "my-fallback")).toBe("my-fallback");
  });
});

describe("inferLocaleFromFilename", () => {
  it("extrai pt_BR do filename", () => {
    expect(inferLocaleFromFilename("plugin-pt_BR.po")).toBe("pt_BR");
  });

  it("extrai en_US do filename .mo", () => {
    expect(inferLocaleFromFilename("plugin-en_US.mo")).toBe("en_US");
  });

  it("retorna null quando não há locale", () => {
    expect(inferLocaleFromFilename("plugin.po")).toBeNull();
  });
});

describe("parseUploadedPoFile", () => {
  it("usa locale do header Language", async () => {
    const content = await readFixture("sample-headers.po");
    const result = parseUploadedPoFile(content, "my-plugin-en_US.po");

    expect(result.locale).toBe("en_US");
    expect(result.textDomain).toBe("my-plugin");
    expect(result.entries).toHaveLength(1);
  });

  it("infere locale do filename quando header ausente", async () => {
    const content = await readFixture("sample.po");
    const result = parseUploadedPoFile(content, "my-plugin-pt_BR.po");

    expect(result.locale).toBe("pt_BR");
  });

  it("usa pt_BR como fallback quando locale não é encontrado", async () => {
    const content = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

msgid "Test"
msgstr "Teste"
`;
    const result = parseUploadedPoFile(content, "my-plugin.po");
    expect(result.locale).toBe("pt_BR");
  });

  it("lança erro quando não há strings traduzíveis", async () => {
    const content = await readFixture("sample-empty.po");
    expect(() => parseUploadedPoFile(content, "empty.po")).toThrow(
      "O arquivo .po não contém strings traduzíveis."
    );
  });
});

describe("createPoFromPot", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cria PO com msgstr vazios a partir de POT", async () => {
    const potContent = await readFixture("sample.pot");
    const poContent = createPoFromPot(potContent, "pt_BR", "My Plugin");

    const { entries, headers } = parsePoContent(poContent);
    expect(entries).toHaveLength(2);
    expect(entries.every((e) => e.msgstr === "")).toBe(true);
    expect(headers.Language).toBe("pt_BR");
    expect(headers["Project-Id-Version"]).toBe("My Plugin");
    expect(headers["PO-Revision-Date"]).toBe("2026-01-15T12:00:00.000Z");
  });

  it("zera msgstrPlural em entradas plurais", async () => {
    const potContent = `msgid ""
msgstr ""
"Plural-Forms: nplurals=2; plural=(n != 1);\\n"

msgid "%d item"
msgid_plural "%d items"
msgstr[0] ""
msgstr[1] ""
`;
    const poContent = createPoFromPot(potContent, "pt_BR", "Plugin");
    const { entries } = parsePoContent(poContent);

    expect(entries[0].msgstr).toBe("");
    expect(entries[0].msgstrPlural).toBeUndefined();
  });
});

describe("generatePoContent", () => {
  it("faz round-trip preservando dados", async () => {
    const content = await readFixture("sample.po");
    const { entries, headers } = parsePoContent(content);
    const regenerated = generatePoContent(entries, headers);
    const reparsed = parsePoContent(regenerated);

    expect(reparsed.entries).toEqual(entries);
  });

  it("agrupa entradas com contexto corretamente", async () => {
    const content = await readFixture("sample-context.po");
    const { entries, headers } = parsePoContent(content);
    const regenerated = generatePoContent(entries, headers);
    const reparsed = parsePoContent(regenerated);

    expect(reparsed.entries).toHaveLength(2);
    expect(reparsed.entries.map((e) => e.msgctxt).sort()).toEqual([
      "button",
      "label",
    ]);
  });

  it("gera PO só com header quando entries está vazio", () => {
    const headers = { Language: "pt_BR", "Content-Type": "text/plain; charset=UTF-8" };
    const content = generatePoContent([], headers);
    const { entries } = parsePoContent(content);
    expect(entries).toEqual([]);
  });
});

describe("generateMoBuffer", () => {
  it("retorna um Buffer não vazio", async () => {
    const content = await readFixture("sample.po");
    const { entries, headers } = parsePoContent(content);
    const buffer = generateMoBuffer(entries, headers);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });

  it("preserva msgids no round-trip MO via PO", async () => {
    const content = await readFixture("sample.po");
    const { entries, headers } = parsePoContent(content);
    const moBuffer = generateMoBuffer(entries, headers);

    const gettext = await import("gettext-parser");
    const parsed = gettext.mo.parse(moBuffer);
    const msgids = Object.keys(parsed.translations[""] ?? {}).filter(Boolean);

    expect(msgids).toContain("Hello");
    expect(msgids).toContain("Goodbye");
  });
});
