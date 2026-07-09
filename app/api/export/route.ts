import { NextResponse } from "next/server";
import { generateMoBuffer, generatePoContent, filterExportableEntries } from "@/lib/i18n/po-parser";
import type { ExportRequest } from "@/types/wordpress";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportRequest;
    const { slug, locale, textDomain, format, entries, headers } = body;

    if (!slug || !locale || !textDomain || !entries?.length) {
      return NextResponse.json(
        { error: "Dados de exportação incompletos." },
        { status: 400 }
      );
    }

    const exportEntries = filterExportableEntries(entries);

    if (exportEntries.length === 0) {
      return NextResponse.json(
        { error: "Adicione ao menos uma string com texto original para exportar." },
        { status: 400 }
      );
    }

    const exportHeaders = {
      ...headers,
      Language: locale,
      "Project-Id-Version": headers["Project-Id-Version"] ?? slug,
    };

    const filename = `${textDomain}-${locale}.${format}`;

    if (format === "po") {
      const content = generatePoContent(exportEntries, exportHeaders);
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const moBuffer = generateMoBuffer(exportEntries, exportHeaders);
    return new NextResponse(new Uint8Array(moBuffer), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao exportar arquivo.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
