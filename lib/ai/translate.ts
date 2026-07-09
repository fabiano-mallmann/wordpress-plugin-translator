import type { AiProvider } from "@/types/ai";
import { buildTranslationPrompt, parseTranslationResponse } from "@/lib/ai/prompt";
import { sanitizeErrorMessage } from "@/lib/ai/sanitize-error";
import type { AiTranslateEntry } from "@/types/ai";

interface ProviderConfig {
  model: string;
  translate: (
    apiKey: string,
    locale: string,
    entries: AiTranslateEntry[]
  ) => Promise<string[]>;
}

async function callOpenAi(
  apiKey: string,
  locale: string,
  entries: AiTranslateEntry[]
): Promise<string[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: buildTranslationPrompt(locale, entries),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw await readProviderError(response, "OpenAI");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI retornou resposta vazia.");
  }

  return parseTranslationResponse(content, entries.length);
}

async function callAnthropic(
  apiKey: string,
  locale: string,
  entries: AiTranslateEntry[]
): Promise<string[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-latest",
      max_tokens: 4096,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: buildTranslationPrompt(locale, entries),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw await readProviderError(response, "Anthropic");
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const content = data.content?.find((block) => block.type === "text")?.text;

  if (!content) {
    throw new Error("Anthropic retornou resposta vazia.");
  }

  return parseTranslationResponse(content, entries.length);
}

async function callGemini(
  apiKey: string,
  locale: string,
  entries: AiTranslateEntry[]
): Promise<string[]> {
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
      contents: [
        {
          parts: [{ text: buildTranslationPrompt(locale, entries) }],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw await readProviderError(response, "Gemini");
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("Gemini retornou resposta vazia.");
  }

  return parseTranslationResponse(content, entries.length);
}

async function readProviderError(response: Response, provider: string): Promise<Error> {
  try {
    const data = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    const message =
      data.error?.message ?? data.message ?? `Erro ao conectar com ${provider}.`;
    return new Error(sanitizeErrorMessage(message));
  } catch {
    return new Error(`Erro ao conectar com ${provider}.`);
  }
}

const PROVIDERS: Record<AiProvider, ProviderConfig> = {
  openai: { model: "gpt-4o-mini", translate: callOpenAi },
  anthropic: { model: "claude-3-5-haiku-latest", translate: callAnthropic },
  gemini: { model: "gemini-2.0-flash", translate: callGemini },
};

export async function translateWithProvider(
  provider: AiProvider,
  apiKey: string,
  locale: string,
  entries: AiTranslateEntry[]
): Promise<string[]> {
  return PROVIDERS[provider].translate(apiKey, locale, entries);
}

export const MAX_BATCH_SIZE = 25;
