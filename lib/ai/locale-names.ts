const LOCALE_NAMES: Record<string, string> = {
  pt_BR: "Brazilian Portuguese",
  pt_PT: "European Portuguese",
  en_US: "American English",
  en_GB: "British English",
  es_ES: "Spanish (Spain)",
  es_MX: "Mexican Spanish",
  fr_FR: "French",
  de_DE: "German",
  it_IT: "Italian",
  ja: "Japanese",
  zh_CN: "Simplified Chinese",
};

export function getLocaleName(locale: string): string {
  return LOCALE_NAMES[locale] ?? locale.replace("_", "-");
}
