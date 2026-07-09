# WordPress Translate

Ferramenta web para buscar, editar e exportar traduções de plugins da loja oficial [WordPress.org](https://wordpress.org/plugins/).

## Funcionalidades

- Cole a URL ou slug de um plugin da loja oficial
- Envie um arquivo `.po` existente para editar diretamente
- Busca traduções existentes via API do WordPress.org
- Fallback para arquivos `.pot` do plugin quando não há tradução publicada
- Editor visual de strings com filtros e progresso
- Exportação de arquivos `.po` e `.mo`
- Tutorial integrado de instalação no WordPress

## Requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Uso

1. Na página inicial, cole a URL do plugin **ou envie um arquivo `.po`**
2. Selecione o idioma desejado (padrão: `pt_BR`)
3. Edite as traduções no editor
4. Exporte `.po` (para continuar editando) ou `.mo` (para instalar no WordPress)
5. Siga o tutorial para enviar os arquivos ao servidor

## Estrutura

```
app/           # Páginas e Route Handlers (API)
components/    # UI e editor
lib/           # Cliente WordPress.org, parser PO/MO, extrator ZIP
types/         # Tipos TypeScript
```

## API interna

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/plugin?slug=` | Metadados e idiomas disponíveis |
| `GET /api/translations?slug=&locale=` | Strings para edição |
| `POST /api/upload-po` | Processa arquivo `.po` enviado |
| `POST /api/export` | Gera download `.po` ou `.mo` |

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- gettext-parser + jszip

## Licença

MIT
