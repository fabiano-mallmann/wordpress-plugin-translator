import { NextResponse } from "next/server";
import { parseUploadedPoFile } from "@/lib/i18n/po-parser";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Selecione um arquivo .po para enviar." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".po")) {
      return NextResponse.json(
        { error: "Apenas arquivos .po são aceitos." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O limite é 5 MB." },
        { status: 400 }
      );
    }

    const content = await file.text();
    const parsed = parseUploadedPoFile(content, file.name);

    return NextResponse.json({
      ...parsed,
      source: "upload" as const,
      filename: file.name,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao processar o arquivo .po.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
