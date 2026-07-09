"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TranslationProgress } from "@/components/translation-progress";
import type { TranslationEntry } from "@/types/wordpress";

type FilterMode = "all" | "translated" | "untranslated";

interface TranslationEditorProps {
  slug: string;
  locale: string;
  initialEntries: TranslationEntry[];
  onChange: (entries: TranslationEntry[]) => void;
}

function getDraftKey(slug: string, locale: string) {
  return `wp-translate-draft:${slug}:${locale}`;
}

export function loadDraft(
  slug: string,
  locale: string
): TranslationEntry[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(getDraftKey(slug, locale));
    return raw ? (JSON.parse(raw) as TranslationEntry[]) : null;
  } catch {
    return null;
  }
}

export function TranslationEditor({
  slug,
  locale,
  initialEntries,
  onChange,
}: TranslationEditorProps) {
  const [entries, setEntries] = useState<TranslationEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  useEffect(() => {
    const draft = loadDraft(slug, locale);
    if (draft && draft.length === initialEntries.length) {
      setEntries(draft);
      onChange(draft);
    } else {
      setEntries(initialEntries);
      onChange(initialEntries);
    }
  }, [slug, locale, initialEntries, onChange]);

  const updateEntry = useCallback(
    (index: number, msgstr: string) => {
      setEntries((current) => {
        const next = current.map((entry, i) =>
          i === index ? { ...entry, msgstr } : entry
        );
        localStorage.setItem(getDraftKey(slug, locale), JSON.stringify(next));
        onChange(next);
        return next;
      });
    },
    [slug, locale, onChange]
  );

  const filteredEntries = useMemo(() => {
    return entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        const query = search.toLowerCase();
        const matchesSearch =
          !query ||
          entry.msgid.toLowerCase().includes(query) ||
          entry.msgstr.toLowerCase().includes(query);

        const isTranslated = entry.msgstr.trim().length > 0;
        const matchesFilter =
          filter === "all" ||
          (filter === "translated" && isTranslated) ||
          (filter === "untranslated" && !isTranslated);

        return matchesSearch && matchesFilter;
      });
  }, [entries, search, filter]);

  const translatedCount = entries.filter((e) => e.msgstr.trim().length > 0).length;

  return (
    <div className="space-y-4">
      <TranslationProgress total={entries.length} translated={translatedCount} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Buscar strings..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1"
        />
        <Select
          value={filter}
          onValueChange={(value) => value && setFilter(value as FilterMode)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="untranslated">Não traduzidas</SelectItem>
            <SelectItem value="translated">Traduzidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Original</TableHead>
              <TableHead className="w-1/2">Tradução</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                  Nenhuma string encontrada com os filtros atuais.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map(({ entry, index }) => (
                <TableRow key={`${index}-${entry.msgid.slice(0, 40)}`}>
                  <TableCell className="align-top">
                    {entry.msgctxt && (
                      <p className="mb-1 text-xs text-muted-foreground">
                        Contexto: {entry.msgctxt}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm">{entry.msgid}</p>
                  </TableCell>
                  <TableCell className="align-top">
                    <Textarea
                      value={entry.msgstr}
                      onChange={(event) => updateEntry(index, event.target.value)}
                      rows={Math.min(6, Math.max(2, entry.msgid.split("\n").length))}
                      className="min-h-[60px] resize-y text-sm"
                      placeholder="Digite a tradução..."
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Rascunho salvo automaticamente no navegador.
      </p>
    </div>
  );
}
