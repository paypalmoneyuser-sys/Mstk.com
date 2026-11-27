# MSTK.COM — Backend Foundation

This branch adds a dependency-free Cloudflare Worker API scaffold with baseline request protections. It is not a complete application backend and is not deployed.

## Included

- Worker entry point at `src/index.js`
- Minimal `GET /api/health` endpoint
- Strict single-origin CORS when `ALLOWED_ORIGIN` is configured
- Baseline response security headers
- Fail-closed Cloudflare Rate Limiting binding requirement for non-health API routes
- One-MiB declared request-body limit; body-bearing API requests must send Content-Length
- SHA-256-derived client rate-limit keys (raw client IP is not used as the binding key)
- Node.js built-in tests for allowed, exceeded, missing, and failing rate-limit binding cases

## Local checks

Requires Node.js 20 or newer.

```sh
npm test
npm run check
```

## Configuration

Set `ALLOWED_ORIGIN` to the exact HTTPS origin of the deployed MSTK frontend. Do not use `*`.

Before enabling any non-health API route, configure the Cloudflare Rate Limiting binding named `MSTK_RATE_LIMITER` in the Worker settings. The application deliberately returns HTTP 503 when this binding is missing or unavailable. Configure an appropriate limit and period for the route's risk and expected usage; do not assume the local test binding represents production enforcement.

Store provider credentials only as Cloudflare Worker secrets, for example with `wrangler secret put PROVIDER_API_KEY`. Read them only from the server-side Worker `env`; never place real credentials in frontend code, source files, committed `.env` files, logs, or client responses. No provider key is required or included by this scaffold. Keep local secret files such as `.dev.vars` out of Git.

## Current limitations

- Authentication, JWT verification, and session management are not implemented.
- No database, file storage, or AI provider adapter is connected.
- The request-size guard requires a valid Content-Length header and limits its declared value; every future streaming/upload handler must also enforce a byte-count limit while reading the stream.
- Rate limiting is only active when the Cloudflare binding is configured in the deployed Worker. This repository change does not create a Cloudflare account, namespace, binding, or deployment.
- No production deployment, domain, monitoring, or end-to-end test against Cloudflare is configured.
- No paid service has been enabled or purchased.

Do not expose user data or provider credentials until authentication, authorization, database policies, upload controls, monitoring, and production verification are complete.
