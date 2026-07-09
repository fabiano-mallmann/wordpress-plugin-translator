import JSZip from "jszip";
import {
  createPoFromPot,
  inferTextDomain,
  parsePoContent,
} from "@/lib/i18n/po-parser";
import type { TranslationData } from "@/types/wordpress";

interface ExtractedFile {
  filename: string;
  content: string;
}

async function extractTextFilesFromZip(
  buffer: ArrayBuffer
): Promise<ExtractedFile[]> {
  const zip = await JSZip.loadAsync(buffer);
  const files: ExtractedFile[] = [];

  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) {
      continue;
    }

    if (/\.(po|pot)$/i.test(filename)) {
      const content = await file.async("string");
      files.push({ filename, content });
    }
  }

  return files;
}

function findLocalePoFile(
  files: ExtractedFile[],
  locale: string
): ExtractedFile | undefined {
  const localePattern = new RegExp(`-${locale.replace("_", "_")}\\.po$`, "i");
  return files.find((file) => localePattern.test(file.filename));
}

function findPotFile(files: ExtractedFile[]): ExtractedFile | undefined {
  return files.find((file) => file.filename.endsWith(".pot"));
}

function findAnyPoFile(files: ExtractedFile[]): ExtractedFile | undefined {
  return files.find((file) => file.filename.endsWith(".po"));
}

export async function extractFromTranslationZip(
  buffer: ArrayBuffer,
  slug: string,
  locale: string
): Promise<TranslationData> {
  const files = await extractTextFilesFromZip(buffer);
  const poFile = findLocalePoFile(files, locale) ?? findAnyPoFile(files);

  if (!poFile) {
    throw new Error("Arquivo .po não encontrado no pacote de tradução.");
  }

  const { entries, headers } = parsePoContent(poFile.content);
  const textDomain = inferTextDomain(poFile.filename, slug);

  return {
    slug,
    locale,
    textDomain,
    source: "wordpress-api",
    entries,
    headers,
  };
}

export async function extractFromPluginZip(
  buffer: ArrayBuffer,
  slug: string,
  locale: string,
  projectName: string
): Promise<TranslationData> {
  const allFiles = await extractTextFilesFromZip(buffer);

  const languageFiles = allFiles.filter((file) =>
    /\/languages\//i.test(file.filename)
  );
  const files = languageFiles.length > 0 ? languageFiles : allFiles;

  const localePo = findLocalePoFile(files, locale);
  if (localePo) {
    const { entries, headers } = parsePoContent(localePo.content);
    return {
      slug,
      locale,
      textDomain: inferTextDomain(localePo.filename, slug),
      source: "plugin-po",
      entries,
      headers,
    };
  }

  const potFile = findPotFile(files);
  if (potFile) {
    const poContent = createPoFromPot(potFile.content, locale, projectName);
    const { entries, headers } = parsePoContent(poContent);
    return {
      slug,
      locale,
      textDomain: inferTextDomain(potFile.filename, slug),
      source: "pot-template",
      entries,
      headers,
    };
  }

  throw new Error(
    "Este plugin não possui arquivos de tradução exportáveis."
  );
}

export function countTranslated(entries: { msgstr: string }[]): {
  total: number;
  translated: number;
  percentage: number;
} {
  const total = entries.length;
  const translated = entries.filter((entry) => entry.msgstr.trim().length > 0).length;
  const percentage = total === 0 ? 0 : Math.round((translated / total) * 100);

  return { total, translated, percentage };
}
