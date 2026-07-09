interface InstallStepsProps {
  textDomain: string;
  locale: string;
  slug: string;
  compact?: boolean;
}

export function InstallSteps({
  textDomain,
  locale,
  slug,
  compact = false,
}: InstallStepsProps) {
  const poFilename = `${textDomain}-${locale}.po`;
  const moFilename = `${textDomain}-${locale}.mo`;
  const globalPath = `wp-content/languages/plugins/${moFilename}`;
  const pluginPath = `wp-content/plugins/${slug}/languages/${moFilename}`;

  const steps = [
    {
      title: "1. Exporte os arquivos",
      content: (
        <>
          Baixe o arquivo <code className="rounded bg-muted px-1">{poFilename}</code>{" "}
          para editar e o{" "}
          <code className="rounded bg-muted px-1">{moFilename}</code> para instalar no
          WordPress. O WordPress usa o arquivo <strong>.mo</strong> em produção.
        </>
      ),
    },
    {
      title: "2. Envie para o servidor",
      content: (
        <>
          Use FTP, SFTP ou o gerenciador de arquivos do seu hosting para enviar o{" "}
          <code className="rounded bg-muted px-1">{moFilename}</code> para:
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {globalPath}
          </pre>
        </>
      ),
    },
    {
      title: "3. Nomeie corretamente",
      content: (
        <>
          O nome do arquivo deve seguir o padrão{" "}
          <code className="rounded bg-muted px-1">
            {"{text-domain}-{locale}.mo"}
          </code>
          . Exemplo:{" "}
          <code className="rounded bg-muted px-1">{moFilename}</code>
        </>
      ),
    },
    {
      title: "4. Alternativa: pasta do plugin",
      content: (
        <>
          Você também pode colocar os arquivos dentro da pasta do plugin:
          <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {pluginPath}
          </pre>
        </>
      ),
    },
    {
      title: "5. Configure o idioma do site",
      content: (
        <>
          No painel WordPress, acesse{" "}
          <strong>Configurações → Geral → Idioma do site</strong> e selecione o
          idioma correspondente ({locale}).
        </>
      ),
    },
    {
      title: "6. Atualize traduções (opcional)",
      content: (
        <>
          Em <strong>Painel → Atualizações</strong>, clique em &quot;Atualizar
          traduções&quot; quando disponível. Plugins da loja oficial recebem
          traduções automaticamente via translate.wordpress.org; arquivos manuais
          são úteis para customização.
        </>
      ),
    },
  ];

  const visibleSteps = compact ? steps.slice(0, 3) : steps;

  return (
    <div className="space-y-2">
      {visibleSteps.map((step) => (
        <details key={step.title} className="group rounded-lg border px-4 py-1">
          <summary className="cursor-pointer py-2 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
            {step.title}
          </summary>
          <div className="pb-3 text-sm text-muted-foreground">{step.content}</div>
        </details>
      ))}
    </div>
  );
}
