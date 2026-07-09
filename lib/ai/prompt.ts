import type { AiTranslateEntry } from "@/types/ai";
import { getLocaleName } from "@/lib/ai/locale-names";

export function buildTranslationPrompt(
  locale: string,
  entries: AiTranslateEntry[]
): string {
  const targetLanguage = getLocaleName(locale);
  const payload = entries.map((entry, index) => ({
    index,
    text: entry.msgid,
    context: entry.msgctxt ?? null,
  }));

  return `You translate WordPress plugin UI strings for software localization.

Target language: ${targetLanguage} (${locale})

Rules:
- Translate only the "text" field into ${targetLanguage}.
- Keep placeholders exactly as they are (%s, %d, %1$s, {name}, etc.).
- Keep HTML tags, punctuation, and capitalization style appropriate for UI text.
- Do not add explanations.
- Return ONLY valid JSON in this shape: {"translations":["...","..."]}
- The translations array must have exactly ${entries.length} items in the same order as the input.

Input strings:
${JSON.stringify(payload, null, 2)}`;
}

export function parseTranslationResponse(content: string, expectedCount: number): string[] {
  const trimmed = content.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("A IA não retornou JSON válido.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { translations?: unknown };
  if (!Array.isArray(parsed.translations)) {
    throw new Error("Resposta da IA sem lista de traduções.");
  }

  const translations = parsed.translations.map((item) =>
    typeof item === "string" ? item : String(item ?? "")
  );

  if (translations.length !== expectedCount) {
    throw new Error(
      `A IA retornou ${translations.length} traduções, mas eram esperadas ${expectedCount}.`
    );
  }

  return translations;
}
