# MSTK.COM — Backend and authentication foundation

This branch builds on the backend scaffold and adds a protected API boundary using Supabase asymmetric JWT verification. It remains a foundation, not a complete or deployed application.

## Included

- Cloudflare Worker API scaffold at `src/index.js`
- Public `GET /api/health`; protected `GET /api/me`
- Supabase JWKS signature verification for ES256 and RS256 access tokens
- Issuer, audience, role, subject, expiry, not-before, and issued-at checks
- Strict single-origin CORS, API security headers including HSTS, actual streamed request-body enforcement (1 MiB cap), fail-closed rate-limit binding
- Supabase schema migrations and PostgreSQL RLS / tenant-integrity smoke tests
- Browser UI for creating and listing workspaces, projects, conversations, and user messages through the Supabase REST API using the signed-in user's access token
- Manual blind A/B response comparison with randomized display order and a user-selected best response; no automatic provider calls
- Server-side `POST /api/ai/chat` adapter, disabled by default, requiring a verified user session
- AI adapter validates HTTPS endpoint configuration, limits prompts to 12,000 characters, uses a 30-second timeout, and returns generic provider errors

## Frontend configuration

For local hosting, copy `mstk-config.example.js` to `mstk-config.js` and fill in the Supabase project's HTTPS URL and its public publishable/anon key. The page loads `/mstk-config.js` before its application code. The real local config file is ignored by Git and must not be committed. If the API Worker is deployed on a separate origin, set `apiBase` to that exact HTTPS origin. These values are public browser configuration; never use a service-role key, signing secret, password, or provider API key here. This template does not create or configure a Supabase project.

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
- Account UI supports email/password sign-up, sign-in, sign-out, password-recovery email requests, and password reset from a Supabase recovery link. Access/refresh tokens remain in page memory only; refreshing the page signs the user out. Refresh-token rotation is used when an in-memory access token is close to expiry. Live Supabase authentication, recovery redirects, email delivery, and session refresh have not been production-verified.
- Workspace, project, conversation, and user-message UI operations are implemented against the existing Supabase schema and rely on its RLS policies, but have not been tested against a configured live Supabase project.
- The blind comparison tool is a manual paste-in preview; it does not invoke multiple AI providers, persist comparison results, or automatically judge answers.
- JWT verification has not been tested against a live Supabase project or real tokens.
- Live database connectivity and per-resource authorization have not been verified against a production Supabase project. Usage metering, quota enforcement, and provider-specific policy checks are not implemented.
- No user-facing prompt retention controls; do not send sensitive personal information. Provider processing and retention terms apply.
- The Cloudflare rate-limit binding and production frontend origin are not configured.
- Current API routes enforce the actual request-body bytes read, with a 1 MiB cap; any future upload/streaming feature needs its own bounded streaming/storage controls.
- No production deployment, custom domain, monitoring, or end-to-end Cloudflare test is configured. GitHub Actions is configured to run Node checks and PostgreSQL migration/RLS smoke tests for the relevant feature branches, but a passing run must be observed before claiming CI success.
- No paid service has been enabled or purchased.

Do not expose user data or provider credentials until authentication, authorization, database policies, upload controls, monitoring, and production verification are complete.


## Production readiness checklist

The repository is not ready for a public production launch yet. Complete and verify each item below before enabling public accounts or user data:

- [ ] Choose and control the final HTTPS website hostname; set the exact `ALLOWED_ORIGIN` value.
- [ ] Configure a Supabase project, use asymmetric ES256/RS256 signing, configure the exact allowed redirect URLs, and verify email/password sign-up, sign-in, sign-out, recovery email delivery, password reset, and token refresh end to end.
- [ ] Apply migrations to the intended Supabase project only after reviewing a backup/rollback plan; verify RLS using separate test accounts and confirm cross-user reads/writes are denied.
- [ ] Configure the Cloudflare Worker environment with `SUPABASE_URL`, `ALLOWED_ORIGIN`, and the `MSTK_RATE_LIMITER` binding; verify missing/failed rate limiting remains closed.
- [ ] Configure the static frontend with only the Supabase project URL and publishable/anon key. Never expose a service-role key, signing secret, or AI provider key in browser code.
- [ ] Configure and test the host-specific Content Security Policy and static-host response headers using the host-neutral template in `docs/FRONTEND-SECURITY.md`. The HTML, CSS, and application JavaScript are now external assets; replace the documented Supabase/API origin placeholders with exact production origins before enforcing CSP.
- [ ] Test the full deployment over HTTPS: health, authentication, protected API, workspace isolation, password recovery, rate limiting, error handling, mobile layout, and browser refresh/sign-out behavior.
- [ ] Set up error monitoring, uptime checks, backup/restore procedure, incident contact, privacy notice, terms, and a clear user-data retention/deletion process.
- [ ] Decide whether AI features will be enabled. Keep them disabled until provider terms, age requirements, privacy/retention, moderation, cost limits, quota enforcement, and abuse controls are reviewed for the intended audience. Do not enable services restricted to adults for a teen-facing service.
- [ ] Review accessibility, keyboard navigation, form labels, password-manager behavior, and browser compatibility.
- [ ] Re-run CI on the exact release commit and record a successful result before release.

Do not put passwords, OTPs, API keys, service-role keys, signing secrets, or payment details in GitHub issues, commits, or chat. Configure secrets directly in the relevant provider dashboard. No deployment, paid service, or production credential has been configured by this checklist.
