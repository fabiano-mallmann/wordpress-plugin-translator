"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidPluginInput, parsePluginSlug } from "@/lib/wordpress/parse-slug";

interface UrlInputProps {
  defaultValue?: string;
  size?: "default" | "large";
}

export function UrlInput({ defaultValue = "", size = "default" }: UrlInputProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const slug = parsePluginSlug(value);
    if (!slug) {
      setError("Cole uma URL válida da loja WordPress.org");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/plugin?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Plugin não encontrado.");
        return;
      }

      router.push(`/plugin/${slug}`);
    } catch {
      setError("Erro ao conectar com WordPress.org. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className={`flex gap-2 ${isLarge ? "flex-col sm:flex-row" : ""}`}>
        <Input
          type="text"
          placeholder="https://wordpress.org/plugins/contact-form-7/"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          className={isLarge ? "h-12 text-base" : ""}
          aria-label="URL ou slug do plugin WordPress"
        />
        <Button
          type="submit"
          disabled={loading || !isValidPluginInput(value)}
          className={isLarge ? "h-12 px-8" : ""}
        >
          {loading ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
