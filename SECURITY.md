# Security

- Never commit API keys, access tokens, passwords, private keys, or real user data.
- Store provider credentials as server-side Cloudflare Worker secrets; access them only through the Worker environment. Never expose them to browser code, responses, or logs.
- Do not commit real `.env` or `.dev.vars` files. Keep only placeholder variable names in examples.
- Do not enable wildcard CORS for authenticated or credential-bearing routes.
- Non-health API routes require the `MSTK_RATE_LIMITER` binding and fail closed with 503 if it is missing or unavailable.
- API requests with bodies require a valid Content-Length and are limited to one MiB at the Worker boundary. Future streaming handlers must additionally count bytes as they read.
- Authentication, authorization, per-user quotas, abuse monitoring, audit logging, and production incident response remain required before public user/AI endpoints are enabled.
- Do not log authorization headers, cookies, provider keys, raw prompts containing personal data, or raw client IP addresses.
- Report suspected vulnerabilities privately to the repository owner; do not publish exploit details or real secrets in public issues.

This file describes implemented scaffold controls and remaining requirements. It does not certify that the application is production-secure.
