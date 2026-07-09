import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import path from "node:path";

const FIXTURES_DIR = path.join(__dirname);

export async function readFixture(name: string): Promise<string> {
  return readFile(path.join(FIXTURES_DIR, name), "utf-8");
}

export async function createZipWithFiles(
  files: Record<string, string>
): Promise<ArrayBuffer> {
  const zip = new JSZip();

  for (const [filename, content] of Object.entries(files)) {
    zip.file(filename, content);
  }

  return zip.generateAsync({ type: "arraybuffer" });
}

export async function createTranslationZip(
  locale: string,
  poContent: string,
  filename?: string
): Promise<ArrayBuffer> {
  const poFilename = filename ?? `my-plugin-${locale}.po`;
  return createZipWithFiles({ [poFilename]: poContent });
}

export async function createPluginZipWithPo(
  locale: string,
  poContent: string
): Promise<ArrayBuffer> {
  return createZipWithFiles({
    [`languages/my-plugin-${locale}.po`]: poContent,
    "readme.txt": "Plugin readme",
  });
}

export async function createPluginZipWithPot(
  potContent: string
): Promise<ArrayBuffer> {
  return createZipWithFiles({
    "languages/my-plugin.pot": potContent,
    "my-plugin.php": "<?php",
  });
}

export async function createPluginZipWithRootPo(
  locale: string,
  poContent: string
): Promise<ArrayBuffer> {
  return createZipWithFiles({
    [`my-plugin-${locale}.po`]: poContent,
  });
}

export async function createEmptyZip(): Promise<ArrayBuffer> {
  return createZipWithFiles({ "readme.txt": "No translations here" });
}
