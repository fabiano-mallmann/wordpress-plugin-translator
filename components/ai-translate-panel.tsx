"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  hasConfiguredAiKey,
  loadAiSettings,
  saveAiSettings,
} from "@/lib/ai/settings";
import { MAX_BATCH_SIZE } from "@/lib/ai/translate";
import type { AiProvider, AiSettings } from "@/types/ai";
import {
  AI_PROVIDER_KEY_URLS,
  AI_PROVIDER_LABELS,
} from "@/types/ai";
import type { TranslationEntry } from "@/types/wordpress";
import { persistDraft } from "@/components/translation-editor";

interface AiTranslatePanelProps {
  slug: string;
  locale: string;
  entries: TranslationEntry[];
  onTranslated: (entries: TranslationEntry[]) => void;
}

export function AiTranslatePanel({
  slug,
  locale,
  entries,
  onTranslated,
}: AiTranslatePanelProps) {
  const [settings, setSettings] = useState<AiSettings>(() => loadAiSettings());
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  useEffect(() => {
    setSettings(loadAiSettings());
  }, []);

  const untranslatedCount = entries.filter(
    (entry) => entry.msgid.trim() && !entry.msgstr.trim()
  ).length;

  function handleSaveSettings() {
    saveAiSettings(settings);
    setSaved(true);
    setError(null);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function handleAutoTranslate() {
    setError(null);
    setProgress(null);

    if (!hasConfiguredAiKey(settings)) {
      setError("Salve uma chave de API antes de traduzir.");
      return;
    }

    const pending = entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.msgid.trim() && !entry.msgstr.trim());

    if (pending.length === 0) {
      setError("Não há strings não traduzidas.");
      return;
    }

    setLoading(true);
    const updated = [...entries];

    try {
      for (let offset = 0; offset < pending.length; offset += MAX_BATCH_SIZE) {
        const batch = pending.slice(offset, offset + MAX_BATCH_SIZE);
        setProgress(
          `Traduzindo ${Math.min(offset + batch.length, pending.length)} de ${pending.length}...`
        );

        const response = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: settings.provider,
            apiKey: settings.apiKey,
            locale,
            entries: batch.map(({ entry }) => ({
              msgid: entry.msgid,
              msgctxt: entry.msgctxt,
            })),
          }),
        });

        const data = (await response.json()) as {
          translations?: string[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Erro ao traduzir com IA.");
        }

        batch.forEach(({ index }, batchIndex) => {
          updated[index] = {
            ...updated[index],
            msgstr: data.translations?.[batchIndex] ?? "",
          };
        });
      }

      onTranslated(updated);
      persistDraft(slug, locale, updated);
      setProgress("Tradução concluída.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao traduzir com IA.");
      if (updated.some((entry, index) => entry.msgstr !== entries[index]?.msgstr)) {
        onTranslated(updated);
        persistDraft(slug, locale, updated);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="size-4" />
          Tradução com IA
        </CardTitle>
        <CardDescription>
          Use sua própria chave de API. A tradução passa pelo nosso servidor
          (via HTTPS) e é encaminhada ao provedor — a chave não é armazenada no
          backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ai-provider">
            Provedor
          </label>
          <Select
            value={settings.provider}
            onValueChange={(value) =>
              value &&
              setSettings((current) => ({
                ...current,
                provider: value as AiProvider,
              }))
            }
          >
            <SelectTrigger id="ai-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(AI_PROVIDER_LABELS) as AiProvider[]).map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {AI_PROVIDER_LABELS[provider]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ai-api-key">
            Chave de API
          </label>
          <Input
            id="ai-api-key"
            type="password"
            autoComplete="off"
            placeholder="sk-..."
            value={settings.apiKey}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                apiKey: event.target.value,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Obtenha sua chave em{" "}
            <a
              href={AI_PROVIDER_KEY_URLS[settings.provider]}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              {AI_PROVIDER_LABELS[settings.provider]}
            </a>
            . Use uma chave com limite de uso e revogue-a se suspeitar de abuso.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.rememberKey}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                rememberKey: event.target.checked,
              }))
            }
            className="mt-0.5 size-4 rounded border-input"
          />
          <span>
            Salvar chave neste navegador
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Desmarcado: a chave fica só nesta sessão e some ao fechar o
              navegador.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" onClick={handleSaveSettings}>
            {saved ? "Configuração salva" : "Salvar configuração"}
          </Button>
          <Button
            type="button"
            disabled={loading || untranslatedCount === 0}
            onClick={handleAutoTranslate}
          >
            {loading
              ? "Traduzindo..."
              : `Traduzir automaticamente (${untranslatedCount})`}
          </Button>
        </div>

        {progress && (
          <p className="text-sm text-muted-foreground" role="status">
            {progress}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
