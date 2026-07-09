import { NextResponse } from "next/server";
import { fetchPluginInfo } from "@/lib/wordpress/plugin-api";
import {
  downloadPluginZip,
  downloadTranslationZip,
  fetchAvailableTranslations,
  findTranslationPackage,
} from "@/lib/wordpress/translations-api";
import {
  extractFromPluginZip,
  extractFromTranslationZip,
} from "@/lib/zip/extract-po";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const locale = searchParams.get("locale") ?? "pt_BR";

  if (!slug) {
    return NextResponse.json({ error: "Slug do plugin é obrigatório." }, { status: 400 });
  }

  try {
    const plugin = await fetchPluginInfo(slug);
    const translationsResponse = await fetchAvailableTranslations(
      slug,
      plugin.version
    );
    const packageUrl = findTranslationPackage(
      translationsResponse.translations ?? [],
      locale
    );

    if (packageUrl) {
      const zipBuffer = await downloadTranslationZip(packageUrl);
      const data = await extractFromTranslationZip(zipBuffer, slug, locale);
      return NextResponse.json(data);
    }

    const pluginZip = await downloadPluginZip(plugin.download_link);
    const data = await extractFromPluginZip(
      pluginZip,
      slug,
      locale,
      plugin.name
    );

    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao carregar traduções.";

    return NextResponse.json({ error: message }, { status: 404 });
  }
}
