# Authentication and session security foundation

This branch adds a protected API boundary using Supabase asymmetric JWT signing keys.

## Configuration

Set `SUPABASE_URL` to the exact HTTPS project URL in the Worker environment. The Worker derives the issuer and JWKS URL from that value. Do not add the Supabase service-role key or JWT signing secret to this Worker configuration.

Supabase Auth must be configured to issue asymmetric access-token signatures (ES256 or RS256) and expose its JWKS endpoint. Legacy shared-secret HS256 tokens are intentionally rejected.

## Implemented in this branch

- Bearer-token parsing for protected `/api/*` routes (health remains public).
- JWKS signature verification for ES256 and RS256.
- Issuer, audience, role, subject UUID, expiry, not-before, and issued-at checks.
- Five-minute in-isolate JWKS cache.
- Protected `GET /api/me` endpoint returning only the authenticated user ID and role.
- Fail-closed behavior if Supabase configuration or JWKS verification is unavailable.
- Existing origin, rate-limit binding, and declared request-size guards retained.

## Still required before production

- Configure Supabase Auth asymmetric signing keys and validate the live project JWKS.
- Verify behavior against real Supabase-issued access and refresh tokens.
- Configure Cloudflare rate-limiting binding and real frontend origin.
- Add authorization checks for each workspace/resource operation and ensure database access uses the verified identity (never trust client-supplied user IDs).
- Add invitation, account recovery, email verification, logout/revocation, and session lifecycle flows in the frontend.
- Add streamed request-byte enforcement for future upload/body handlers.
- Run integration, penetration, dependency, and production end-to-end tests.
- Review privacy, retention, and guardian/age-appropriate account requirements.

This is an authentication foundation, not a complete login system or security certification.
