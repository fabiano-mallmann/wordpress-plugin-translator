import { NextResponse } from "next/server";
import { parsePluginSlug } from "@/lib/wordpress/parse-slug";
import { fetchPluginInfo, getPluginIcon } from "@/lib/wordpress/plugin-api";
import {
  fetchAvailableTranslations,
  mapLocales,
  sortLocales,
} from "@/lib/wordpress/translations-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlOrSlug = searchParams.get("url") ?? searchParams.get("slug") ?? "";

  const slug = parsePluginSlug(urlOrSlug);
  if (!slug) {
    return NextResponse.json(
      { error: "Cole uma URL válida da loja WordPress.org" },
      { status: 400 }
    );
  }

  try {
    const plugin = await fetchPluginInfo(slug);
    const translationsResponse = await fetchAvailableTranslations(
      slug,
      plugin.version
    );
    const availableLocales = sortLocales(
      mapLocales(translationsResponse.translations ?? [])
    );

    return NextResponse.json({
      slug,
      name: plugin.name,
      version: plugin.version,
      author: plugin.author?.replace(/<[^>]+>/g, "").trim() ?? "",
      downloadLink: plugin.download_link,
      icon: getPluginIcon(plugin.icons),
      textDomain: slug,
      availableLocales,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao conectar com WordPress.org. Tente novamente.";

    return NextResponse.json({ error: message }, { status: 404 });
  }
}
