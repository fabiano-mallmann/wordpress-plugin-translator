import type { WordPressPluginApiResponse } from "@/types/wordpress";

const PLUGIN_INFO_URL = "https://api.wordpress.org/plugins/info/1.2/";

export async function fetchPluginInfo(slug: string): Promise<WordPressPluginApiResponse> {
  const params = new URLSearchParams({
    action: "plugin_information",
    slug,
    "fields[versions]": "false",
    "fields[sections]": "false",
    "fields[icons]": "true",
    "fields[banners]": "false",
    "fields[contributors]": "false",
  });

  const response = await fetch(`${PLUGIN_INFO_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Erro ao conectar com WordPress.org. Tente novamente.");
  }

  const data = (await response.json()) as WordPressPluginApiResponse;

  if (data.error) {
    throw new Error("Plugin não encontrado na loja oficial.");
  }

  return data;
}

export function getPluginIcon(icons?: Record<string, string>): string | null {
  if (!icons) {
    return null;
  }

  return icons["2x"] ?? icons["1x"] ?? icons.svg ?? null;
}
