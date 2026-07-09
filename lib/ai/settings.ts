import type { AiProvider, AiSettings } from "@/types/ai";

const SETTINGS_KEY = "wp-translate-ai-settings";
const SESSION_SETTINGS_KEY = "wp-translate-ai-session";
const AI_PROVIDERS: AiProvider[] = ["openai", "anthropic", "gemini"];

const DEFAULT_SETTINGS: AiSettings = {
  provider: "openai",
  apiKey: "",
  rememberKey: false,
};

function readStorage(storage: Storage, key: string): AiSettings | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    if (!parsed.provider || !AI_PROVIDERS.includes(parsed.provider)) {
      return null;
    }

    return {
      provider: parsed.provider,
      apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
      rememberKey: Boolean(parsed.rememberKey),
    };
  } catch {
    return null;
  }
}

export function loadAiSettings(): AiSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  const persisted = readStorage(localStorage, SETTINGS_KEY);
  if (persisted?.rememberKey) {
    return persisted;
  }

  const session = readStorage(sessionStorage, SESSION_SETTINGS_KEY);
  if (session) {
    return session;
  }

  if (persisted) {
    return {
      ...persisted,
      apiKey: "",
      rememberKey: false,
    };
  }

  return DEFAULT_SETTINGS;
}

export function saveAiSettings(settings: AiSettings): void {
  const payload: AiSettings = {
    provider: settings.provider,
    apiKey: settings.apiKey.trim(),
    rememberKey: settings.rememberKey,
  };

  if (payload.rememberKey) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    sessionStorage.removeItem(SESSION_SETTINGS_KEY);
    return;
  }

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      provider: payload.provider,
      apiKey: "",
      rememberKey: false,
    })
  );
  sessionStorage.setItem(SESSION_SETTINGS_KEY, JSON.stringify(payload));
}

export function clearAiSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
  sessionStorage.removeItem(SESSION_SETTINGS_KEY);
}

export function hasConfiguredAiKey(settings: AiSettings): boolean {
  return settings.apiKey.trim().length > 0;
}
