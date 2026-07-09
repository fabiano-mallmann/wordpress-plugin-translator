const SLUG_PATTERN = /^[a-z0-9-]+$/;
const URL_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?wordpress\.org\/plugins\/([a-z0-9-]+)\/?/i;

export function parsePluginSlug(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  const urlMatch = trimmed.match(URL_PATTERN);
  if (urlMatch) {
    return urlMatch[1].toLowerCase();
  }

  if (SLUG_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return null;
}

export function isValidPluginInput(input: string): boolean {
  return parsePluginSlug(input) !== null;
}
