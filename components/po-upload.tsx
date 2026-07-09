"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveUploadSession } from "@/lib/i18n/upload-session";
import type { TranslationData } from "@/types/wordpress";

interface PoUploadProps {
  size?: "default" | "large";
}

export function PoUpload({ size = "default" }: PoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function processFile(file: File) {
    setError(null);

    if (!file.name.toLowerCase().endsWith(".po")) {
      setError("Apenas arquivos .po são aceitos.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-po", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as TranslationData & { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Erro ao processar o arquivo.");
        return;
      }

      saveUploadSession({ data, filename: file.name });
      router.push("/editor/upload");
    } catch {
      setError("Erro ao enviar o arquivo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    event.target.value = "";
  }

  async function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }

  const isLarge = size === "large";

  return (
    <div className="w-full space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".po,text/plain"
          onChange={handleFileChange}
          className="hidden"
          id="po-upload-input"
        />
        <p className="text-sm text-muted-foreground">
          Arraste um arquivo <strong>.po</strong> aqui ou
        </p>
        <Button
          type="button"
          variant="outline"
          className={`mt-3 ${isLarge ? "h-11 px-6" : ""}`}
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? "Processando..." : "Selecionar arquivo .po"}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          Ex.: <code className="rounded bg-muted px-1">meu-plugin-pt_BR.po</code>
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
