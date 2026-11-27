# MSTK.COM — Backend and authentication foundation

This branch builds on the backend scaffold and adds a protected API boundary using Supabase asymmetric JWT verification. It remains a foundation, not a complete or deployed application.

## Included

- Cloudflare Worker API scaffold at `src/index.js`
- Public `GET /api/health`; protected `GET /api/me`
- Supabase JWKS signature verification for ES256 and RS256 access tokens
- Issuer, audience, role, subject, expiry, not-before, and issued-at checks
- Strict single-origin CORS, security headers, request-size guard, fail-closed rate-limit binding
- Supabase schema migrations and local PostgreSQL smoke tests
- Server-side `POST /api/ai/chat` adapter, disabled by default, requiring a verified user session
- AI adapter validates HTTPS endpoint configuration, limits prompts to 12,000 characters, uses a 30-second timeout, and returns generic provider errors

## Local checks

Requires Node.js 20 or newer.

```sh
npm test
npm run check
```

## Configuration

Set `ALLOWED_ORIGIN` to the exact HTTPS MSTK frontend origin and `SUPABASE_URL` to the HTTPS Supabase project URL. Configure Supabase Auth with asymmetric ES256 or RS256 signing keys. Legacy HS256 tokens are rejected.

Before enabling protected API routes in Cloudflare, configure the `MSTK_RATE_LIMITER` binding. Requests fail closed if it is missing.

The AI adapter remains disabled unless `MSTK_AI_ENABLED=true`. To configure one compatible OpenAI-style chat provider, set `MSTK_AI_CHAT_COMPLETIONS_URL` to its official HTTPS chat-completions endpoint, `MSTK_AI_MODEL` to an allowed model identifier, and `MSTK_AI_API_KEY` as a server-side Worker secret. Never put provider credentials in browser code or committed files. Only configure providers whose age rules and terms permit the intended users; do not enable 18+ services for teen-facing use. Provider charges may apply; no provider is configured or enabled by this change.

## Current limitations

- AI provider connection is a generic adapter only; no provider has been selected, configured, or live-tested.
- No signup/login UI, email verification, password recovery, logout UI, or complete session lifecycle is production-verified.
- JWT verification has not been tested against a live Supabase project or real tokens.
- No workspace database operations, per-resource authorization, usage metering, quota enforcement, or provider-specific policy checks are implemented.
- No user-facing prompt retention controls; do not send sensitive personal information. Provider processing and retention terms apply.
- The Cloudflare rate-limit binding and production frontend origin are not configured.
- Future streaming/upload handlers must enforce actual bytes read, not only declared Content-Length.
- No production deployment, custom domain, monitoring, or end-to-end Cloudflare test is configured.
- No paid service has been enabled or purchased.

Do not expose user data or provider credentials until authentication, authorization, database policies, upload controls, monitoring, and production verification are complete.
