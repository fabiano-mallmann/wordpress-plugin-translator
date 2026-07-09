export interface PluginInfo {
  slug: string;
  name: string;
  version: string;
  author: string;
  downloadLink: string;
  icon: string | null;
  textDomain: string;
  availableLocales: LocaleInfo[];
}

export interface LocaleInfo {
  code: string;
  englishName: string;
  nativeName: string;
  hasTranslation: boolean;
}

export interface TranslationEntry {
  msgid: string;
  msgstr: string;
  msgctxt?: string;
  msgidPlural?: string;
  msgstrPlural?: string[];
}

export interface TranslationData {
  slug: string;
  locale: string;
  textDomain: string;
  source: "wordpress-api" | "pot-template" | "plugin-po" | "upload" | "blank";
  entries: TranslationEntry[];
  headers: Record<string, string>;
  filename?: string;
}

export interface ExportRequest {
  slug: string;
  locale: string;
  textDomain: string;
  format: "po" | "mo";
  entries: TranslationEntry[];
  headers: Record<string, string>;
}

export interface WordPressPluginApiResponse {
  name: string;
  slug: string;
  version: string;
  author: string;
  download_link: string;
  icons?: Record<string, string>;
  error?: string;
}

export interface WordPressTranslationItem {
  language: string;
  version: string;
  updated: string;
  english_name: string;
  native_name: string;
  package: string;
}

export interface WordPressTranslationsApiResponse {
  translations: WordPressTranslationItem[];
}
