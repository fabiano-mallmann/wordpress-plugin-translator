"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBlankTranslationData,
  isValidTextDomain,
} from "@/lib/i18n/create-blank-po";
import { saveBlankSession } from "@/lib/i18n/upload-session";

const LOCALE_OPTIONS = [
  { code: "pt_BR", label: "Português (Brasil)" },
  { code: "pt_PT", label: "Português (Portugal)" },
  { code: "en_US", label: "English (US)" },
  { code: "es_ES", label: "Español" },
  { code: "fr_FR", label: "Français" },
  { code: "de_DE", label: "Deutsch" },
  { code: "it_IT", label: "Italiano" },
];

interface CreatePoFormProps {
  size?: "default" | "large";
}

export function CreatePoForm({ size = "default" }: CreatePoFormProps) {
  const router = useRouter();
  const [textDomain, setTextDomain] = useState("");
  const [locale, setLocale] = useState("pt_BR");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLarge = size === "large";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!isValidTextDomain(textDomain)) {
      setError(
        "Informe um text domain válido (ex.: meu-plugin). Use letras minúsculas, números e hífens."
      );
      return;
    }

    setLoading(true);

    try {
      const data = createBlankTranslationData(textDomain, locale, projectName);
      saveBlankSession({ data });
      router.push("/editor/new");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar tradução.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="text-domain">
          Text domain do plugin
        </label>
        <Input
          id="text-domain"
          placeholder="meu-plugin"
          value={textDomain}
          onChange={(event) => {
            setTextDomain(event.target.value);
            if (error) setError(null);
          }}
          className={isLarge ? "h-11" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Geralmente igual ao slug do plugin. Será usado no nome do arquivo (
          <code className="rounded bg-muted px-1">meu-plugin-pt_BR.po</code>).
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="create-locale">
          Idioma da tradução
        </label>
        <Select value={locale} onValueChange={(value) => value && setLocale(value)}>
          <SelectTrigger id="create-locale" className={isLarge ? "h-11" : ""}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALE_OPTIONS.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                {option.label} ({option.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="project-name">
          Nome do projeto <span className="text-muted-foreground">(opcional)</span>
        </label>
        <Input
          id="project-name"
          placeholder="Meu Plugin Incrível"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className={isLarge ? "h-11" : ""}
        />
      </div>

      <Button
        type="submit"
        className={isLarge ? "h-11 w-full sm:w-auto" : "w-full sm:w-auto"}
        disabled={loading || !textDomain.trim()}
      >
        {loading ? "Criando..." : "Criar tradução do zero"}
      </Button>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
