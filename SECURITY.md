# Security Policy

## Reporting a vulnerability

Please do not report exploitable security issues in public issue threads. Contact the repository maintainers through GitHub's private vulnerability reporting feature when enabled, or request a private security contact from the maintainers.

Include the affected version/commit, a clear impact summary, and reproducible steps. Do not include real credentials or personal data.

## Scope and current protections

- Express uses Helmet, restricted CORS, a bounded JSON body, request rate limits, schema validation for catalog pagination, and sanitized API errors.
- Database access is intended to use Prisma parameterized queries. The current read API is backed by the curated local snapshot and does not expose authentication or write endpoints.
- Authentication is not implemented. Do not store passwords or user data in this release.
- Keep `DATABASE_URL`, `JWT_SECRET`, and deployment values out of Git. Rotate secrets if they are exposed.
- Run `npm audit` and keep dependencies current. Report vulnerable packages rather than suppressing advisories without a documented reason.
