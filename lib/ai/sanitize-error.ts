const SENSITIVE_PATTERNS = [
  /\bsk-[a-zA-Z0-9_-]{10,}\b/g,
  /\bsk-ant-[a-zA-Z0-9_-]+\b/g,
  /\bAIza[a-zA-Z0-9_-]{20,}\b/g,
  /\bxox[baprs]-[a-zA-Z0-9-]+\b/g,
];

export function sanitizeErrorMessage(message: string): string {
  let sanitized = message;
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[chave redigida]");
  }
  return sanitized;
}
