import type {
  LocaleInfo,
  WordPressTranslationsApiResponse,
} from "@/types/wordpress";

const TRANSLATIONS_URL = "https://api.wordpress.org/translations/plugins/1.0/";

export async function fetchAvailableTranslations(
  slug: string,
  version: string
): Promise<WordPressTranslationsApiResponse> {
  const params = new URLSearchParams({ slug, version });
  const response = await fetch(`${TRANSLATIONS_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar traduções disponíveis.");
  }

  return (await response.json()) as WordPressTranslationsApiResponse;
}

export function mapLocales(
  translations: WordPressTranslationsApiResponse["translations"]
): LocaleInfo[] {
  return translations.map((item) => ({
    code: item.language,
    englishName: item.english_name,
    nativeName: item.native_name,
    hasTranslation: true,
  }));
}

export function sortLocales(locales: LocaleInfo[]): LocaleInfo[] {
  const priority = ["pt_BR", "pt_PT", "en_US", "es_ES"];

  return [...locales].sort((a, b) => {
    const aIndex = priority.indexOf(a.code);
    const bIndex = priority.indexOf(b.code);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    if (aIndex !== -1) {
      return -1;
    }
    if (bIndex !== -1) {
      return 1;
    }
    return a.nativeName.localeCompare(b.nativeName);
  });
}

export function findTranslationPackage(
  translations: WordPressTranslationsApiResponse["translations"],
  locale: string
): string | null {
  const match = translations.find((item) => item.language === locale);
  return match?.package ?? null;
}

export async function downloadTranslationZip(packageUrl: string): Promise<ArrayBuffer> {
  const response = await fetch(packageUrl);

  if (!response.ok) {
    throw new Error("Erro ao baixar pacote de tradução.");
  }

  return response.arrayBuffer();
}

export async function downloadPluginZip(downloadLink: string): Promise<ArrayBuffer> {
  const response = await fetch(downloadLink);

  if (!response.ok) {
    throw new Error("Erro ao baixar plugin.");
  }

  return response.arrayBuffer();
}
