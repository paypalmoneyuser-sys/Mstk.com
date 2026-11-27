# MSTK.COM — Backend Foundation

This branch adds a small, dependency-free Cloudflare Worker API scaffold. It is not a complete application backend and is not deployed.

## Included

- Worker entry point at `src/index.js`
- Minimal `GET /api/health` endpoint
- Strict single-origin CORS when `ALLOWED_ORIGIN` is configured
- Baseline response security headers
- Node.js built-in tests
- Wrangler configuration

## Local checks

Requires Node.js 20 or newer.

```sh
npm test
npm run check
```

## Configuration

Set `ALLOWED_ORIGIN` to the exact HTTPS origin of the deployed MSTK frontend. Do not use `*`. Do not commit secrets or local `.dev.vars` files.

## Not implemented yet

- User authentication or session management
- Database or file storage
- AI provider adapters
- Usage metering or quotas
- Rate limiting / abuse controls
- Request body and upload size limits
- Billing or paid services
- Production deployment, domain, monitoring, and end-to-end tests

These must be designed and tested before user data or AI provider credentials are handled. No paid service has been enabled or purchased.
