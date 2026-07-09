import type { TranslationData } from "@/types/wordpress";

export const UPLOAD_SESSION_KEY = "wp-translate-upload";
export const BLANK_SESSION_KEY = "wp-translate-blank";

export interface UploadSession {
  data: TranslationData;
  filename: string;
}

export interface BlankSession {
  data: TranslationData;
}

export function saveUploadSession(session: UploadSession): void {
  sessionStorage.setItem(UPLOAD_SESSION_KEY, JSON.stringify(session));
}

export function saveBlankSession(session: BlankSession): void {
  sessionStorage.setItem(BLANK_SESSION_KEY, JSON.stringify(session));
}

export function loadUploadSession(): UploadSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(UPLOAD_SESSION_KEY);
    return raw ? (JSON.parse(raw) as UploadSession) : null;
  } catch {
    return null;
  }
}

export function loadBlankSession(): BlankSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(BLANK_SESSION_KEY);
    return raw ? (JSON.parse(raw) as BlankSession) : null;
  } catch {
    return null;
  }
}

export function clearUploadSession(): void {
  sessionStorage.removeItem(UPLOAD_SESSION_KEY);
}

export function clearBlankSession(): void {
  sessionStorage.removeItem(BLANK_SESSION_KEY);
}
