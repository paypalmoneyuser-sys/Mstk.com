# MSTK.COM — Backend and authentication foundation

This branch builds on the backend scaffold and adds a protected API boundary using Supabase asymmetric JWT verification. It is still a foundation, not a complete or deployed application.

## Included

- Cloudflare Worker API scaffold at `src/index.js`
- Public `GET /api/health` endpoint
- Protected `GET /api/me` endpoint
- Supabase JWKS signature verification for ES256 and RS256 access tokens
- Issuer, audience, role, subject, expiry, not-before, and issued-at checks
- Short-lived in-isolate JWKS cache and fail-closed verification behavior
- Strict single-origin CORS, baseline security headers, request-size guard, and fail-closed rate-limit binding requirement
- Supabase schema migrations and local PostgreSQL smoke-test suite
- Node.js tests for API and authentication guard behavior

## Local checks

Requires Node.js 20 or newer.

```sh
npm test
npm run check
```

## Configuration

Set `ALLOWED_ORIGIN` to the exact HTTPS origin of the MSTK frontend and `SUPABASE_URL` to the HTTPS Supabase project URL. Configure Supabase Auth to use asymmetric ES256 or RS256 signing keys exposed by the project's JWKS endpoint. Legacy HS256 access tokens are intentionally rejected.

Before enabling non-health API routes in Cloudflare, configure the Rate Limiting binding named `MSTK_RATE_LIMITER`. The application returns HTTP 503 when it is missing or unavailable.

Store provider credentials only as server-side Worker secrets. Never place real credentials in frontend code, source files, committed `.env` files, logs, or client responses. No secrets or live credentials are included.

## Current limitations

- No signup/login UI, email verification, password recovery, logout UI, or complete session lifecycle is implemented.
- JWT verification has not yet been tested against a live Supabase project or real issued access/refresh tokens.
- The Worker does not yet connect protected user operations to Supabase PostgREST/database queries.
- Per-resource authorization and workspace membership checks must be added to each future endpoint; never trust a client-supplied user ID.
- The Cloudflare rate-limit binding and production frontend origin are not configured here.
- Future streaming/upload handlers must enforce actual bytes read, not only declared Content-Length.
- No production deployment, custom domain, monitoring, or end-to-end test against Cloudflare is configured.
- No paid service has been enabled or purchased.

Do not expose user data or provider credentials until authentication, authorization, database policies, upload controls, monitoring, and production verification are complete.
