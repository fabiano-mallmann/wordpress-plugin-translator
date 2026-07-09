# WordPress Plugin Translator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

Community-maintained web tool to fetch, edit, and export translations for plugins from the official [WordPress.org](https://wordpress.org/plugins/) directory.

**Live demo:** [wordpress-plugin-translator.vercel.app](https://wordpress-plugin-translator.vercel.app)

---

## Why this project exists

Translating WordPress plugins often means juggling `.po` / `.mo` files, hunting down strings, and figuring out where to place files on the server. This project aims to make that workflow simpler:

- Pull existing translations from WordPress.org
- Upload your own `.po` file and edit in the browser
- Export ready-to-use `.po` and `.mo` files
- Follow a built-in installation guide

This is a **community project**. Contributions, ideas, bug reports, and improvements are welcome.

---

## Features

- Paste a plugin URL or slug from the official directory
- Upload an existing `.po` file for direct editing
- Fetch translations via the WordPress.org API
- Fallback to plugin `.pot` files when no published translation exists
- Visual string editor with search, filters, and progress tracking
- Export `.po` and `.mo` files
- Built-in WordPress installation tutorial

---

## Quick start

### Requirements

- Node.js 18+
- npm

### Run locally

```bash
git clone https://github.com/fabiano-mallmann/wordpress-plugin-translator.git
cd wordpress-plugin-translator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

---

## Usage

1. On the home page, paste a plugin URL **or upload a `.po` file**
2. Select the target language (default: `pt_BR`)
3. Edit translations in the editor
4. Export `.po` (keep editing) or `.mo` (install in WordPress)
5. Follow the tutorial to upload files to your server

Example plugin URL:

```
https://wordpress.org/plugins/contact-form-7/
```

---

## Project structure

```
app/           # Pages and API Route Handlers
components/    # UI components and editor
lib/           # WordPress.org client, PO/MO parser, ZIP utilities
types/         # Shared TypeScript types
```

---

## API routes

| Endpoint | Description |
|----------|-------------|
| `GET /api/plugin?slug=` | Plugin metadata and available locales |
| `GET /api/translations?slug=&locale=` | Translation strings for editing |
| `POST /api/upload-po` | Parse an uploaded `.po` file |
| `POST /api/export` | Generate a `.po` or `.mo` download |

---

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [gettext-parser](https://www.npmjs.com/package/gettext-parser) + [jszip](https://www.npmjs.com/package/jszip)

---

## Contributing

We welcome contributions from the community.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow, and guidelines
- Pick an [open issue](https://github.com/fabiano-mallmann/wordpress-plugin-translator/issues) or open a new one
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)

### Ideas for contributions

- Security hardening for file uploads
- Support for `.pot` uploads
- Theme translations (WordPress.org themes API)
- UI/UX improvements and accessibility
- i18n for the app interface itself
- Tests for PO/MO parsing and API routes

---

## Roadmap (community-driven)

These are not commitments — they reflect likely directions based on current scope:

- [ ] Rate limiting and upload validation hardening
- [ ] Manual `.pot` / `.po` batch upload improvements
- [ ] WordPress theme support
- [ ] Optional AI-assisted translation suggestions
- [ ] User accounts / cloud draft storage

Have another idea? [Open a feature request](https://github.com/fabiano-mallmann/wordpress-plugin-translator/issues/new/choose).

---

## Deploy your own instance

This app runs on [Vercel](https://vercel.com/) with zero config for Next.js:

```bash
npx vercel deploy --prod
```

No environment variables are required for the core WordPress.org integration.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Credits

Developed by [@fabs_dev](https://x.com/fabs_dev).

Maintained as an open community project. Use it, fork it, improve it, and share it.
