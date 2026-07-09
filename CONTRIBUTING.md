# Contributing to WordPress Plugin Translator

Thank you for your interest in contributing. This is a community project — every bug report, doc improvement, and pull request helps.

## Ways to contribute

- Report bugs
- Suggest features
- Improve documentation
- Fix issues or add features via pull requests
- Review pull requests from other contributors
- Share the project with others who translate WordPress plugins

## Before you start

1. Check [open issues](https://github.com/fabiano-mallmann/wordpress-plugin-translator/issues) to avoid duplicate work
2. For large changes, open an issue first to discuss the approach
3. Read the [Code of Conduct](CODE_OF_CONDUCT.md)

## Development setup

```bash
git clone https://github.com/fabiano-mallmann/wordpress-plugin-translator.git
cd wordpress-plugin-translator
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint |

## Branch and commit workflow

1. Fork the repository
2. Create a branch from `master`:
   - `feature/short-description`
   - `fix/short-description`
   - `docs/short-description`
3. Make focused changes — one concern per pull request when possible
4. Write clear commit messages in English (imperative mood):
   - `Add PO upload validation for entry count`
   - `Fix locale selector when no translations exist`
5. Open a pull request against `master`

## Pull request checklist

Before submitting, please ensure:

- [ ] The code builds locally (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Changes are scoped to the problem being solved
- [ ] UI changes are responsive (mobile + desktop)
- [ ] Error states are handled with user-friendly messages
- [ ] README or docs updated if behavior changed
- [ ] No secrets, API keys, or `.env` files committed

## Code guidelines

- **TypeScript** — prefer typed interfaces in `types/`
- **UI** — follow existing patterns with Tailwind + shadcn/ui components
- **API routes** — keep WordPress.org fetches server-side
- **i18n files** — PO/MO logic belongs in `lib/i18n/`
- **Scope** — avoid unrelated refactors in the same PR

### Project areas

| Area | Path | Notes |
|------|------|-------|
| Pages | `app/` | Next.js App Router |
| API | `app/api/` | Route Handlers |
| Components | `components/` | React UI |
| WordPress client | `lib/wordpress/` | External API integration |
| PO/MO parsing | `lib/i18n/` | gettext-parser wrappers |
| ZIP extraction | `lib/zip/` | Translation pack handling |

## Reporting bugs

Use the [bug report template](https://github.com/fabiano-mallmann/wordpress-plugin-translator/issues/new/choose) and include:

- Steps to reproduce
- Expected vs actual behavior
- Browser and OS (if UI-related)
- Plugin slug or sample `.po` file (if safe to share)

## Suggesting features

Use the [feature request template](https://github.com/fabiano-mallmann/wordpress-plugin-translator/issues/new/choose) and describe:

- The problem you're trying to solve
- Your proposed solution
- Alternatives you considered

## Security

If you find a security vulnerability related to file uploads or API abuse, please **do not** open a public issue. Contact the maintainer via GitHub or report it responsibly with enough detail to reproduce.

## Questions

Open a [GitHub Discussion](https://github.com/fabiano-mallmann/wordpress-plugin-translator/discussions) or an issue labeled `question`.

---

Thanks again for helping improve WordPress plugin translations for everyone.
