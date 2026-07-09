"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { PluginCard } from "@/components/plugin-card";
import { LocaleSelector } from "@/components/locale-selector";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LocaleInfo, PluginInfo } from "@/types/wordpress";

export function PluginPageContent() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;

  const [plugin, setPlugin] = useState<PluginInfo | null>(null);
  const [locale, setLocale] = useState(searchParams.get("locale") ?? "pt_BR");
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlugin() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/plugin?slug=${encodeURIComponent(slug)}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error ?? "Plugin não encontrado.");
          return;
        }

        setPlugin(data);

        const hasPtBr = data.availableLocales?.some(
          (item: LocaleInfo) => item.code === "pt_BR"
        );
        if (hasPtBr) {
          setLocale("pt_BR");
        } else if (data.availableLocales?.length > 0) {
          setLocale(data.availableLocales[0].code);
        }
      } catch {
        setError("Erro ao conectar com WordPress.org. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadPlugin();
  }, [slug]);

  const selectedLocale = plugin?.availableLocales.find(
    (item) => item.code === locale
  );

  const handleOpenEditor = useCallback(async () => {
    setOpening(true);
    router.push(`/editor/${slug}?locale=${encodeURIComponent(locale)}`);
  }, [router, slug, locale]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl flex-1 px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-32 rounded-lg bg-muted" />
            <div className="h-10 rounded bg-muted" />
            <div className="h-10 rounded bg-muted w-1/3" />
          </div>
        </main>
      </>
    );
  }

  if (error || !plugin) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl flex-1 px-4 py-12 text-center">
          <p className="text-destructive">{error ?? "Plugin não encontrado."}</p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
          >
            Voltar
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-8">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mb-4 -ml-2 inline-flex"
          )}
        >
          ← Voltar
        </Link>

        <PluginCard plugin={plugin} />

        <div className="mt-6 space-y-6 rounded-lg border p-6">
          <LocaleSelector
            locales={plugin.availableLocales}
            value={locale}
            onChange={setLocale}
          />

          <div className="flex flex-wrap items-center gap-2">
            {selectedLocale?.hasTranslation ? (
              <Badge>Tradução existente</Badge>
            ) : (
              <Badge variant="secondary">Usando template (.pot)</Badge>
            )}
          </div>

          <Button
            className="w-full sm:w-auto"
            size="lg"
            onClick={handleOpenEditor}
            disabled={opening}
          >
            {opening ? "Carregando editor..." : "Abrir editor"}
          </Button>
        </div>
      </main>
    </>
  );
}
