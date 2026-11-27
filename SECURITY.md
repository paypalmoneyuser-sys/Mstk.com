# Security

- Never commit API keys, access tokens, passwords, private keys, or real user data.
- Keep provider credentials in server-side secret storage, never in frontend code.
- Do not enable wildcard CORS for authenticated or credential-bearing routes.
- Add authentication, authorization, rate limiting, request-size limits, and audit logging before exposing user or AI endpoints.
- Report suspected vulnerabilities privately to the repository owner; do not publish exploit details or real secrets in public issues.

This file describes development requirements. It does not certify that the application is production-secure.
