import * as gettext from "gettext-parser";
import type { TranslationEntry } from "@/types/wordpress";

export function filterExportableEntries(
  entries: TranslationEntry[]
): TranslationEntry[] {
  return entries.filter((entry) => entry.msgid.trim().length > 0);
}

export function parsePoContent(content: string): {
  entries: TranslationEntry[];
  headers: Record<string, string>;
} {
  const parsed = gettext.po.parse(content);
  const entries: TranslationEntry[] = [];
  const contextGroups = parsed.translations ?? {};

  for (const [context, items] of Object.entries(contextGroups)) {
    for (const [msgid, item] of Object.entries(items)) {
      if (msgid === "") {
        continue;
      }

      entries.push({
        msgid,
        msgstr: item.msgstr?.[0] ?? "",
        msgctxt: context || undefined,
        msgidPlural: item.msgid_plural || undefined,
        msgstrPlural: item.msgstr?.slice(1).filter(Boolean).length
          ? item.msgstr.slice(1)
          : undefined,
      });
    }
  }

  const headers: Record<string, string> = {};
  const headerEntry = contextGroups[""]?.[""];

  if (headerEntry?.msgstr?.[0]) {
    for (const line of headerEntry.msgstr[0].split("\n")) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
  }

  return { entries, headers };
}

export function inferTextDomain(filename: string, fallbackSlug: string): string {
  const baseName = filename.split("/").pop() ?? filename;
  const match = baseName.match(/^(.+?)(?:-[a-z]{2}(?:_[A-Z]{2})?)?\.(?:po|pot|mo)$/i);

  if (match?.[1]) {
    return match[1];
  }

  return fallbackSlug;
}

export function inferLocaleFromFilename(filename: string): string | null {
  const baseName = filename.split("/").pop() ?? filename;
  const match = baseName.match(/-([a-z]{2}(?:_[A-Z]{2})?)\.(?:po|mo)$/i);
  return match?.[1] ?? null;
}

export function parseUploadedPoFile(
  content: string,
  filename: string
): {
  slug: string;
  locale: string;
  textDomain: string;
  entries: TranslationEntry[];
  headers: Record<string, string>;
} {
  const { entries, headers } = parsePoContent(content);

  if (entries.length === 0) {
    throw new Error("O arquivo .po não contém strings traduzíveis.");
  }

  const baseName = filename.replace(/\.po$/i, "");
  const textDomain = inferTextDomain(filename, baseName);
  const locale =
    headers.Language?.trim() ||
    inferLocaleFromFilename(filename) ||
    "pt_BR";

  return {
    slug: textDomain,
    locale,
    textDomain,
    entries,
    headers,
  };
}

export function createPoFromPot(
  potContent: string,
  locale: string,
  projectName: string
): string {
  const { entries, headers } = parsePoContent(potContent);

  const newHeaders: Record<string, string> = {
    ...headers,
    Language: locale,
    "Project-Id-Version": projectName,
    "PO-Revision-Date": new Date().toISOString(),
  };

  const emptyEntries = entries.map((entry) => ({
    ...entry,
    msgstr: "",
    msgstrPlural: entry.msgidPlural ? entry.msgstrPlural?.map(() => "") : undefined,
  }));

  return generatePoContent(emptyEntries, newHeaders);
}

export function generatePoContent(
  entries: TranslationEntry[],
  headers: Record<string, string>
): string {
  const poData = {
    charset: "utf-8",
    headers: Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, value])
    ),
    translations: { "": {} } as Record<
      string,
      Record<
        string,
        {
          msgid: string;
          msgctxt?: string;
          msgid_plural?: string;
          msgstr: string[];
        }
      >
    >,
  };

  const headerLines = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}\n`)
    .join("");

  poData.translations[""][""] = {
    msgid: "",
    msgstr: [headerLines],
  };

  for (const entry of entries) {
    const context = entry.msgctxt ?? "";
    if (!poData.translations[context]) {
      poData.translations[context] = {};
    }

    const msgstr = entry.msgidPlural
      ? [entry.msgstr, ...(entry.msgstrPlural ?? [])]
      : [entry.msgstr];

    poData.translations[context][entry.msgid] = {
      msgid: entry.msgid,
      msgctxt: entry.msgctxt,
      msgid_plural: entry.msgidPlural,
      msgstr,
    };
  }

  const compiled = gettext.po.compile(poData);
  return typeof compiled === "string" ? compiled : compiled.toString("utf-8");
}

export function generateMoBuffer(
  entries: TranslationEntry[],
  headers: Record<string, string>
): Buffer {
  const poContent = generatePoContent(entries, headers);
  const parsed = gettext.po.parse(poContent);
  return gettext.mo.compile(parsed);
}
