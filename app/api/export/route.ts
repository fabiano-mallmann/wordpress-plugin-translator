import { NextResponse } from "next/server";
import { generateMoBuffer, generatePoContent } from "@/lib/i18n/po-parser";
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

    const exportHeaders = {
      ...headers,
      Language: locale,
      "Project-Id-Version": headers["Project-Id-Version"] ?? slug,
    };

    const filename = `${textDomain}-${locale}.${format}`;

    if (format === "po") {
      const content = generatePoContent(entries, exportHeaders);
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const moBuffer = generateMoBuffer(entries, exportHeaders);
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
