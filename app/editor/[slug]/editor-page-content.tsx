"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { TranslationEditor } from "@/components/translation-editor";
import { ExportPanel } from "@/components/export-panel";
import { TutorialPanel } from "@/components/tutorial/tutorial-panel";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TranslationData, TranslationEntry } from "@/types/wordpress";
import { loadUploadSession, loadBlankSession } from "@/lib/i18n/upload-session";
import { getBlankPoFilename } from "@/lib/i18n/create-blank-po";

export function EditorPageContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const locale = searchParams.get("locale") ?? "pt_BR";

  const [data, setData] = useState<TranslationData | null>(null);
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filename, setFilename] = useState<string | null>(null);
  const isUpload = slug === "upload";
  const isBlank = slug === "new";

  useEffect(() => {
    async function loadTranslations() {
      setLoading(true);
      setError(null);

      if (isBlank) {
        const session = loadBlankSession();
        if (!session) {
          setError(
            "Nenhuma tradução em andamento. Crie uma nova na página inicial."
          );
          setLoading(false);
          return;
        }

        setData(session.data);
        setEntries(session.data.entries);
        setFilename(getBlankPoFilename(session.data.textDomain, session.data.locale));
        setLoading(false);
        return;
      }

      if (isUpload) {
        const session = loadUploadSession();
        if (!session) {
          setError("Nenhum arquivo .po carregado. Envie um arquivo na página inicial.");
          setLoading(false);
          return;
        }

        setData(session.data);
        setEntries(session.data.entries);
        setFilename(session.filename);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/translations?slug=${encodeURIComponent(slug)}&locale=${encodeURIComponent(locale)}`
        );
        const result = await response.json();

        if (!response.ok) {
          setError(result.error ?? "Erro ao carregar traduções.");
          return;
        }

        setData(result);
        setEntries(result.entries);
        setFilename(null);
      } catch {
        setError("Erro ao carregar traduções.");
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [slug, locale, isUpload, isBlank]);

  const handleEntriesChange = useCallback((updated: TranslationEntry[]) => {
    setEntries(updated);
  }, []);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl flex-1 px-4 py-12 text-center">
          <p className="text-destructive">{error ?? "Erro ao carregar traduções."}</p>
          <Link
            href={isUpload || isBlank ? "/" : `/plugin/${slug}`}
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
          >
            Voltar
          </Link>
        </main>
      </>
    );
  }

  const sourceLabel =
    data.source === "blank"
      ? "Criado do zero"
      : data.source === "upload"
        ? "Arquivo enviado"
        : data.source === "wordpress-api"
          ? "Tradução oficial"
          : data.source === "pot-template"
            ? "Template (.pot)"
            : "Arquivo .po do plugin";

  const editorSlug = isUpload || isBlank ? data.textDomain : slug;
  const editorLocale = isUpload || isBlank ? data.locale : locale;
  const backHref = isUpload || isBlank ? "/" : `/plugin/${slug}`;
  const title =
    isUpload || isBlank ? (filename ?? data.textDomain) : slug;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl flex-1 px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href={backHref}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "-ml-2 mb-1 inline-flex"
              )}
            >
              ← Voltar
            </Link>
            <h1 className="text-2xl font-bold break-all">{title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline">{editorLocale}</Badge>
              <Badge variant="secondary">{sourceLabel}</Badge>
              <Badge variant="outline">{data.entries.length} strings</Badge>
              {data.textDomain && (isUpload || isBlank) && (
                <Badge variant="outline">{data.textDomain}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section>
            <TranslationEditor
              slug={editorSlug}
              locale={editorLocale}
              initialEntries={data.entries}
              onChange={handleEntriesChange}
              createMode={isBlank}
            />
          </section>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Exportar</CardTitle>
                <CardDescription>
                  Baixe os arquivos prontos para instalar no WordPress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportPanel
                  slug={editorSlug}
                  locale={editorLocale}
                  textDomain={data.textDomain}
                  entries={entries}
                  headers={data.headers}
                />
              </CardContent>
            </Card>

            <TutorialPanel
              textDomain={data.textDomain}
              locale={editorLocale}
              slug={editorSlug}
            />
          </aside>
        </div>
      </main>
    </>
  );
}
