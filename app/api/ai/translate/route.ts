import { NextResponse } from "next/server";
import { sanitizeErrorMessage } from "@/lib/ai/sanitize-error";
import { MAX_BATCH_SIZE, translateWithProvider } from "@/lib/ai/translate";
import type { AiProvider, AiTranslateRequest } from "@/types/ai";

const VALID_PROVIDERS: AiProvider[] = ["openai", "anthropic", "gemini"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AiTranslateRequest;
    const { provider, apiKey, locale, entries } = body;

    if (!provider || !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: "Provedor de IA inválido." }, { status: 400 });
    }

    if (!apiKey?.trim()) {
      return NextResponse.json({ error: "Informe a chave de API." }, { status: 400 });
    }

    if (!locale?.trim()) {
      return NextResponse.json({ error: "Locale é obrigatório." }, { status: 400 });
    }

    if (!entries?.length) {
      return NextResponse.json(
        { error: "Nenhuma string enviada para tradução." },
        { status: 400 }
      );
    }

    if (entries.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Envie no máximo ${MAX_BATCH_SIZE} strings por vez.` },
        { status: 400 }
      );
    }

    const validEntries = entries.filter((entry) => entry.msgid?.trim());
    if (validEntries.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma string válida para traduzir." },
        { status: 400 }
      );
    }

    const translations = await translateWithProvider(
      provider,
      apiKey.trim(),
      locale.trim(),
      validEntries
    );

    return NextResponse.json({ translations });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const rawMessage =
      error instanceof Error ? error.message : "Erro ao traduzir com IA.";
    const message = sanitizeErrorMessage(rawMessage);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
