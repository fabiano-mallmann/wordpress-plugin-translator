"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LocaleInfo } from "@/types/wordpress";

interface LocaleSelectorProps {
  locales: LocaleInfo[];
  value: string;
  onChange: (locale: string) => void;
  disabled?: boolean;
}

const FALLBACK_LOCALES: LocaleInfo[] = [
  {
    code: "pt_BR",
    englishName: "Portuguese (Brazil)",
    nativeName: "Português do Brasil",
    hasTranslation: false,
  },
  {
    code: "pt_PT",
    englishName: "Portuguese (Portugal)",
    nativeName: "Português",
    hasTranslation: false,
  },
  {
    code: "es_ES",
    englishName: "Spanish (Spain)",
    nativeName: "Español",
    hasTranslation: false,
  },
  {
    code: "en_US",
    englishName: "English (United States)",
    nativeName: "English (US)",
    hasTranslation: false,
  },
];

export function LocaleSelector({
  locales,
  value,
  onChange,
  disabled,
}: LocaleSelectorProps) {
  const options =
    locales.length > 0
      ? locales
      : FALLBACK_LOCALES.map((locale) => ({
          ...locale,
          hasTranslation: false,
        }));

  const selectedHasTranslation = options.find(
    (locale) => locale.code === value
  )?.hasTranslation;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor="locale-select">
        Idioma da tradução
      </label>
      <Select
        value={value}
        onValueChange={(next) => next && onChange(next)}
        disabled={disabled}
      >
        <SelectTrigger id="locale-select" className="w-full">
          <SelectValue placeholder="Selecione um idioma" />
        </SelectTrigger>
        <SelectContent>
          {options.map((locale) => (
            <SelectItem key={locale.code} value={locale.code}>
              {locale.nativeName} ({locale.code})
              {locale.hasTranslation ? " ✓" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {selectedHasTranslation
          ? "Tradução oficial disponível no WordPress.org"
          : "Será usado o template (.pot) do plugin, se disponível"}
      </p>
    </div>
  );
}
