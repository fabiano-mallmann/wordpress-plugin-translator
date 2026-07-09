import type { TranslationData } from "@/types/wordpress";

const TEXT_DOMAIN_PATTERN = /^[a-z0-9-]+$/;
const LOCALE_PATTERN = /^[a-z]{2}(?:_[A-Z]{2})?$/;

export function isValidTextDomain(value: string): boolean {
  return TEXT_DOMAIN_PATTERN.test(value.trim());
}

export function isValidLocale(value: string): boolean {
  return LOCALE_PATTERN.test(value.trim());
}

export function createBlankTranslationData(
  textDomain: string,
  locale: string,
  projectName?: string
): TranslationData {
  const normalizedDomain = textDomain.trim().toLowerCase();
  const normalizedLocale = locale.trim();

  if (!isValidTextDomain(normalizedDomain)) {
    throw new Error(
      "Text domain inválido. Use apenas letras minúsculas, números e hífens."
    );
  }

  if (!isValidLocale(normalizedLocale)) {
    throw new Error("Locale inválido. Exemplo: pt_BR, en_US, es_ES.");
  }

  return {
    slug: normalizedDomain,
    locale: normalizedLocale,
    textDomain: normalizedDomain,
    source: "blank",
    entries: [],
    headers: {
      Language: normalizedLocale,
      "Content-Type": "text/plain; charset=UTF-8",
      "Project-Id-Version": projectName?.trim() || normalizedDomain,
      "PO-Revision-Date": new Date().toISOString(),
      "Plural-Forms": "nplurals=2; plural=(n != 1);",
    },
  };
}

export function getBlankPoFilename(textDomain: string, locale: string): string {
  return `${textDomain}-${locale}.po`;
}
