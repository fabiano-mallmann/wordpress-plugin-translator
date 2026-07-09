import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PluginInfo } from "@/types/wordpress";

interface PluginCardProps {
  plugin: Pick<
    PluginInfo,
    "slug" | "name" | "version" | "author" | "icon" | "availableLocales"
  >;
}

export function PluginCard({ plugin }: PluginCardProps) {
  const localeCount = plugin.availableLocales.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        {plugin.icon ? (
          <Image
            src={plugin.icon}
            alt=""
            width={64}
            height={64}
            className="rounded-lg shrink-0"
            unoptimized
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl font-bold">
            {plugin.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <CardTitle className="text-xl">{plugin.name}</CardTitle>
          <CardDescription className="mt-1">
            v{plugin.version}
            {plugin.author ? ` · ${plugin.author}` : ""}
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{plugin.slug}</Badge>
            {localeCount > 0 ? (
              <Badge variant="outline">
                {localeCount} {localeCount === 1 ? "idioma" : "idiomas"}
              </Badge>
            ) : (
              <Badge variant="outline">Sem traduções oficiais</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Selecione o idioma abaixo para carregar os textos existentes e editar
          as traduções.
        </p>
      </CardContent>
    </Card>
  );
}
