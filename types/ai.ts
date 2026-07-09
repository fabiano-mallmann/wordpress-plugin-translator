export type AiProvider = "openai" | "anthropic" | "gemini";

export interface AiSettings {
  provider: AiProvider;
  apiKey: string;
  rememberKey: boolean;
}

export interface AiTranslateEntry {
  msgid: string;
  msgctxt?: string;
}

export interface AiTranslateRequest {
  provider: AiProvider;
  apiKey: string;
  locale: string;
  entries: AiTranslateEntry[];
}

export interface AiTranslateResponse {
  translations: string[];
}

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: "OpenAI (GPT)",
  anthropic: "Anthropic (Claude)",
  gemini: "Google Gemini",
};

export const AI_PROVIDER_KEY_URLS: Record<AiProvider, string> = {
  openai: "https://platform.openai.com/api-keys",
  anthropic: "https://console.anthropic.com/settings/keys",
  gemini: "https://aistudio.google.com/apikey",
};
