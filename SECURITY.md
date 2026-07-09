# Security Policy

## Supported versions

Security fixes are applied to the latest version on the `master` branch.

| Version | Supported |
|---------|-----------|
| latest on `master` | yes |
| older deployments | no |

## Reporting a vulnerability

If you discover a security issue — especially related to file uploads, API abuse, or export handling — please **do not** open a public GitHub issue.

Instead:

1. Contact the maintainer via [GitHub profile](https://github.com/fabiano-mallmann) or the project owner on X ([@dev_fabs](https://x.com/dev_fabs))
2. Include a clear description and steps to reproduce
3. Allow reasonable time for a fix before public disclosure

## Scope

In scope:

- `/api/upload-po` file upload handling
- `/api/export` request validation
- Server-side parsing (PO/MO, ZIP)
- Client-side storage of uploaded translation data

Out of scope:

- Vulnerabilities in third-party WordPress.org infrastructure
- Issues in self-hosted deployments caused by misconfiguration outside this repository

Thank you for helping keep the community safe.
