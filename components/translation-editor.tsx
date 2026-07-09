"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  createMode?: boolean;
}

function getDraftKey(slug: string, locale: string) {
  return `wp-translate-draft:${slug}:${locale}`;
}

export function persistDraft(
  slug: string,
  locale: string,
  entries: TranslationEntry[]
) {
  localStorage.setItem(getDraftKey(slug, locale), JSON.stringify(entries));
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

function resolveInitialEntries(
  slug: string,
  locale: string,
  initialEntries: TranslationEntry[],
  createMode: boolean
): TranslationEntry[] {
  const draft = loadDraft(slug, locale);

  if (createMode && draft) {
    return draft;
  }

  if (!createMode && draft && draft.length === initialEntries.length) {
    return draft;
  }

  return initialEntries;
}

export function TranslationEditor({
  slug,
  locale,
  initialEntries,
  onChange,
  createMode = false,
}: TranslationEditorProps) {
  const [entries, setEntries] = useState<TranslationEntry[]>(() =>
    resolveInitialEntries(slug, locale, initialEntries, createMode)
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setEntries(resolveInitialEntries(slug, locale, initialEntries, createMode));
  }, [slug, locale, createMode]);

  useEffect(() => {
    persistDraft(slug, locale, entries);
    onChangeRef.current(entries);
  }, [entries, slug, locale]);

  const updateEntry = useCallback(
    (index: number, field: "msgid" | "msgstr", value: string) => {
      setEntries((current) =>
        current.map((entry, i) =>
          i === index ? { ...entry, [field]: value } : entry
        )
      );
    },
    []
  );

  const addEntry = useCallback(() => {
    setEntries((current) => [...current, { msgid: "", msgstr: "" }]);
  }, []);

  const removeEntry = useCallback((index: number) => {
    setEntries((current) => current.filter((_, i) => i !== index));
  }, []);

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

  const translatedCount = entries.filter(
    (entry) => entry.msgid.trim() && entry.msgstr.trim().length > 0
  ).length;
  const totalCount = entries.filter((entry) => entry.msgid.trim()).length;

  return (
    <div className="space-y-4">
      <TranslationProgress
        total={createMode ? totalCount : entries.length}
        translated={translatedCount}
      />

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
        {createMode && (
          <Button type="button" onClick={addEntry} className="shrink-0">
            Adicionar string
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={createMode ? "w-[45%]" : "w-1/2"}>
                Original
              </TableHead>
              <TableHead className={createMode ? "w-[45%]" : "w-1/2"}>
                Tradução
              </TableHead>
              {createMode && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={createMode ? 3 : 2}
                  className="py-8 text-center text-muted-foreground"
                >
                  {createMode && entries.length === 0
                    ? "Nenhuma string ainda. Clique em \"Adicionar string\" para começar."
                    : "Nenhuma string encontrada com os filtros atuais."}
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map(({ entry, index }) => (
                <TableRow key={index}>
                  <TableCell className="align-top">
                    {entry.msgctxt && (
                      <p className="mb-1 text-xs text-muted-foreground">
                        Contexto: {entry.msgctxt}
                      </p>
                    )}
                    {createMode ? (
                      <Textarea
                        value={entry.msgid}
                        onChange={(event) =>
                          updateEntry(index, "msgid", event.target.value)
                        }
                        rows={2}
                        className="min-h-[60px] resize-y text-sm"
                        placeholder="Texto original em inglês..."
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{entry.msgid}</p>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    <Textarea
                      value={entry.msgstr}
                      onChange={(event) =>
                        updateEntry(index, "msgstr", event.target.value)
                      }
                      rows={Math.min(
                        6,
                        Math.max(2, (entry.msgid || " ").split("\n").length)
                      )}
                      className="min-h-[60px] resize-y text-sm"
                      placeholder="Digite a tradução..."
                    />
                  </TableCell>
                  {createMode && (
                    <TableCell className="align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remover string"
                        onClick={() => removeEntry(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {createMode && entries.length > 0 && (
        <Button type="button" variant="outline" onClick={addEntry}>
          Adicionar string
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        Rascunho salvo automaticamente no navegador.
      </p>
    </div>
  );
}
