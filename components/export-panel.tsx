"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TranslationEntry } from "@/types/wordpress";

interface ExportPanelProps {
  slug: string;
  locale: string;
  textDomain: string;
  entries: TranslationEntry[];
  headers: Record<string, string>;
}

async function downloadFile(
  slug: string,
  locale: string,
  textDomain: string,
  format: "po" | "mo",
  entries: TranslationEntry[],
  headers: Record<string, string>
) {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      locale,
      textDomain,
      format,
      entries,
      headers,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error ?? "Erro ao exportar arquivo.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${textDomain}-${locale}.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel({
  slug,
  locale,
  textDomain,
  entries,
  headers,
}: ExportPanelProps) {
  const [loading, setLoading] = useState<"po" | "mo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(format: "po" | "mo") {
    setLoading(format);
    setError(null);

    try {
      await downloadFile(slug, locale, textDomain, format, entries, headers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao exportar.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1"
          disabled={loading !== null}
          onClick={() => handleExport("po")}
        >
          {loading === "po" ? "Exportando..." : "Baixar .po"}
        </Button>
        <Button
          className="flex-1"
          disabled={loading !== null}
          onClick={() => handleExport("mo")}
        >
          {loading === "mo" ? "Exportando..." : "Baixar .mo"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Use o <strong>.mo</strong> no WordPress. O <strong>.po</strong> é útil para
        continuar editando depois.
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
